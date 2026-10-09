package com.splitsync.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.splitsync.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
}
