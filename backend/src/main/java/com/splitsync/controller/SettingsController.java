package com.splitsync.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.splitsync.dto.auth.ChangeEmailRequest;
import com.splitsync.dto.settings.SettingsResponse;
import com.splitsync.dto.settings.UpdateSettingsRequest;
import com.splitsync.security.UserPrincipal;
import com.splitsync.service.AccountService;
import com.splitsync.service.SettingsService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/me")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;
    private final AccountService accountService;

    @GetMapping("/settings")
    public SettingsResponse get(@AuthenticationPrincipal UserPrincipal principal) {
        return settingsService.get(principal.getId());
    }

    @PatchMapping("/settings")
    public SettingsResponse update(@AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateSettingsRequest request, HttpSession session) {
        return settingsService.update(principal.getId(), request.section(), request.values(), session.getId());
    }

    /** Emails a confirmation link to the new address; the email changes once it is opened. */
    @PostMapping("/email")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void changeEmail(@AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangeEmailRequest request) {
        accountService.requestEmailChange(principal.getId(), request.email(), request.currentPassword());
    }
}
