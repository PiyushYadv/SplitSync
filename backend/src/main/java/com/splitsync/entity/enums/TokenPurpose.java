package com.splitsync.entity.enums;

import java.time.Duration;

import jakarta.persistence.Converter;

public enum TokenPurpose implements DbEnum {
    EMAIL_VERIFICATION("email_verification", Duration.ofHours(24)),
    PASSWORD_RESET("password_reset", Duration.ofMinutes(30)),
    EMAIL_CHANGE("email_change", Duration.ofHours(24));

    private final String dbValue;
    private final Duration lifetime;

    TokenPurpose(String dbValue, Duration lifetime) {
        this.dbValue = dbValue;
        this.lifetime = lifetime;
    }

    @Override
    public String dbValue() {
        return dbValue;
    }

    public Duration lifetime() {
        return lifetime;
    }

    @Converter(autoApply = true)
    public static class JpaConverter extends DbEnumConverter<TokenPurpose> {
        public JpaConverter() {
            super(TokenPurpose.class);
        }
    }
}
