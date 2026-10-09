package com.splitsync.repository.projection;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record GroupSpend(UUID groupId, BigDecimal total, Instant lastExpenseAt) {
}
