package com.splitsync.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.splitsync.entity.UserIdentity;

public interface UserIdentityRepository extends JpaRepository<UserIdentity, UserIdentity.Key> {
}
