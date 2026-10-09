package com.splitsync.dto.analytics;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.splitsync.dto.common.UserSummary;

/**
 * Spend figures are group totals (everyone's share), converted to {@code currency}; {@code yourShare} is the
 * requesting user's portion of that spend.
 */
public record AnalyticsResponse(
        String currency,
        Instant from,
        Instant to,
        BigDecimal totalSpend,
        BigDecimal yourShare,
        BigDecimal averageMonthlySpend,
        CategoryAmount largestCategory,
        List<MonthAmount> monthlySpend,
        List<CategoryAmount> categories,
        List<AuditEntry> audit) {

    public record MonthAmount(String month, BigDecimal amount) {
    }

    public record CategoryAmount(String name, BigDecimal amount, String color) {
    }

    /** {@code type} is one of add, settle, invite, join, leave, group (drives the icon in the UI). */
    public record AuditEntry(UUID id, String action, String label, String type, UserSummary actor, UUID groupId,
            String groupName, String target, Instant createdAt) {
    }
}
