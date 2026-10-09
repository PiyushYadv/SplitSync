package com.splitsync.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.splitsync.entity.ExpenseGroup;
import com.splitsync.entity.GroupMemberId;
import com.splitsync.exception.ApiExceptions;
import com.splitsync.repository.ExpenseGroupRepository;
import com.splitsync.repository.GroupMemberRepository;

import lombok.RequiredArgsConstructor;

/**
 * Membership checks for group-scoped resources. Non-members get 404 rather than 403 so group ids can't be
 * probed for existence.
 */
@Service
@RequiredArgsConstructor
public class GroupAccessService {

    private final ExpenseGroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;

    public boolean isMember(UUID groupId, UUID userId) {
        return groupMemberRepository.existsById(new GroupMemberId(groupId, userId));
    }

    @Transactional(readOnly = true)
    public ExpenseGroup requireMember(UUID groupId, UUID userId) {
        if (!isMember(groupId, userId)) {
            throw ApiExceptions.notFound("Group");
        }
        return groupRepository.findById(groupId).orElseThrow(() -> ApiExceptions.notFound("Group"));
    }

    /** Locks the group row until the caller's transaction ends; fails fast if there is no transaction. */
    @Transactional(propagation = Propagation.MANDATORY)
    public ExpenseGroup lockForMember(UUID groupId, UUID userId) {
        if (!isMember(groupId, userId)) {
            throw ApiExceptions.notFound("Group");
        }
        return lock(groupId);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public ExpenseGroup lock(UUID groupId) {
        return groupRepository.findByIdForUpdate(groupId).orElseThrow(() -> ApiExceptions.notFound("Group"));
    }
}
