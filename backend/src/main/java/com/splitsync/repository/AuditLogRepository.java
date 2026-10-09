package com.splitsync.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.splitsync.entity.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
}
