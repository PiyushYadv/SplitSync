package com.splitsync.dto.group;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.splitsync.dto.expense.ExpenseResponse;
import com.splitsync.dto.settlement.SettlementResponse;

public record GroupDetailResponse(
        UUID id,
        String name,
        String emoji,
        String color,
        String baseCurrency,
        String status,
        List<GroupMemberResponse> members,
        List<ExpenseResponse> expenses,
        List<SettlementResponse> settlements,
        BigDecimal totalSpend,
        BigDecimal balance,
        Instant createdAt,
        Instant updatedAt) {
}
