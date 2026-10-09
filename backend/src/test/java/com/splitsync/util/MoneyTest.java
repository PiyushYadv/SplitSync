package com.splitsync.util;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;

class MoneyTest {

    private static List<BigDecimal> decimals(String... values) {
        return java.util.Arrays.stream(values).map(BigDecimal::new).toList();
    }

    @Test
    void equalSplitDistributesLeftoverCentsToEarliestShares() {
        assertThat(Money.allocate(new BigDecimal("100.00"), decimals("1", "1", "1")))
                .containsExactlyElementsOf(decimals("33.34", "33.33", "33.33"));
    }

    @Test
    void sharesAlwaysSumToTotal() {
        BigDecimal total = new BigDecimal("1000.01");
        List<BigDecimal> shares = Money.allocate(total, Collections.nCopies(7, BigDecimal.ONE));
        assertThat(shares.stream().reduce(BigDecimal.ZERO, BigDecimal::add)).isEqualByComparingTo(total);
    }

    @Test
    void percentageWeightsGiveLeftoverToLargestRemainder() {
        // 10.00 at 33.33/33.33/33.34 → exact 3.333, 3.333, 3.334 → floors 3.33 each, the last cent to the largest remainder
        assertThat(Money.allocate(new BigDecimal("10.00"), decimals("33.33", "33.33", "33.34")))
                .containsExactlyElementsOf(decimals("3.33", "3.33", "3.34"));
    }

    @Test
    void exactWeightsInSameCurrencyAreReproducedExactly() {
        assertThat(Money.allocate(new BigDecimal("88.50"), decimals("50.25", "38.25")))
                .containsExactlyElementsOf(decimals("50.25", "38.25"));
    }

    @Test
    void zeroWeightGetsNothing() {
        assertThat(Money.allocate(new BigDecimal("5.00"), decimals("0", "1")))
                .containsExactlyElementsOf(decimals("0.00", "5.00"));
    }

    @Test
    void rejectsAllZeroWeights() {
        assertThatThrownBy(() -> Money.allocate(BigDecimal.TEN, decimals("0", "0")))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
