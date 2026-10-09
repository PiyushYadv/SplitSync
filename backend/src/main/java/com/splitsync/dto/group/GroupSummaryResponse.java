package com.splitsync.dto.group;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** {@code balance} is the current user's net position in the group: positive means they are owed money. */
public record GroupSummaryResponse(
        UUID id,
        String name,
        String emoji,
        String color,
        String baseCurrency,
        long memberCount,
        BigDecimal totalSpend,
        BigDecimal balance,
        String status,
        Instant lastActivity) {
}
