package com.splitsync.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.splitsync.dto.common.ListResponse;
import com.splitsync.dto.user.FriendResponse;
import com.splitsync.dto.user.UserSearchResult;
import com.splitsync.security.UserPrincipal;
import com.splitsync.service.UserDirectoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserDirectoryService userDirectoryService;

    @GetMapping("/users/search")
    public ListResponse<UserSearchResult> search(@AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "q", required = false) String query) {
        return ListResponse.of(userDirectoryService.search(principal.getId(), query));
    }

    @GetMapping("/friends")
    public ListResponse<FriendResponse> friends(@AuthenticationPrincipal UserPrincipal principal) {
        return ListResponse.of(userDirectoryService.friends(principal.getId()));
    }
}
