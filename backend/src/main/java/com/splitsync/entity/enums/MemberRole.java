package com.splitsync.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;

import jakarta.persistence.Converter;

public enum MemberRole implements DbEnum {
    OWNER("owner"),
    ADMIN("admin"),
    MEMBER("member");

    private final String dbValue;

    MemberRole(String dbValue) {
        this.dbValue = dbValue;
    }

    @Override
    @JsonValue
    public String dbValue() {
        return dbValue;
    }

    @Converter(autoApply = true)
    public static class JpaConverter extends DbEnumConverter<MemberRole> {
        public JpaConverter() {
            super(MemberRole.class);
        }
    }
}
