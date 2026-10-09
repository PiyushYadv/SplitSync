package com.splitsync.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.splitsync.entity.GroupMember;
import com.splitsync.entity.GroupMemberId;
import com.splitsync.repository.projection.GroupCount;
import com.splitsync.repository.projection.UserCount;
import com.splitsync.repository.projection.UserPair;

public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {

    List<GroupMember> findByIdGroupIdOrderByJoinedAtAsc(UUID groupId);

    @Query("""
            select new com.splitsync.repository.projection.GroupCount(gm.id.groupId, count(gm))
            from GroupMember gm where gm.id.groupId in :groupIds group by gm.id.groupId
            """)
    List<GroupCount> countByGroupIds(@Param("groupIds") Collection<UUID> groupIds);

    long countByIdGroupId(UUID groupId);

    /** Everyone who shares at least one group with {@code userId}, with the number of shared groups. */
    @Query("""
            select new com.splitsync.repository.projection.UserCount(b.id.userId, count(distinct b.id.groupId))
            from GroupMember a, GroupMember b
            where a.id.groupId = b.id.groupId and a.id.userId = :userId and b.id.userId <> :userId
            group by b.id.userId
            """)
    List<UserCount> findCoMembersWithSharedGroupCount(@Param("userId") UUID userId);

    /** Pairs (user, co-member) for each of {@code userIds}: used to count mutual friends. */
    @Query("""
            select distinct new com.splitsync.repository.projection.UserPair(a.id.userId, b.id.userId)
            from GroupMember a, GroupMember b
            where a.id.groupId = b.id.groupId and a.id.userId in :userIds and b.id.userId <> a.id.userId
            """)
    List<UserPair> findCoMemberPairs(@Param("userIds") Collection<UUID> userIds);
}
