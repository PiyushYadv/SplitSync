package com.splitsync.dto.settlement;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.splitsync.dto.common.UserSummary;
import com.splitsync.entity.Settlement;
import com.splitsync.entity.enums.SettlementStatus;
import com.splitsync.util.Money;

public record SettlementResponse(
        UUID id,
        UUID groupId,
        UUID fromUserId,
        UUID toUserId,
        UserSummary from,
        UserSummary to,
        BigDecimal amount,
        String currency,
        SettlementStatus status,
        boolean paid,
        Instant paidAt,
        Instant createdAt) {

    public static SettlementResponse from(Settlement settlement, UUID currentUserId) {
        return new SettlementResponse(
                settlement.getId(),
                settlement.getGroup().getId(),
                settlement.getFromUser().getId(),
                settlement.getToUser().getId(),
                UserSummary.from(settlement.getFromUser(), currentUserId),
                UserSummary.from(settlement.getToUser(), currentUserId),
                Money.of(settlement.getAmount()),
                settlement.getCurrency(),
                settlement.getStatus(),
                settlement.isPaid(),
                settlement.getPaidAt(),
                settlement.getCreatedAt());
    }
}
