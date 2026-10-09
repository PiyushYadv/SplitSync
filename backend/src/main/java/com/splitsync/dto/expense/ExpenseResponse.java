package com.splitsync.dto.expense;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.splitsync.dto.common.UserSummary;
import com.splitsync.entity.Expense;
import com.splitsync.entity.enums.SplitType;
import com.splitsync.util.Money;

/**
 * {@code amount}/{@code currency} are in the group's base currency (what balances and analytics use);
 * {@code originalAmount}/{@code originalCurrency} are what was actually entered.
 */
public record ExpenseResponse(
        UUID id,
        UUID groupId,
        String title,
        String category,
        String categoryColor,
        BigDecimal amount,
        String currency,
        BigDecimal originalAmount,
        String originalCurrency,
        BigDecimal exchangeRate,
        UUID paidByUserId,
        UserSummary paidBy,
        SplitType splitType,
        List<SplitResponse> splits,
        Instant date,
        String receiptUrl,
        Instant createdAt) {

    public static ExpenseResponse from(Expense expense, UUID currentUserId) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getGroup().getId(),
                expense.getTitle(),
                expense.getCategory(),
                expense.getCategoryColor(),
                Money.of(expense.getBaseAmount()),
                expense.getGroup().getBaseCurrency(),
                Money.of(expense.getAmount()),
                expense.getCurrency(),
                expense.getExchangeRate().setScale(6, RoundingMode.HALF_EVEN),
                expense.getPaidBy().getId(),
                UserSummary.from(expense.getPaidBy(), currentUserId),
                expense.getSplitType(),
                expense.getSplits().stream().map(SplitResponse::from).toList(),
                expense.getOccurredAt(),
                expense.getReceiptUrl(),
                expense.getCreatedAt());
    }
}
