package com.splitsync.dto.settings;

import java.util.Map;

public record SettingsResponse(
        Profile profile,
        Map<String, Boolean> notifications,
        String currency,
        String theme,
        String language,
        String dateFormat) {

    public record Profile(String name, String email, String username, String avatarUrl) {
    }
}
