package com.splitsync.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;

import com.splitsync.entity.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    List<AuditLog> findByGroupIdInOrderByCreatedAtDesc(Collection<UUID> groupIds, Limit limit);
}
