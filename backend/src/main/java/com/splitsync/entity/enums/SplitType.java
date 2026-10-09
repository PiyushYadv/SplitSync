package com.splitsync.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;

import jakarta.persistence.Converter;

public enum SplitType implements DbEnum {
    EQUAL("equal"),
    EXACT("exact"),
    PERCENTAGE("percentage");

    private final String dbValue;

    SplitType(String dbValue) {
        this.dbValue = dbValue;
    }

    @Override
    @JsonValue
    public String dbValue() {
        return dbValue;
    }

    @Converter(autoApply = true)
    public static class JpaConverter extends DbEnumConverter<SplitType> {
        public JpaConverter() {
            super(SplitType.class);
        }
    }
}
