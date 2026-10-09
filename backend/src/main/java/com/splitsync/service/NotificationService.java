package com.splitsync.service;

import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.splitsync.dto.notification.NotificationListResponse;
import com.splitsync.dto.notification.NotificationResponse;
import com.splitsync.entity.Notification;
import com.splitsync.entity.User;
import com.splitsync.entity.enums.NotificationType;
import com.splitsync.exception.ApiExceptions;
import com.splitsync.repository.NotificationRepository;
import com.splitsync.repository.UserSettingsRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final int MAX_LISTED = 50;

    private final NotificationRepository notificationRepository;
    private final UserSettingsRepository userSettingsRepository;

    /**
     * Creates an in-app notification unless the recipient turned that type off in their settings.
     * Invitations are always delivered, since they need a response.
     */
    public void notify(User recipient, NotificationType type, String title, String description,
            Map<String, Object> metadata) {
        if (type != NotificationType.INVITE && !isEnabled(recipient.getId(), type)) {
            return;
        }
        Notification notification = new Notification();
        notification.setUser(recipient);
        notification.setType(type);
        notification.setTitle(title);
        notification.setDescription(description);
        notification.setMetadata(metadata);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public NotificationListResponse list(UUID userId) {
        var data = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, Limit.of(MAX_LISTED)).stream()
                .map(NotificationResponse::from)
                .toList();
        return new NotificationListResponse(data, notificationRepository.countByUserIdAndReadFalse(userId));
    }

    @Transactional
    public NotificationResponse markRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> ApiExceptions.notFound("Notification"));
        notification.setRead(true);
        return NotificationResponse.from(notification);
    }

    @Transactional
    public void markAllRead(UUID userId) {
        notificationRepository.markAllRead(userId);
    }

    /** Idempotent: dismissing a notification that is already gone (or not yours) is a no-op. */
    @Transactional
    public void dismiss(UUID notificationId, UUID userId) {
        notificationRepository.deleteByIdAndUserId(notificationId, userId);
    }

    private boolean isEnabled(UUID userId, NotificationType type) {
        return userSettingsRepository.findById(userId)
                .map(settings -> settings.getNotificationPreferences().getOrDefault(type.dbValue(), true))
                .orElse(true);
    }
}
