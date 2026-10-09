package com.splitsync.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.splitsync.entity.User;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    /** Username prefix or name substring match; exact username matches first. Patterns must be LIKE-escaped. */
    @Query("""
            select u from User u
            where u.id <> :excludeId
              and (lower(u.username) like :usernamePrefix escape '\\' or lower(u.name) like :nameContains escape '\\')
            order by case when lower(u.username) = :exact then 0 else 1 end, u.name, u.id
            """)
    List<User> search(@Param("excludeId") UUID excludeId, @Param("exact") String exact,
            @Param("usernamePrefix") String usernamePrefix, @Param("nameContains") String nameContains, Limit limit);
}
