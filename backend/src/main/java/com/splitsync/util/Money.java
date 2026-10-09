package com.splitsync.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.IntStream;

/** Ledger arithmetic: every monetary value is a BigDecimal at scale 2, rounded HALF_EVEN. */
public final class Money {

    public static final int SCALE = 2;
    public static final RoundingMode ROUNDING = RoundingMode.HALF_EVEN;

    private Money() {
    }

    public static BigDecimal of(BigDecimal value) {
        return value.setScale(SCALE, ROUNDING);
    }

    public static boolean isZero(BigDecimal value) {
        return value.signum() == 0;
    }

    /**
     * Splits {@code total} into shares proportional to {@code weights} that sum exactly to {@code total}.
     * Each share is floored to the cent, then the leftover cents go one at a time to the shares with the
     * largest fractional remainders (ties broken by position), so no cent is ever created or lost.
     */
    public static List<BigDecimal> allocate(BigDecimal total, List<BigDecimal> weights) {
        if (total.signum() < 0) {
            throw new IllegalArgumentException("total must not be negative");
        }
        BigDecimal weightSum = weights.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        if (weights.isEmpty() || weightSum.signum() <= 0 || weights.stream().anyMatch(w -> w.signum() < 0)) {
            throw new IllegalArgumentException("weights must be non-negative with a positive sum");
        }

        BigDecimal totalCents = of(total).movePointRight(SCALE);
        long[] cents = new long[weights.size()];
        BigDecimal[] remainders = new BigDecimal[weights.size()];
        long allocated = 0;
        for (int i = 0; i < weights.size(); i++) {
            BigDecimal exact = totalCents.multiply(weights.get(i)).divide(weightSum, 20, RoundingMode.DOWN);
            BigDecimal floor = exact.setScale(0, RoundingMode.DOWN);
            cents[i] = floor.longValueExact();
            remainders[i] = exact.subtract(floor);
            allocated += cents[i];
        }

        long leftover = totalCents.longValueExact() - allocated;
        List<Integer> byRemainder = IntStream.range(0, weights.size()).boxed()
                .sorted(Comparator.comparing((Integer i) -> remainders[i]).reversed().thenComparing(i -> i))
                .toList();
        for (int i = 0; i < leftover; i++) {
            cents[byRemainder.get(i)]++;
        }

        List<BigDecimal> shares = new ArrayList<>(weights.size());
        for (long c : cents) {
            shares.add(BigDecimal.valueOf(c, SCALE));
        }
        return shares;
    }
}
