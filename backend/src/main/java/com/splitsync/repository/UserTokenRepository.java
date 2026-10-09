package com.splitsync.repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.splitsync.entity.UserToken;
import com.splitsync.entity.enums.TokenPurpose;

public interface UserTokenRepository extends JpaRepository<UserToken, UUID> {

    Optional<UserToken> findByTokenHashAndPurpose(String tokenHash, TokenPurpose purpose);

    /** Retires a user's outstanding tokens of one kind, so only the newest emailed link works. */
    @Modifying
    @Query("""
            update UserToken t set t.usedAt = :now
            where t.user.id = :userId and t.purpose = :purpose and t.usedAt is null
            """)
    void invalidateOutstanding(@Param("userId") UUID userId, @Param("purpose") TokenPurpose purpose,
            @Param("now") Instant now);
}
