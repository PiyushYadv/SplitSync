package com.splitsync.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;

import jakarta.persistence.Converter;

public enum InvitationStatus implements DbEnum {
    PENDING("pending"),
    ACCEPTED("accepted"),
    DECLINED("declined");

    private final String dbValue;

    InvitationStatus(String dbValue) {
        this.dbValue = dbValue;
    }

    @Override
    @JsonValue
    public String dbValue() {
        return dbValue;
    }

    @Converter(autoApply = true)
    public static class JpaConverter extends DbEnumConverter<InvitationStatus> {
        public JpaConverter() {
            super(InvitationStatus.class);
        }
    }
}
