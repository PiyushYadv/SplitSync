package com.splitsync.controller;

import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.splitsync.dto.common.ListResponse;
import com.splitsync.dto.invitation.InvitationResponse;
import com.splitsync.entity.enums.InvitationStatus;
import com.splitsync.security.UserPrincipal;
import com.splitsync.service.InvitationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    @GetMapping
    public ListResponse<InvitationResponse> list(@AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "pending") InvitationStatus status) {
        return ListResponse.of(invitationService.listForUser(principal.getId(), status));
    }

    @PostMapping("/{id}/accept")
    public InvitationResponse accept(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        return invitationService.accept(id, principal.getId());
    }

    @PostMapping("/{id}/decline")
    public InvitationResponse decline(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        return invitationService.decline(id, principal.getId());
    }
}
