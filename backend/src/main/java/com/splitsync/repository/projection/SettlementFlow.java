package com.splitsync.repository.projection;

import java.math.BigDecimal;
import java.util.UUID;

public record SettlementFlow(UUID groupId, UUID fromUserId, UUID toUserId, BigDecimal amount) {
}
