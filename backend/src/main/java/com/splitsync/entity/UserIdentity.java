package com.splitsync.entity;

import java.io.Serializable;
import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;

import com.splitsync.entity.enums.AuthProvider;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A Google or GitHub account linked to a SplitSync user. */
@Entity
@Table(name = "user_identities")
@Getter
@Setter
@NoArgsConstructor
public class UserIdentity {

    @EmbeddedId
    private Key id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public UserIdentity(AuthProvider provider, String providerUserId, User user) {
        this.id = new Key(provider, providerUserId);
        this.user = user;
    }

    @Embeddable
    public record Key(
            @Column(name = "provider", nullable = false, length = 20) AuthProvider provider,
            @Column(name = "provider_user_id", nullable = false) String providerUserId) implements Serializable {
    }
}
