package com.splitsync.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.splitsync.dto.common.ListResponse;
import com.splitsync.dto.group.CreateGroupRequest;
import com.splitsync.dto.group.GroupDetailResponse;
import com.splitsync.dto.group.GroupSummaryResponse;
import com.splitsync.dto.group.InviteMembersRequest;
import com.splitsync.dto.invitation.InvitationResponse;
import com.splitsync.security.UserPrincipal;
import com.splitsync.service.GroupService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    public ListResponse<GroupSummaryResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        return ListResponse.of(groupService.listForUser(principal.getId()));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GroupDetailResponse create(@AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateGroupRequest request) {
        return groupService.create(principal.getId(), request);
    }

    @GetMapping("/{id}")
    public GroupDetailResponse get(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        return groupService.get(id, principal.getId());
    }

    @PostMapping("/{id}/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leave(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        groupService.leave(id, principal.getId());
    }

    @PostMapping("/{id}/invitations")
    @ResponseStatus(HttpStatus.CREATED)
    public ListResponse<InvitationResponse> invite(@AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id, @Valid @RequestBody InviteMembersRequest request) {
        return ListResponse.of(groupService.invite(id, principal.getId(), request.userIds()));
    }
}
