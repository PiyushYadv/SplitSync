package com.splitsync.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;

import jakarta.persistence.Converter;

public enum GroupStatus implements DbEnum {
    ACTIVE("active"),
    SETTLED("settled"),
    ARCHIVED("archived");

    private final String dbValue;

    GroupStatus(String dbValue) {
        this.dbValue = dbValue;
    }

    @Override
    @JsonValue
    public String dbValue() {
        return dbValue;
    }

    @Converter(autoApply = true)
    public static class JpaConverter extends DbEnumConverter<GroupStatus> {
        public JpaConverter() {
            super(GroupStatus.class);
        }
    }
}
