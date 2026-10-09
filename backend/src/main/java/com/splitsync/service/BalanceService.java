package com.splitsync.service;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.splitsync.repository.ExpenseRepository;
import com.splitsync.repository.SettlementRepository;
import com.splitsync.repository.projection.GroupUserAmount;
import com.splitsync.repository.projection.SettlementFlow;
import com.splitsync.util.Money;

import lombok.RequiredArgsConstructor;

/**
 * Net balance per member, in the group's base currency:
 * net(u) = sum(paid by u) - sum(u's shares) + sum(settlements u paid) - sum(settlements u received).
 * Positive means the group owes u money. Every group's nets sum to exactly zero.
 */
@Service
@RequiredArgsConstructor
public class BalanceService {

    private final ExpenseRepository expenseRepository;
    private final SettlementRepository settlementRepository;

    @Transactional(readOnly = true)
    public Map<UUID, BigDecimal> netBalances(UUID groupId) {
        return netBalances(List.of(groupId)).getOrDefault(groupId, Map.of());
    }

    @Transactional(readOnly = true)
    public Map<UUID, Map<UUID, BigDecimal>> netBalances(Collection<UUID> groupIds) {
        Map<UUID, Map<UUID, BigDecimal>> nets = new HashMap<>();
        if (groupIds.isEmpty()) {
            return nets;
        }
        for (GroupUserAmount paid : expenseRepository.sumPaidByGroupIds(groupIds)) {
            add(nets, paid.groupId(), paid.userId(), paid.amount());
        }
        for (GroupUserAmount owed : expenseRepository.sumOwedByGroupIds(groupIds)) {
            add(nets, owed.groupId(), owed.userId(), owed.amount().negate());
        }
        for (SettlementFlow flow : settlementRepository.sumPaidFlowsByGroupIds(groupIds)) {
            add(nets, flow.groupId(), flow.fromUserId(), flow.amount());
            add(nets, flow.groupId(), flow.toUserId(), flow.amount().negate());
        }
        nets.values().forEach(group -> group.replaceAll((userId, amount) -> Money.of(amount)));
        return nets;
    }

    private static void add(Map<UUID, Map<UUID, BigDecimal>> nets, UUID groupId, UUID userId, BigDecimal amount) {
        nets.computeIfAbsent(groupId, id -> new HashMap<>()).merge(userId, amount, BigDecimal::add);
    }
}
