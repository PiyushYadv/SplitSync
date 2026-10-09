package com.splitsync.service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.splitsync.dto.common.UserSummary;
import com.splitsync.dto.user.FriendResponse;
import com.splitsync.dto.user.UserSearchResult;
import com.splitsync.entity.User;
import com.splitsync.exception.ApiExceptions;
import com.splitsync.repository.GroupMemberRepository;
import com.splitsync.repository.UserRepository;
import com.splitsync.repository.projection.UserCount;
import com.splitsync.repository.projection.UserPair;

import lombok.RequiredArgsConstructor;

/**
 * User discovery. There is no separate friendship table: your friends are the people you share at least one
 * group with.
 */
@Service
@RequiredArgsConstructor
public class UserDirectoryService {

    public static final int MIN_QUERY_LENGTH = 2;
    private static final int MAX_RESULTS = 20;

    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;

    @Transactional(readOnly = true)
    public List<FriendResponse> friends(UUID userId) {
        Map<UUID, Long> sharedGroups = groupMemberRepository.findCoMembersWithSharedGroupCount(userId).stream()
                .collect(Collectors.toMap(UserCount::userId, UserCount::count));
        return userRepository.findAllById(sharedGroups.keySet()).stream()
                .sorted(Comparator.comparing(User::getName, String.CASE_INSENSITIVE_ORDER).thenComparing(User::getId))
                .map(u -> FriendResponse.of(UserSummary.from(u, userId), sharedGroups.get(u.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserSearchResult> search(UUID userId, String rawQuery) {
        String query = rawQuery == null ? "" : rawQuery.trim().toLowerCase(Locale.ROOT);
        if (query.startsWith("@")) {
            query = query.substring(1);
        }
        if (query.length() < MIN_QUERY_LENGTH) {
            throw ApiExceptions.invalidField("q", "Enter at least " + MIN_QUERY_LENGTH + " characters");
        }

        String escaped = escapeLike(query);
        List<User> matches = userRepository.search(userId, query, escaped + "%", "%" + escaped + "%",
                Limit.of(MAX_RESULTS));
        if (matches.isEmpty()) {
            return List.of();
        }

        Set<UUID> ids = new HashSet<>(matches.stream().map(User::getId).toList());
        ids.add(userId);
        Map<UUID, Set<UUID>> friendsOf = new HashMap<>();
        for (UserPair pair : groupMemberRepository.findCoMemberPairs(ids)) {
            friendsOf.computeIfAbsent(pair.userId(), id -> new HashSet<>()).add(pair.otherUserId());
        }
        Set<UUID> myFriends = friendsOf.getOrDefault(userId, Set.of());

        return matches.stream().map(user -> {
            long mutual = friendsOf.getOrDefault(user.getId(), Set.of()).stream().filter(myFriends::contains).count();
            return UserSearchResult.of(UserSummary.from(user, userId), mutual, myFriends.contains(user.getId()));
        }).toList();
    }

    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
