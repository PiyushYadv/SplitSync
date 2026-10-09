package com.splitsync.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.splitsync.entity.Settlement;
import com.splitsync.entity.enums.SettlementStatus;
import com.splitsync.repository.projection.SettlementFlow;

public interface SettlementRepository extends JpaRepository<Settlement, UUID>, JpaSpecificationExecutor<Settlement> {

    List<Settlement> findByGroupIdAndStatus(UUID groupId, SettlementStatus status);

    List<Settlement> findByGroupIdAndStatusInOrderByCreatedAtDesc(UUID groupId, Collection<SettlementStatus> statuses);

    @Query("select s.group.id from Settlement s where s.id = :id")
    Optional<UUID> findGroupIdById(@Param("id") UUID id);

    @Query("""
            select new com.splitsync.repository.projection.SettlementFlow(s.group.id, s.fromUser.id, s.toUser.id, sum(s.amount))
            from Settlement s
            where s.group.id in :groupIds and s.status = com.splitsync.entity.enums.SettlementStatus.PAID
            group by s.group.id, s.fromUser.id, s.toUser.id
            """)
    List<SettlementFlow> sumPaidFlowsByGroupIds(@Param("groupIds") Collection<UUID> groupIds);
}
