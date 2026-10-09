package com.splitsync.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.splitsync.entity.Invitation;
import com.splitsync.entity.enums.InvitationStatus;

public interface InvitationRepository extends JpaRepository<Invitation, UUID> {

    @Query("select i.group.id from Invitation i where i.id = :id and i.invitedUser.id = :invitedUserId")
    Optional<UUID> findGroupIdByIdAndInvitedUserId(@Param("id") UUID id, @Param("invitedUserId") UUID invitedUserId);

    List<Invitation> findByInvitedUserIdAndStatusOrderByCreatedAtDesc(UUID invitedUserId, InvitationStatus status);

    Optional<Invitation> findByGroupIdAndInvitedUserIdAndStatus(UUID groupId, UUID invitedUserId,
            InvitationStatus status);
}
