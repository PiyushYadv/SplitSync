package com.splitsync.service;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.splitsync.dto.settings.SettingsResponse;
import com.splitsync.entity.User;
import com.splitsync.entity.UserSettings;
import com.splitsync.exception.ApiException;
import com.splitsync.exception.ApiExceptions;
import com.splitsync.exception.ErrorCode;
import com.splitsync.repository.UserRepository;
import com.splitsync.repository.UserSettingsRepository;
import com.splitsync.util.Currencies;

import lombok.RequiredArgsConstructor;

/**
 * Settings are saved one UI section at a time ({@code PATCH /me/settings {section, values}}). Each section
 * accepts only its own keys; unknown keys are rejected rather than silently ignored.
 */
@Service
@RequiredArgsConstructor
public class SettingsService {

    private static final Pattern USERNAME = Pattern.compile("[a-z0-9][a-z0-9._]{2,29}");
    private static final Set<String> NOTIFICATION_KEYS = Set.of("expense", "settlement", "reminder", "digest");
    private static final Set<String> THEMES = Set.of("system", "light", "dark");
    private static final Set<String> DATE_FORMATS = Set.of("MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD");

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionRevocationService sessionRevocationService;

    @Transactional
    public SettingsResponse get(UUID userId) {
        User user = loadUser(userId);
        return toResponse(user, settingsOf(user));
    }

    /**
     * @param currentSessionId kept alive when a password change signs out the user's other sessions
     */
    @Transactional
    public SettingsResponse update(UUID userId, String section, Map<String, Object> values, String currentSessionId) {
        User user = loadUser(userId);
        UserSettings settings = settingsOf(user);

        switch (section) {
            case "profile" -> updateProfile(user, values);
            case "notifications" -> updateNotifications(settings, values);
            case "currency" -> {
                requireOnly(values, Set.of("currency"));
                String currency = Currencies.normalize(requireString(values, "currency", 3), "currency");
                settings.setCurrency(currency);
                user.setDefaultCurrency(currency);
            }
            case "appearance" -> updateAppearance(settings, values);
            case "security" -> changePassword(user, values, currentSessionId);
            default -> throw ApiExceptions.invalidField("section", "Unknown settings section '" + section + "'");
        }
        return toResponse(user, settings);
    }

    private void updateProfile(User user, Map<String, Object> values) {
        requireOnly(values, Set.of("name", "username", "avatarUrl"));
        if (values.containsKey("name")) {
            String name = requireString(values, "name", 255).trim();
            if (name.isEmpty()) {
                throw ApiExceptions.invalidField("name", "Name is required");
            }
            user.setName(name);
        }
        if (values.containsKey("username")) {
            String username = requireString(values, "username", 31).trim().toLowerCase(Locale.ROOT);
            if (username.startsWith("@")) {
                username = username.substring(1);
            }
            if (!USERNAME.matcher(username).matches()) {
                throw ApiExceptions.invalidField("username",
                        "Use 3-30 lowercase letters, numbers, dots or underscores, starting with a letter or number");
            }
            if (!username.equals(user.getUsername()) && userRepository.existsByUsername(username)) {
                throw new ApiException(HttpStatus.CONFLICT, ErrorCode.USERNAME_TAKEN, "That username is taken",
                        Map.of("username", "That username is taken"));
            }
            user.setUsername(username);
        }
        if (values.containsKey("avatarUrl")) {
            Object raw = values.get("avatarUrl");
            String url = raw == null ? null : requireString(values, "avatarUrl", 1024).trim();
            if (url != null && !url.isEmpty() && !url.startsWith("https://") && !url.startsWith("http://")) {
                throw ApiExceptions.invalidField("avatarUrl", "Avatar must be an http(s) URL");
            }
            user.setAvatarUrl(url == null || url.isEmpty() ? null : url);
        }
    }

