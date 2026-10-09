package com.splitsync.controller;

import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.splitsync.dto.common.ListResponse;
import com.splitsync.dto.settlement.SettlementResponse;
import com.splitsync.entity.enums.SettlementStatus;
import com.splitsync.security.UserPrincipal;
import com.splitsync.service.IdempotencyService;
import com.splitsync.service.SettlementService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/settlements")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;
    private final IdempotencyService idempotencyService;

    @GetMapping
    public ListResponse<SettlementResponse> list(@AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID groupId,
            @RequestParam(required = false) SettlementStatus status) {
        return settlementService.list(principal.getId(), groupId, status);
    }

    @PostMapping("/{id}/pay")
    public SettlementResponse pay(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey) {
        UUID userId = principal.getId();
        return idempotencyService.execute(idempotencyKey, userId, "settlement.pay", id,
                () -> settlementService.pay(id, userId),
                SettlementResponse::id,
                settlementId -> settlementService.get(settlementId, userId));
    }
}
