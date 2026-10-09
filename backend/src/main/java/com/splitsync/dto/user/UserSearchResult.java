package com.splitsync.dto.user;

import java.util.UUID;

import com.splitsync.dto.common.UserSummary;

/** {@code mutualCount} is the number of friends you have in common; {@code friend} means you share a group. */
public record UserSearchResult(UUID id, String name, String username, String initials, String color,
        String avatarUrl, long mutualCount, boolean friend) {

    public static UserSearchResult of(UserSummary user, long mutualCount, boolean friend) {
        return new UserSearchResult(user.id(), user.name(), user.username(), user.initials(), user.color(),
                user.avatarUrl(), mutualCount, friend);
    }
}
