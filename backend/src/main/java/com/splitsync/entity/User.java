package com.splitsync.entity;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    /** Stored without the leading "@"; the API presents it as "@handle". */
    @Column(unique = true, length = 100)
    private String username;

    /** Null for accounts that only sign in with Google or GitHub. */
    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "avatar_url", length = 1024)
    private String avatarUrl;

    @Column(name = "default_currency", nullable = false, length = 10)
    private String defaultCurrency = "USD";

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
