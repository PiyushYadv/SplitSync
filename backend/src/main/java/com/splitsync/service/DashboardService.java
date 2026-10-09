package com.splitsync.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.splitsync.dto.dashboard.DashboardResponse;
import com.splitsync.dto.expense.ExpenseResponse;
import com.splitsync.dto.group.GroupSummaryResponse;
import com.splitsync.dto.settlement.SettlementResponse;
import com.splitsync.repository.UserSettingsRepository;
import com.splitsync.service.ExpenseLedgerService.ExpenseFilter;
import com.splitsync.service.fx.CurrencyConverter;
import com.splitsync.util.Money;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final int RECENT_EXPENSES = 10;

    private final GroupService groupService;
    private final ExpenseLedgerService expenseLedgerService;
    private final SettlementService settlementService;
    private final UserSettingsRepository userSettingsRepository;
    private final CurrencyConverter currencyConverter;

    /**
     * Totals are summed per group in that group's base currency, then converted to the user's preferred
     * currency so multi-currency groups add up correctly.
     */
    @Transactional(readOnly = true)
    public DashboardResponse get(UUID userId) {
        String currency = preferredCurrency(userId);
        List<GroupSummaryResponse> groups = groupService.listForUser(userId);

        BigDecimal totalSpend = Money.of(BigDecimal.ZERO);
        BigDecimal youOwe = Money.of(BigDecimal.ZERO);
        BigDecimal youAreOwed = Money.of(BigDecimal.ZERO);
        for (GroupSummaryResponse group : groups) {
            totalSpend = totalSpend.add(currencyConverter.convert(group.totalSpend(), group.baseCurrency(), currency));
            BigDecimal balance = currencyConverter.convert(group.balance(), group.baseCurrency(), currency);
            if (balance.signum() < 0) {
                youOwe = youOwe.add(balance.negate());
            } else {
                youAreOwed = youAreOwed.add(balance);
            }
        }

        List<ExpenseResponse> recentExpenses = expenseLedgerService
                .list(userId, new ExpenseFilter(null, null, null, null, null, RECENT_EXPENSES)).data();
        List<SettlementResponse> pending = settlementService.pendingForUser(userId);

        return new DashboardResponse(
                new DashboardResponse.Summary(totalSpend, youOwe, youAreOwed, youAreOwed.subtract(youOwe),
                        pending.size(), currency),
                groups, recentExpenses, pending);
    }

    String preferredCurrency(UUID userId) {
        return userSettingsRepository.findById(userId).map(s -> s.getCurrency()).orElse("USD");
    }
}
