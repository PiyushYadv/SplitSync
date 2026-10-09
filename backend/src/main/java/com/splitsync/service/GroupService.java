package com.splitsync.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.splitsync.dto.common.UserSummary;
import com.splitsync.dto.expense.ExpenseResponse;
import com.splitsync.dto.group.CreateGroupRequest;
import com.splitsync.dto.group.GroupDetailResponse;
import com.splitsync.dto.group.GroupMemberResponse;
import com.splitsync.dto.group.GroupSummaryResponse;
import com.splitsync.dto.invitation.InvitationResponse;
import com.splitsync.dto.settlement.SettlementResponse;
import com.splitsync.entity.Expense;
import com.splitsync.entity.ExpenseGroup;
import com.splitsync.entity.GroupMember;
import com.splitsync.entity.Invitation;
import com.splitsync.entity.User;
import com.splitsync.entity.enums.GroupStatus;
import com.splitsync.entity.enums.InvitationStatus;
import com.splitsync.entity.enums.MemberRole;
import com.splitsync.entity.enums.NotificationType;
import com.splitsync.entity.enums.SettlementStatus;
import com.splitsync.exception.ApiExceptions;
import com.splitsync.exception.ErrorCode;
import com.splitsync.repository.ExpenseGroupRepository;
import com.splitsync.repository.ExpenseRepository;
import com.splitsync.repository.GroupMemberRepository;
import com.splitsync.repository.InvitationRepository;
import com.splitsync.repository.SettlementRepository;
import com.splitsync.repository.UserRepository;
import com.splitsync.repository.projection.GroupCount;
import com.splitsync.repository.projection.GroupSpend;
import com.splitsync.util.Currencies;
import com.splitsync.util.Money;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final ExpenseGroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ExpenseRepository expenseRepository;
    private final SettlementRepository settlementRepository;
    private final InvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final GroupAccessService groupAccessService;
    private final BalanceService balanceService;
    private final InvitationService invitationService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<GroupSummaryResponse> listForUser(UUID userId) {
        List<ExpenseGroup> groups = groupRepository.findAllForMember(userId);
        List<UUID> ids = groups.stream().map(ExpenseGroup::getId).toList();
        if (ids.isEmpty()) {
            return List.of();
        }

        Map<UUID, Long> memberCounts = groupMemberRepository.countByGroupIds(ids).stream()
                .collect(Collectors.toMap(GroupCount::groupId, GroupCount::count));
        Map<UUID, GroupSpend> spend = expenseRepository.sumSpendByGroupIds(ids).stream()
                .collect(Collectors.toMap(GroupSpend::groupId, Function.identity()));
        Map<UUID, Map<UUID, BigDecimal>> nets = balanceService.netBalances(ids);

        return groups.stream().map(group -> {
            GroupSpend groupSpend = spend.get(group.getId());
            Map<UUID, BigDecimal> groupNets = nets.getOrDefault(group.getId(), Map.of());
            BigDecimal totalSpend = groupSpend == null ? Money.of(BigDecimal.ZERO) : Money.of(groupSpend.total());
            return new GroupSummaryResponse(
                    group.getId(),
                    group.getName(),
                    group.getEmoji(),
                    group.getColor(),
                    group.getBaseCurrency(),
                    memberCounts.getOrDefault(group.getId(), 0L),
                    totalSpend,
                    groupNets.getOrDefault(userId, Money.of(BigDecimal.ZERO)),
                    displayStatus(group, groupNets, groupSpend != null),
                    group.getUpdatedAt());
        }).toList();
    }

    @Transactional
    public GroupDetailResponse create(UUID userId, CreateGroupRequest request) {
        User creator = userRepository.findById(userId).orElseThrow(() -> ApiExceptions.notFound("User"));

        ExpenseGroup group = new ExpenseGroup();
        group.setName(request.name().trim());
        group.setEmoji(request.emoji().trim());
        group.setColor(request.color());
        group.setBaseCurrency(request.baseCurrency() == null
                ? creator.getDefaultCurrency()
                : Currencies.normalize(request.baseCurrency(), "baseCurrency"));
        group.setCreatedBy(creator);
        groupRepository.save(group);
        group.getMembers().add(new GroupMember(group, creator, MemberRole.OWNER));
        groupRepository.flush();

        auditService.record(group, creator, "group.created", Map.of("name", group.getName()));
        if (request.memberIds() != null && !request.memberIds().isEmpty()) {
            inviteUsers(group, creator, request.memberIds(), "memberIds");
        }
        return detail(group, userId);
    }

    @Transactional(readOnly = true)
    public GroupDetailResponse get(UUID groupId, UUID userId) {
        return detail(groupAccessService.requireMember(groupId, userId), userId);
    }

    @Transactional
    public List<InvitationResponse> invite(UUID groupId, UUID userId, List<UUID> userIds) {
        ExpenseGroup group = groupAccessService.lockForMember(groupId, userId);
        User inviter = userRepository.findById(userId).orElseThrow(() -> ApiExceptions.notFound("User"));
        List<Invitation> invitations = inviteUsers(group, inviter, userIds, "userIds");
        return invitations.stream().map(inv -> invitationService.toResponse(inv, userId)).toList();
    }

    /**
     * Leaving requires a zero balance in the group. If the owner leaves, the longest-standing member becomes
     * owner; if the last member leaves, the group and its history are deleted.
     */
    @Transactional
    public void leave(UUID groupId, UUID userId) {
        ExpenseGroup group = groupAccessService.lockForMember(groupId, userId);
        BigDecimal balance = balanceService.netBalances(groupId).getOrDefault(userId, BigDecimal.ZERO);
        if (balance.signum() != 0) {
            throw ApiExceptions.conflict(ErrorCode.OUTSTANDING_BALANCE,
                    "Settle your balance of " + group.getBaseCurrency() + " " + Money.of(balance)
                            + " before leaving this group");
        }

        GroupMember leaving = group.getMembers().stream()
                .filter(m -> m.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> ApiExceptions.notFound("Group"));
        group.getMembers().remove(leaving);

        if (group.getMembers().isEmpty()) {
            groupRepository.delete(group);
            return;
        }
        if (leaving.getRole() == MemberRole.OWNER) {
            group.getMembers().stream()
                    .min(Comparator.comparing(GroupMember::getJoinedAt))
                    .ifPresent(successor -> successor.setRole(MemberRole.OWNER));
        }
        group.setUpdatedAt(Instant.now());
        auditService.record(group, leaving.getUser(), "group.member_left", Map.of("userId", userId.toString()));
    }

    private List<Invitation> inviteUsers(ExpenseGroup group, User inviter, Collection<UUID> requestedIds,
            String field) {
        Set<UUID> ids = new LinkedHashSet<>(requestedIds);
        ids.remove(inviter.getId());
        Map<UUID, User> users = userRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        if (users.size() != ids.size()) {
            throw ApiExceptions.invalidField(field, "Some of the selected users do not exist");
        }
        Set<UUID> memberIds = group.getMembers().stream().map(m -> m.getUser().getId()).collect(Collectors.toSet());

        List<Invitation> result = new ArrayList<>();
        List<String> invitedIds = new ArrayList<>();
        for (UUID id : ids) {
            if (memberIds.contains(id)) {
                continue;
            }
            Invitation invitation = invitationRepository
                    .findByGroupIdAndInvitedUserIdAndStatus(group.getId(), id, InvitationStatus.PENDING)
                    .orElse(null);
            if (invitation == null) {
                invitation = new Invitation();
                invitation.setGroup(group);
                invitation.setInvitedBy(inviter);
                invitation.setInvitedUser(users.get(id));
                invitationRepository.save(invitation);
                invitedIds.add(id.toString());
                notificationService.notify(users.get(id), NotificationType.INVITE,
                        inviter.getName() + " invited you to " + group.getName(), group.getEmoji() + " " + group.getName(),
                        Map.of("groupId", group.getId().toString(), "invitationId", invitation.getId().toString()));
            }
            result.add(invitation);
        }
        if (!invitedIds.isEmpty()) {
            auditService.record(group, inviter, "group.members_invited", Map.of("userIds", invitedIds));
        }
        return result;
    }

    private GroupDetailResponse detail(ExpenseGroup group, UUID userId) {
        Map<UUID, BigDecimal> nets = balanceService.netBalances(group.getId());
        BigDecimal zero = Money.of(BigDecimal.ZERO);

        List<GroupMemberResponse> members = groupMemberRepository.findByIdGroupIdOrderByJoinedAtAsc(group.getId())
                .stream()
                .map(m -> GroupMemberResponse.of(UserSummary.from(m.getUser(), userId), m.getRole(),
                        nets.getOrDefault(m.getUser().getId(), zero)))
                .toList();
        List<Expense> expenses = expenseRepository.findByGroupIdOrderByOccurredAtDescIdDesc(group.getId());
        List<SettlementResponse> settlements = settlementRepository
                .findByGroupIdAndStatusInOrderByCreatedAtDesc(group.getId(),
                        List.of(SettlementStatus.PENDING, SettlementStatus.PAID))
                .stream().map(s -> SettlementResponse.from(s, userId)).toList();
        BigDecimal totalSpend = Money.of(expenses.stream().map(Expense::getBaseAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        return new GroupDetailResponse(
                group.getId(),
                group.getName(),
                group.getEmoji(),
                group.getColor(),
                group.getBaseCurrency(),
                displayStatus(group, nets, !expenses.isEmpty()),
                members,
                expenses.stream().map(e -> ExpenseResponse.from(e, userId)).toList(),
                settlements,
                totalSpend,
                nets.getOrDefault(userId, zero),
                group.getCreatedAt(),
                group.getUpdatedAt());
    }

    /** "settled" is derived, never stored: the group has expenses and every balance is back to zero. */
    private static String displayStatus(ExpenseGroup group, Map<UUID, BigDecimal> nets, boolean hasExpenses) {
        if (group.getStatus() == GroupStatus.ARCHIVED) {
            return GroupStatus.ARCHIVED.dbValue();
        }
        boolean allSettled = nets.values().stream().allMatch(amount -> amount.signum() == 0);
        return hasExpenses && allSettled ? GroupStatus.SETTLED.dbValue() : GroupStatus.ACTIVE.dbValue();
    }
}
