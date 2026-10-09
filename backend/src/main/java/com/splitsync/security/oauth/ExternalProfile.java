package com.splitsync.security.oauth;

import com.splitsync.entity.enums.AuthProvider;

/** What SplitSync needs from a Google or GitHub account. */
public record ExternalProfile(AuthProvider provider, String subject, String email, boolean emailVerified,
        String name, String avatarUrl) {
}
