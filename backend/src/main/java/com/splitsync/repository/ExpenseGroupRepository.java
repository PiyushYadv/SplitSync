package com.splitsync.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.splitsync.entity.ExpenseGroup;

import jakarta.persistence.LockModeType;

public interface ExpenseGroupRepository extends JpaRepository<ExpenseGroup, UUID> {

    /** Row lock that serialises ledger mutations (expenses, payments, membership) within one group. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select g from ExpenseGroup g where g.id = :id")
    Optional<ExpenseGroup> findByIdForUpdate(@Param("id") UUID id);

    @Query("""
            select g from ExpenseGroup g
            where g.id in (select gm.id.groupId from GroupMember gm where gm.id.userId = :userId)
            order by g.updatedAt desc
            """)
    List<ExpenseGroup> findAllForMember(@Param("userId") UUID userId);
}
