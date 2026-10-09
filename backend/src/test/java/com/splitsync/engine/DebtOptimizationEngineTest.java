package com.splitsync.engine;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.splitsync.engine.DebtOptimizationEngine.Transfer;

class DebtOptimizationEngineTest {

    private final DebtOptimizationEngine engine = new DebtOptimizationEngine();

    private static final UUID A = UUID.fromString("00000000-0000-0000-0000-00000000000a");
    private static final UUID B = UUID.fromString("00000000-0000-0000-0000-00000000000b");
    private static final UUID C = UUID.fromString("00000000-0000-0000-0000-00000000000c");
    private static final UUID D = UUID.fromString("00000000-0000-0000-0000-00000000000d");

    @Test
    void matchesLargestDebtorWithLargestCreditor() {
        List<Transfer> transfers = engine.optimize(Map.of(
                A, new BigDecimal("60.00"),
                B, new BigDecimal("-40.00"),
                C, new BigDecimal("-20.00")));

        assertThat(transfers).containsExactly(
                new Transfer(B, A, new BigDecimal("40.00")),
                new Transfer(C, A, new BigDecimal("20.00")));
    }

    @Test
    void producesAtMostNMinusOneTransfersAndClearsEveryBalance() {
        Map<UUID, BigDecimal> nets = Map.of(
                A, new BigDecimal("75.50"),
                B, new BigDecimal("-10.25"),
                C, new BigDecimal("-90.00"),
                D, new BigDecimal("24.75"));

        List<Transfer> transfers = engine.optimize(nets);

        assertThat(transfers).hasSizeLessThanOrEqualTo(nets.size() - 1);
        Map<UUID, BigDecimal> remaining = new HashMap<>(nets);
        for (Transfer t : transfers) {
            assertThat(t.amount()).isPositive();
            remaining.merge(t.fromUserId(), t.amount(), BigDecimal::add);
            remaining.merge(t.toUserId(), t.amount().negate(), BigDecimal::add);
        }
        assertThat(remaining.values()).allSatisfy(v -> assertThat(v).isEqualByComparingTo(BigDecimal.ZERO));
    }

    @Test
    void settledGroupNeedsNoTransfers() {
        assertThat(engine.optimize(Map.of(A, BigDecimal.ZERO, B, BigDecimal.ZERO))).isEmpty();
    }

    @Test
    void rejectsUnbalancedLedger() {
        assertThatThrownBy(() -> engine.optimize(Map.of(A, BigDecimal.ONE, B, BigDecimal.ZERO)))
                .isInstanceOf(IllegalStateException.class);
    }
}
