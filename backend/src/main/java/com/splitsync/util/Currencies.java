package com.splitsync.util;

import java.util.Currency;
import java.util.Locale;

import com.splitsync.exception.ApiExceptions;

public final class Currencies {

    private Currencies() {
    }

    /** Upper-cases and validates an ISO 4217 code, reporting failures against {@code field}. */
    public static String normalize(String code, String field) {
        String upper = code.trim().toUpperCase(Locale.ROOT);
        try {
            Currency.getInstance(upper);
            return upper;
        } catch (IllegalArgumentException ex) {
            throw ApiExceptions.invalidField(field, "Unknown currency " + upper);
        }
    }
}
