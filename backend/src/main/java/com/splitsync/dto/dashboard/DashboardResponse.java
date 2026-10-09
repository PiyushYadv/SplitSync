package com.splitsync.dto.dashboard;

import java.math.BigDecimal;
import java.util.List;

import com.splitsync.dto.expense.ExpenseResponse;
import com.splitsync.dto.group.GroupSummaryResponse;
import com.splitsync.dto.settlement.SettlementResponse;

public record DashboardResponse(
        Summary summary,
        List<GroupSummaryResponse> groups,
        List<ExpenseResponse> expenses,
        List<SettlementResponse> settlements) {

    /** All amounts converted to {@code currency}, the user's preferred currency. */
    public record Summary(BigDecimal totalSpend, BigDecimal youOwe, BigDecimal youAreOwed, BigDecimal netBalance,
            int pendingSettlements, String currency) {
    }
}
