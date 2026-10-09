package com.splitsync.dto.expense;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.splitsync.entity.enums.SplitType;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** When {@code splits} is omitted for an equal split, the expense is shared by every current group member. */
public record CreateExpenseRequest(
        @NotNull(message = "Group is required")
        UUID groupId,

        @NotBlank(message = "Description is required")
        @Size(max = 255, message = "Description must be at most 255 characters")
        String title,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
        @Digits(integer = 15, fraction = 2, message = "Amount can have at most 2 decimal places")
        BigDecimal amount,

        @NotBlank(message = "Currency is required")
        @Pattern(regexp = "[A-Za-z]{3}", message = "Currency must be a 3-letter ISO code")
        String currency,

        @NotNull(message = "Payer is required")
        UUID paidByUserId,

        @Size(max = 100, message = "Category must be at most 100 characters")
        String category,

        SplitType splitType,

        @Valid
        @Size(max = 100, message = "Too many splits")
        List<SplitRequest> splits,

        Instant occurredAt,

        @Size(max = 1024, message = "Receipt URL is too long")
        String receiptUrl) {
}