    private static void updateNotifications(UserSettings settings, Map<String, Object> values) {
        requireOnly(values, NOTIFICATION_KEYS);
        Map<String, Boolean> prefs = new LinkedHashMap<>(settings.getNotificationPreferences());
        values.forEach((key, value) -> {
            if (!(value instanceof Boolean enabled)) {
                throw ApiExceptions.invalidField(key, key + " must be true or false");
            }
            prefs.put(key, enabled);
        });
        // Replace the map so Hibernate sees the JSON column as changed.
        settings.setNotificationPreferences(prefs);
    }

    private static void updateAppearance(UserSettings settings, Map<String, Object> values) {
        requireOnly(values, Set.of("theme", "language", "dateFormat"));
        if (values.containsKey("theme")) {
            String theme = requireString(values, "theme", 20);
            if (!THEMES.contains(theme)) {
                throw ApiExceptions.invalidField("theme", "Theme must be system, light or dark");
            }
            settings.setTheme(theme);
        }
        if (values.containsKey("language")) {
            String language = requireString(values, "language", 50).trim();
            if (language.isEmpty()) {
                throw ApiExceptions.invalidField("language", "Language is required");
            }
            settings.setLanguage(language);
        }
        if (values.containsKey("dateFormat")) {
            String dateFormat = requireString(values, "dateFormat", 20);
            if (!DATE_FORMATS.contains(dateFormat)) {
                throw ApiExceptions.invalidField("dateFormat", "Date format must be one of " + DATE_FORMATS);
            }
            settings.setDateFormat(dateFormat);
        }
    }

    /**
     * Changing the password signs the user out everywhere except the session that made the change. Accounts
     * created with Google or GitHub have no password yet and can set one without a current password.
     */
    private void changePassword(User user, Map<String, Object> values, String currentSessionId) {
        boolean hasPassword = user.getPasswordHash() != null;
        requireOnly(values, hasPassword ? Set.of("currentPassword", "newPassword") : Set.of("newPassword"));
        if (hasPassword) {
            String current = requireString(values, "currentPassword", 72);
            if (!passwordEncoder.matches(current, user.getPasswordHash())) {
                throw ApiExceptions.invalidField("currentPassword", "Current password is incorrect");
            }
        }
        String next = requireString(values, "newPassword", 72);
        if (next.length() < 8) {
            throw ApiExceptions.invalidField("newPassword", "Password must be 8-72 characters");
        }
        user.setPasswordHash(passwordEncoder.encode(next));
        sessionRevocationService.revokeAll(user.getId(), currentSessionId);
    }

    private User loadUser(UUID userId) {
        return userRepository.findById(userId).orElseThrow(() -> ApiExceptions.notFound("User"));
    }

    private UserSettings settingsOf(User user) {
        return userSettingsRepository.findById(user.getId())
                .orElseGet(() -> userSettingsRepository.save(new UserSettings(user)));
    }

    private static void requireOnly(Map<String, Object> values, Set<String> allowed) {
        for (String key : values.keySet()) {
            if (!allowed.contains(key)) {
                throw ApiExceptions.invalidField(key, "'" + key + "' can't be changed in this section");
            }
        }
    }

    private static String requireString(Map<String, Object> values, String key, int maxLength) {
        if (!(values.get(key) instanceof String value)) {
            throw ApiExceptions.invalidField(key, key + " must be a string");
        }
        if (value.length() > maxLength) {
            throw ApiExceptions.invalidField(key, key + " must be at most " + maxLength + " characters");
        }
        return value;
    }

    private static SettingsResponse toResponse(User user, UserSettings settings) {
        String handle = user.getUsername() == null ? null : "@" + user.getUsername();
        return new SettingsResponse(
                new SettingsResponse.Profile(user.getName(), user.getEmail(), handle, user.getAvatarUrl(),
                        user.isEmailVerified(), user.getPasswordHash() != null),
                settings.getNotificationPreferences(),
                settings.getCurrency(),
                settings.getTheme(),
                settings.getLanguage(),
                settings.getDateFormat());
    }
}
