package com.splitsync.repository.projection;

import java.math.BigDecimal;
import java.util.UUID;

public record GroupUserAmount(UUID groupId, UUID userId, BigDecimal amount) {
}
