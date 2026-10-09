package com.splitsync.service;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.splitsync.entity.AuditLog;
import com.splitsync.entity.ExpenseGroup;
import com.splitsync.entity.User;
import com.splitsync.repository.AuditLogRepository;

import lombok.RequiredArgsConstructor;

/** Records audit entries in the caller's transaction, so they commit or roll back with the action itself. */
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void record(ExpenseGroup group, User actor, String action, Map<String, Object> details) {
        AuditLog log = new AuditLog();
        log.setGroup(group);
        log.setUser(actor);
        log.setAction(action);
        log.setDetails(details);
        auditLogRepository.save(log);
    }
}
