package com.splitsync.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.splitsync.entity.UserSettings;

public interface UserSettingsRepository extends JpaRepository<UserSettings, UUID> {
}
