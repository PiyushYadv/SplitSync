package com.splitsync.service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.splitsync.dto.common.UserSummary;
import com.splitsync.dto.invitation.InvitationResponse;
import com.splitsync.entity.Expense;
import com.splitsync.entity.ExpenseGroup;
import com.splitsync.entity.GroupMember;
import com.splitsync.entity.Invitation;
import com.splitsync.entity.enums.InvitationStatus;
import com.splitsync.entity.enums.MemberRole;
import com.splitsync.entity.enums.NotificationType;
import com.splitsync.exception.ApiExceptions;
import com.splitsync.exception.ErrorCode;
import com.splitsync.repository.ExpenseRepository;
import com.splitsync.repository.GroupMemberRepository;
import com.splitsync.repository.InvitationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ExpenseRepository expenseRepository;
    private final GroupAccessService groupAccessService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<InvitationResponse> listForUser(UUID userId, InvitationStatus status) {
        return invitationRepository.findByInvitedUserIdAndStatusOrderByCreatedAtDesc(userId, status).stream()
                .map(inv -> toResponse(inv, userId))
                .toList();
    }

    /** Idempotent for an already-accepted invitation. */
    @Transactional
    public InvitationResponse accept(UUID invitationId, UUID userId) {
        Invitation invitation = lockAndLoad(invitationId, userId);
        if (invitation.getStatus() == InvitationStatus.ACCEPTED) {
            return toResponse(invitation, userId);
        }
        requirePending(invitation);

        ExpenseGroup group = invitation.getGroup();
        if (!groupAccessService.isMember(group.getId(), userId)) {
            group.getMembers().add(new GroupMember(group, invitation.getInvitedUser(), MemberRole.MEMBER));
        }
        invitation.setStatus(InvitationStatus.ACCEPTED);
        group.setUpdatedAt(Instant.now());

        auditService.record(group, invitation.getInvitedUser(), "invitation.accepted",
                Map.of("invitationId", invitation.getId().toString()));
        notificationService.notify(invitation.getInvitedBy(), NotificationType.INVITE,
                invitation.getInvitedUser().getName() + " joined " + group.getName(),
                "Your invitation was accepted",
                Map.of("groupId", group.getId().toString(), "invitationId", invitation.getId().toString()));
        invitationRepository.flush();
        return toResponse(invitation, userId);
    }

    /** Idempotent for an already-declined invitation. */
    @Transactional
    public InvitationResponse decline(UUID invitationId, UUID userId) {
        Invitation invitation = lockAndLoad(invitationId, userId);
        if (invitation.getStatus() == InvitationStatus.DECLINED) {
            return toResponse(invitation, userId);
        }
        requirePending(invitation);
        invitation.setStatus(InvitationStatus.DECLINED);
        auditService.record(invitation.getGroup(), invitation.getInvitedUser(), "invitation.declined",
                Map.of("invitationId", invitation.getId().toString()));
        invitationRepository.flush();
        return toResponse(invitation, userId);
    }

    InvitationResponse toResponse(Invitation invitation, UUID currentUserId) {
        ExpenseGroup group = invitation.getGroup();
        String preview = expenseRepository.findTop3ByGroupIdOrderByOccurredAtDesc(group.getId()).stream()
                .map(Expense::getTitle)
                .collect(Collectors.joining(", "));
        return new InvitationResponse(
                invitation.getId(),
                group.getId(),
                group.getName(),
                group.getEmoji(),
                UserSummary.from(invitation.getInvitedBy(), currentUserId),
                UserSummary.from(invitation.getInvitedUser(), currentUserId),
                groupMemberRepository.countByIdGroupId(group.getId()),
                preview.isEmpty() ? null : preview + "…",
                invitation.getStatus(),
                invitation.getCreatedAt());
    }

    /** Only the invitee can act on an invitation; anyone else gets 404. */
    private Invitation lockAndLoad(UUID invitationId, UUID userId) {
        UUID groupId = invitationRepository.findGroupIdByIdAndInvitedUserId(invitationId, userId)
                .orElseThrow(() -> ApiExceptions.notFound("Invitation"));
        groupAccessService.lock(groupId);
        return invitationRepository.findById(invitationId).orElseThrow(() -> ApiExceptions.notFound("Invitation"));
    }

    private static void requirePending(Invitation invitation) {
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw ApiExceptions.conflict(ErrorCode.INVITATION_NOT_PENDING,
                    "This invitation was already " + invitation.getStatus().dbValue());
        }
    }
}
