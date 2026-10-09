package com.splitsync.dto.receipt;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Fields read from a receipt photo, to prefill the expense form. Anything the scanner couldn't read is null;
 * the user reviews every value before saving.
 */
public record ScannedReceipt(
        String title,
        BigDecimal amount,
        String currency,
        LocalDate date,
        String category,
        List<Item> items) {

    public record Item(String name, BigDecimal amount) {
    }
}
