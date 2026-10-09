package com.splitsync.dto.expense;

import java.math.BigDecimal;
import java.util.UUID;

import com.splitsync.entity.ExpenseSplit;
import com.splitsync.util.Money;

/** {@code amount} is the user's share in the group's base currency. */
public record SplitResponse(UUID userId, BigDecimal amount, BigDecimal percentage) {

    public static SplitResponse from(ExpenseSplit split) {
        return new SplitResponse(split.getUser().getId(), Money.of(split.getAmountOwed()), split.getPercentage());
    }
}
