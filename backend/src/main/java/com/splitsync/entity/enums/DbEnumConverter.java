package com.splitsync.entity.enums;

import java.util.Arrays;

import jakarta.persistence.AttributeConverter;

public abstract class DbEnumConverter<E extends Enum<E> & DbEnum> implements AttributeConverter<E, String> {

    private final Class<E> type;

    protected DbEnumConverter(Class<E> type) {
        this.type = type;
    }

    @Override
    public String convertToDatabaseColumn(E attribute) {
        return attribute == null ? null : attribute.dbValue();
    }

    @Override
    public E convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return Arrays.stream(type.getEnumConstants())
                .filter(e -> e.dbValue().equals(dbData))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown " + type.getSimpleName() + ": " + dbData));
    }
}
