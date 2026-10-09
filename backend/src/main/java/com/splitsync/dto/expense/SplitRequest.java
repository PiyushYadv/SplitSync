package com.splitsync.dto.expense;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

/** {@code amount} is required for exact splits (original currency); {@code percentage} for percentage splits. */
public record SplitRequest(
        @NotNull(message = "userId is required")
        UUID userId,

        @DecimalMin(value = "0", message = "Split amount cannot be negative")
        @Digits(integer = 15, fraction = 2, message = "Split amount can have at most 2 decimal places")
        BigDecimal amount,

        @DecimalMin(value = "0", message = "Percentage cannot be negative")
        @DecimalMax(value = "100", message = "Percentage cannot exceed 100")
        @Digits(integer = 3, fraction = 2, message = "Percentage can have at most 2 decimal places")
        BigDecimal percentage) {
}
