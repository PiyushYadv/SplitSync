package com.splitsync.dto.notification;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import com.splitsync.entity.Notification;
import com.splitsync.entity.enums.NotificationType;

/** {@code desc} and {@code time} are the field names the frontend's notification model uses. */
public record NotificationResponse(UUID id, NotificationType type, String title, String desc, Instant time,
        boolean read, Instant createdAt, Map<String, Object> metadata) {

    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(n.getId(), n.getType(), n.getTitle(), n.getDescription(), n.getCreatedAt(),
                n.isRead(), n.getCreatedAt(), n.getMetadata());
    }
}
