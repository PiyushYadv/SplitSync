package com.splitsync.engine;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.splitsync.util.Money;

/**
 * Greedy debt simplification. Given each member's net balance (paid minus owed; positive means they are
 * owed money), it matches the largest creditor with the largest debtor until everyone is at zero.
 * This produces at most N-1 transfers instead of one IOU per pair of members.
 */
@Component
public class DebtOptimizationEngine {

    public record Transfer(UUID fromUserId, UUID toUserId, BigDecimal amount) {
    }

    private static final class Balance {
        final UUID userId;
        BigDecimal remaining;

        Balance(UUID userId, BigDecimal remaining) {
            this.userId = userId;
            this.remaining = remaining;
        }
    }

    public List<Transfer> optimize(Map<UUID, BigDecimal> netBalances) {
        BigDecimal sum = netBalances.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        if (sum.signum() != 0) {
            throw new IllegalStateException("Net balances must sum to zero but sum to " + sum);
        }

        // Creditors: largest amount owed to them first. Debtors: most negative first. Ties by id for stable output.
        List<Balance> creditors = new ArrayList<>();
        List<Balance> debtors = new ArrayList<>();
        netBalances.forEach((userId, net) -> {
            BigDecimal amount = Money.of(net);
            if (amount.signum() > 0) {
                creditors.add(new Balance(userId, amount));
            } else if (amount.signum() < 0) {
                debtors.add(new Balance(userId, amount.negate()));
            }
        });
        Comparator<Balance> largestFirst = Comparator.comparing((Balance b) -> b.remaining).reversed()
                .thenComparing(b -> b.userId);
        creditors.sort(largestFirst);
        debtors.sort(largestFirst);

        List<Transfer> transfers = new ArrayList<>();
        int c = 0;
        int d = 0;
        while (c < creditors.size() && d < debtors.size()) {
            Balance creditor = creditors.get(c);
            Balance debtor = debtors.get(d);
            BigDecimal amount = creditor.remaining.min(debtor.remaining);

            transfers.add(new Transfer(debtor.userId, creditor.userId, amount));
            creditor.remaining = creditor.remaining.subtract(amount);
            debtor.remaining = debtor.remaining.subtract(amount);

            if (creditor.remaining.signum() == 0) {
                c++;
            }
            if (debtor.remaining.signum() == 0) {
                d++;
            }
        }
        return transfers;
    }
}
