package com.splitsync.service;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.splitsync.entity.Notification;
import com.splitsync.entity.User;
import com.splitsync.entity.enums.NotificationType;
import com.splitsync.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void notify(User recipient, NotificationType type, String title, String description,
            Map<String, Object> metadata) {
        Notification notification = new Notification();
        notification.setUser(recipient);
        notification.setType(type);
        notification.setTitle(title);
        notification.setDescription(description);
        notification.setMetadata(metadata);
        notificationRepository.save(notification);
    }
}
