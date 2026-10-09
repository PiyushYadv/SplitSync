package com.splitsync.dto.notification;

import java.util.List;

public record NotificationListResponse(List<NotificationResponse> data, long unreadCount) {
}
