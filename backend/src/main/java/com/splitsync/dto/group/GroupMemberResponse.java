package com.splitsync.dto.group;

import java.math.BigDecimal;
import java.util.UUID;

import com.splitsync.dto.common.UserSummary;
import com.splitsync.entity.enums.MemberRole;

public record GroupMemberResponse(
        UUID id,
        String name,
        String email,
        String username,
        String initials,
        String color,
        String avatarUrl,
        MemberRole role,
        BigDecimal balance) {

    public static GroupMemberResponse of(UserSummary user, MemberRole role, BigDecimal balance) {
        return new GroupMemberResponse(user.id(), user.name(), user.email(), user.username(), user.initials(),
                user.color(), user.avatarUrl(), role, balance);
    }
}
