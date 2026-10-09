package com.splitsync.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;

import jakarta.persistence.Converter;

public enum SettlementStatus implements DbEnum {
    PENDING("pending"),
    PAID("paid"),
    CANCELLED("cancelled");

    private final String dbValue;

    SettlementStatus(String dbValue) {
        this.dbValue = dbValue;
    }

    @Override
    @JsonValue
    public String dbValue() {
        return dbValue;
    }

    @Converter(autoApply = true)
    public static class JpaConverter extends DbEnumConverter<SettlementStatus> {
        public JpaConverter() {
            super(SettlementStatus.class);
        }
    }
}
