package com.splitsync.dto.common;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import com.splitsync.entity.User;

/**
 * Public view of a user. Email is only included for the requesting user themselves, so group members
 * can't harvest each other's addresses.
 */
public record UserSummary(UUID id, String name, String email, String username, String initials, String color,
        String avatarUrl) {

    private static final List<String> PALETTE = List.of(
            "#f43f5e", "#10b981", "#6366f1", "#f59e0b", "#ec4899", "#0ea5e9", "#8b5cf6", "#06b6d4");

    public static UserSummary from(User user, UUID currentUserId) {
        String email = user.getId().equals(currentUserId) ? user.getEmail() : null;
        String handle = user.getUsername() == null ? null : "@" + user.getUsername();
        return new UserSummary(user.getId(), user.getName(), email, handle, initials(user.getName()),
                colorFor(user.getId()), user.getAvatarUrl());
    }

    static String initials(String name) {
        String[] parts = Arrays.stream(name.trim().split("\\s+")).filter(p -> !p.isEmpty()).toArray(String[]::new);
        if (parts.length == 0) {
            return "?";
        }
        String result = parts.length == 1
                ? parts[0].substring(0, Math.min(2, parts[0].length()))
                : parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1);
        return result.toUpperCase(Locale.ROOT);
    }

    static String colorFor(UUID id) {
        return PALETTE.get(Math.floorMod(id.hashCode(), PALETTE.size()));
    }
}
