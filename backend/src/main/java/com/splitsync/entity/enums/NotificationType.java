package com.splitsync.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;

import jakarta.persistence.Converter;

public enum NotificationType implements DbEnum {
    EXPENSE("expense"),
    SETTLEMENT("settlement"),
    INVITE("invite"),
    REMINDER("reminder");

    private final String dbValue;

    NotificationType(String dbValue) {
        this.dbValue = dbValue;
    }

    @Override
    @JsonValue
    public String dbValue() {
        return dbValue;
    }

    @Converter(autoApply = true)
    public static class JpaConverter extends DbEnumConverter<NotificationType> {
        public JpaConverter() {
            super(NotificationType.class);
        }
    }
}
