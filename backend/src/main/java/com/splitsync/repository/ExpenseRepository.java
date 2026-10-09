package com.splitsync.repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.splitsync.entity.Expense;
import com.splitsync.repository.projection.CurrencyAmount;
import com.splitsync.repository.projection.GroupSpend;
import com.splitsync.repository.projection.SpendBucket;
import com.splitsync.repository.projection.GroupUserAmount;

public interface ExpenseRepository extends JpaRepository<Expense, UUID>, JpaSpecificationExecutor<Expense> {

    List<Expense> findByGroupIdOrderByOccurredAtDescIdDesc(UUID groupId);

    List<Expense> findTop3ByGroupIdOrderByOccurredAtDesc(UUID groupId);

    @Query("""
            select new com.splitsync.repository.projection.GroupSpend(e.group.id, sum(e.baseAmount), max(e.createdAt))
            from Expense e where e.group.id in :groupIds group by e.group.id
            """)
    List<GroupSpend> sumSpendByGroupIds(@Param("groupIds") Collection<UUID> groupIds);

    @Query("""
            select new com.splitsync.repository.projection.GroupUserAmount(e.group.id, e.paidBy.id, sum(e.baseAmount))
            from Expense e where e.group.id in :groupIds group by e.group.id, e.paidBy.id
            """)
    List<GroupUserAmount> sumPaidByGroupIds(@Param("groupIds") Collection<UUID> groupIds);

    @Query("""
            select new com.splitsync.repository.projection.GroupUserAmount(e.group.id, s.user.id, sum(s.amountOwed))
            from ExpenseSplit s join s.expense e where e.group.id in :groupIds group by e.group.id, s.user.id
            """)
    List<GroupUserAmount> sumOwedByGroupIds(@Param("groupIds") Collection<UUID> groupIds);

    /** Months are bucketed in UTC regardless of the database session time zone. */
    @Query(value = """
            select g.base_currency as currency,
                   to_char(e.occurred_at at time zone 'UTC', 'YYYY-MM') as month,
                   e.category as category,
                   sum(e.base_amount) as amount
            from expenses e join groups g on g.id = e.group_id
            where e.group_id in (:groupIds) and e.occurred_at >= :from and e.occurred_at <= :to
            group by 1, 2, 3
            """, nativeQuery = true)
    List<SpendBucket> sumSpendBuckets(@Param("groupIds") Collection<UUID> groupIds, @Param("from") Instant from,
            @Param("to") Instant to);

    @Query(value = """
            select g.base_currency as currency, sum(s.amount_owed) as amount
            from expense_splits s
              join expenses e on e.id = s.expense_id
              join groups g on g.id = e.group_id
            where s.user_id = :userId and e.group_id in (:groupIds)
              and e.occurred_at >= :from and e.occurred_at <= :to
            group by 1
            """, nativeQuery = true)
    List<CurrencyAmount> sumShareByCurrency(@Param("userId") UUID userId, @Param("groupIds") Collection<UUID> groupIds,
            @Param("from") Instant from, @Param("to") Instant to);
}
