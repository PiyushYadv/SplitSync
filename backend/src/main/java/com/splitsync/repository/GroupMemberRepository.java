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

public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {

    List<GroupMember> findByIdGroupIdOrderByJoinedAtAsc(UUID groupId);

    @Query("""
            select new com.splitsync.repository.projection.GroupCount(gm.id.groupId, count(gm))
            from GroupMember gm where gm.id.groupId in :groupIds group by gm.id.groupId
            """)
    List<GroupCount> countByGroupIds(@Param("groupIds") Collection<UUID> groupIds);

    long countByIdGroupId(UUID groupId);
}
