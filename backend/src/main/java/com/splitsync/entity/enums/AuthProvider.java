package com.splitsync.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;

import jakarta.persistence.Converter;

/** External sign-in providers. The db value doubles as the Spring Security client registration id. */
public enum AuthProvider implements DbEnum {
    GOOGLE("google"),
    GITHUB("github");

    private final String dbValue;

    AuthProvider(String dbValue) {
        this.dbValue = dbValue;
    }

    @Override
    @JsonValue
    public String dbValue() {
        return dbValue;
    }

    public static AuthProvider fromRegistrationId(String registrationId) {
        for (AuthProvider provider : values()) {
            if (provider.dbValue.equals(registrationId)) {
                return provider;
            }
        }
        throw new IllegalArgumentException("Unknown provider " + registrationId);
    }

    @Converter(autoApply = true)
    public static class JpaConverter extends DbEnumConverter<AuthProvider> {
        public JpaConverter() {
            super(AuthProvider.class);
        }
    }
}
