package com.splitsync.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.splitsync.entity.Expense;
import com.splitsync.repository.projection.GroupSpend;
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
}
