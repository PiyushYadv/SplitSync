package com.splitsync.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.splitsync.dto.dashboard.DashboardResponse;
import com.splitsync.security.UserPrincipal;
import com.splitsync.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/dashboard")
    public DashboardResponse dashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return dashboardService.get(principal.getId());
    }
}
