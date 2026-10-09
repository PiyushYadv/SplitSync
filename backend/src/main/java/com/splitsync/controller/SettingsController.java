package com.splitsync.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.splitsync.dto.settings.SettingsResponse;
import com.splitsync.dto.settings.UpdateSettingsRequest;
import com.splitsync.security.UserPrincipal;
import com.splitsync.service.SettingsService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/me/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public SettingsResponse get(@AuthenticationPrincipal UserPrincipal principal) {
        return settingsService.get(principal.getId());
    }

    @PatchMapping
    public SettingsResponse update(@AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateSettingsRequest request, HttpSession session) {
        return settingsService.update(principal.getId(), request.section(), request.values(), session.getId());
    }
}
