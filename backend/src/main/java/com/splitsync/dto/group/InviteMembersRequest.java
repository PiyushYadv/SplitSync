package com.splitsync.dto.group;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record InviteMembersRequest(
        @NotEmpty(message = "Select at least one user to invite")
        @Size(max = 50, message = "You can invite at most 50 members at once")
        List<UUID> userIds) {
}
