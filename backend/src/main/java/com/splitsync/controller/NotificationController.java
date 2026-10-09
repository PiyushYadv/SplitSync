package com.splitsync.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.splitsync.dto.notification.NotificationListResponse;
import com.splitsync.dto.notification.NotificationResponse;
import com.splitsync.security.UserPrincipal;
import com.splitsync.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public NotificationListResponse list(@AuthenticationPrincipal UserPrincipal principal) {
        return notificationService.list(principal.getId());
    }

    @PostMapping("/{id}/read")
    public NotificationResponse markRead(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        return notificationService.markRead(id, principal.getId());
    }

    @PostMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllRead(@AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAllRead(principal.getId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void dismiss(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        notificationService.dismiss(id, principal.getId());
    }
}
