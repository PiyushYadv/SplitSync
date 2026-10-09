package com.splitsync.dto.invitation;

import java.time.Instant;
import java.util.UUID;

import com.splitsync.dto.common.UserSummary;
import com.splitsync.entity.enums.InvitationStatus;

public record InvitationResponse(
        UUID id,
        UUID groupId,
        String groupName,
        String emoji,
        UserSummary invitedBy,
        UserSummary invitedUser,
        long memberCount,
        String preview,
        InvitationStatus status,
        Instant createdAt) {
}
