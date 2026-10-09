package com.splitsync.service;

import java.util.UUID;

import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

/** Signs a user out of their sessions. Sessions are indexed by user id (see UserPrincipal#getName). */
@Service
@RequiredArgsConstructor
public class SessionRevocationService {

    private final FindByIndexNameSessionRepository<? extends Session> sessionRepository;

    /** @param keepSessionId a session to leave signed in, or null to revoke all of them */
    public void revokeAll(UUID userId, String keepSessionId) {
        sessionRepository.findByPrincipalName(userId.toString()).keySet().stream()
                .filter(id -> !id.equals(keepSessionId))
                .forEach(sessionRepository::deleteById);
    }
}
