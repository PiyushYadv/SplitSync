package com.splitsync.dto.auth;

import java.util.UUID;

import com.splitsync.entity.User;

public record UserResponse(UUID id, String name, String email, String username, String avatarUrl,
        boolean emailVerified) {

    public static UserResponse from(User user) {
        String handle = user.getUsername() == null ? null : "@" + user.getUsername();
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), handle, user.getAvatarUrl(),
                user.isEmailVerified());
    }
}
