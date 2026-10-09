package com.splitsync.dto.user;

import java.util.UUID;

import com.splitsync.dto.common.UserSummary;

public record FriendResponse(UUID id, String name, String username, String initials, String color,
        String avatarUrl, long sharedGroupCount) {

    public static FriendResponse of(UserSummary user, long sharedGroupCount) {
        return new FriendResponse(user.id(), user.name(), user.username(), user.initials(), user.color(),
                user.avatarUrl(), sharedGroupCount);
    }
}
