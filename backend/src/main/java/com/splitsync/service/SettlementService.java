package com.splitsync.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.splitsync.dto.common.ListResponse;
import com.splitsync.dto.settlement.SettlementResponse;
import com.splitsync.engine.DebtOptimizationEngine;
import com.splitsync.engine.DebtOptimizationEngine.Transfer;
import com.splitsync.entity.ExpenseGroup;
import com.splitsync.entity.GroupMember;
import com.splitsync.entity.Settlement;
import com.splitsync.entity.User;
import com.splitsync.entity.enums.NotificationType;
import com.splitsync.entity.enums.SettlementStatus;
import com.splitsync.exception.ApiExceptions;
import com.splitsync.exception.ErrorCode;
import com.splitsync.repository.SettlementRepository;
import com.splitsync.repository.UserRepository;
import com.splitsync.util.Money;

import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;

/**
 * Pending settlements are the debt engine's current suggestion for clearing a group's balances. They are
 * rebuilt after every ledger change; paid settlements are permanent history and feed back into balances.
 */
@Service
@RequiredArgsConstructor
public class SettlementService {

    private final SettlementRepository settlementRepository;
    private final UserRepository userRepository;
    private final BalanceService balanceService;
    private final DebtOptimizationEngine debtOptimizationEngine;
    private final GroupAccessService groupAccessService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    /**
     * Replaces the group's pending settlements with the optimal transfers for its current balances. Pending
     * rows that still match a transfer exactly are kept, so their ids stay stable for clients.
     * Callers must hold the group lock.
     */
    @Transactional
    public void rebuildPendingSettlements(ExpenseGroup group) {
        Map<UUID, BigDecimal> nets = balanceService.netBalances(group.getId());
        List<Transfer> missing = new ArrayList<>(debtOptimizationEngine.optimize(nets));

        for (Settlement pending : settlementRepository.findByGroupIdAndStatus(group.getId(), SettlementStatus.PENDING)) {
            if (!removeMatching(missing, pending)) {
                settlementRepository.delete(pending);
            }
        }
        for (Transfer transfer : missing) {
            Settlement settlement = new Settlement();
            settlement.setGroup(group);
            settlement.setFromUser(userRepository.getReferenceById(transfer.fromUserId()));
            settlement.setToUser(userRepository.getReferenceById(transfer.toUserId()));
            settlement.setAmount(transfer.amount());
            settlement.setCurrency(group.getBaseCurrency());
            settlementRepository.save(settlement);
        }
    }

    @Transactional(readOnly = true)
    public ListResponse<SettlementResponse> list(UUID userId, UUID groupId, SettlementStatus status) {
        Specification<Settlement> spec = visibleTo(userId);
        if (groupId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("group").get("id"), groupId));
        }
        spec = spec.and(status != null
                ? (root, query, cb) -> cb.equal(root.get("status"), status)
                : (root, query, cb) -> cb.notEqual(root.get("status"), SettlementStatus.CANCELLED));

        List<SettlementResponse> data = settlementRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream().map(s -> SettlementResponse.from(s, userId)).toList();
        return ListResponse.of(data);
    }

    /** Idempotent: paying an already-paid settlement returns it unchanged. */
    @Transactional
    public SettlementResponse pay(UUID settlementId, UUID userId) {
        UUID groupId = settlementRepository.findGroupIdById(settlementId)
                .orElseThrow(() -> ApiExceptions.notFound("Settlement"));
        ExpenseGroup group = groupAccessService.lockForMember(groupId, userId);
        // Load only after taking the lock, so a concurrent payment or rebuild can't hand us a stale row.
        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> ApiExceptions.notFound("Settlement"));

        User payer = settlement.getFromUser();
        User recipient = settlement.getToUser();
        if (!payer.getId().equals(userId) && !recipient.getId().equals(userId)) {
            throw ApiExceptions.forbidden("Only the payer or the recipient can mark this settlement as paid");
        }
        if (settlement.getStatus() == SettlementStatus.PAID) {
            return SettlementResponse.from(settlement, userId);
        }
        if (settlement.getStatus() != SettlementStatus.PENDING) {
            throw ApiExceptions.conflict(ErrorCode.SETTLEMENT_NOT_PAYABLE, "This settlement can no longer be paid");
        }

        settlement.setStatus(SettlementStatus.PAID);
        settlement.setPaid(true);
        settlement.setPaidAt(Instant.now().truncatedTo(ChronoUnit.MILLIS));
        group.setUpdatedAt(Instant.now());
        settlementRepository.saveAndFlush(settlement);
        rebuildPendingSettlements(group);

        User actor = payer.getId().equals(userId) ? payer : recipient;
        User other = actor == payer ? recipient : payer;
        String amount = settlement.getCurrency() + " " + Money.of(settlement.getAmount());
        auditService.record(group, actor, "settlement.paid", Map.of(
                "settlementId", settlement.getId().toString(),
                "fromUserId", payer.getId().toString(),
                "toUserId", recipient.getId().toString(),
                "amount", amount));
        notificationService.notify(other, NotificationType.SETTLEMENT,
                actor.getName() + " marked a settlement as paid",
                payer.getName() + " → " + recipient.getName() + " · " + amount,
                Map.of("groupId", group.getId().toString(), "settlementId", settlement.getId().toString()));

        return SettlementResponse.from(settlement, userId);
    }

    @Transactional(readOnly = true)
    public SettlementResponse get(UUID settlementId, UUID userId) {
        Settlement settlement = settlementRepository.findById(settlementId)
                .filter(s -> groupAccessService.isMember(s.getGroup().getId(), userId))
                .orElseThrow(() -> ApiExceptions.notFound("Settlement"));
        return SettlementResponse.from(settlement, userId);
    }

    private static boolean removeMatching(List<Transfer> transfers, Settlement settlement) {
        Iterator<Transfer> it = transfers.iterator();
        while (it.hasNext()) {
            Transfer t = it.next();
            if (t.fromUserId().equals(settlement.getFromUser().getId())
                    && t.toUserId().equals(settlement.getToUser().getId())
                    && t.amount().compareTo(settlement.getAmount()) == 0) {
                it.remove();
                return true;
            }
        }
        return false;
    }

    private static Specification<Settlement> visibleTo(UUID userId) {
        return (root, query, cb) -> {
            Subquery<UUID> memberGroups = query.subquery(UUID.class);
            var gm = memberGroups.from(GroupMember.class);
            memberGroups.select(gm.get("id").get("groupId")).where(cb.equal(gm.get("id").get("userId"), userId));
            return root.get("group").get("id").in(memberGroups);
        };
    }
}
