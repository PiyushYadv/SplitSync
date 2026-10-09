package com.splitsync;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;

class UserDirectoryIntegrationTest extends IntegrationTestBase {

    /** A surname no other test uses, so searches only see this test's users. */
    private static String uniqueSurname() {
        StringBuilder sb = new StringBuilder("Qx");
        for (int i = 0; i < 8; i++) {
            sb.append((char) ('a' + ThreadLocalRandom.current().nextInt(26)));
        }
        return sb.toString();
    }

    @Test
    void searchReportsFriendshipAndMutualFriends() throws Exception {
        String surname = uniqueSurname();
        TestUser me = signupAndLogin("Me " + surname);
        TestUser friend = signupAndLogin("Friend " + surname);
        TestUser friendOfFriend = signupAndLogin("Fof " + surname);
        TestUser stranger = signupAndLogin("Stranger " + surname);

        createGroup(me, "Mine", "USD", friend);
        createGroup(friend, "Theirs", "USD", friendOfFriend);

        JsonNode results = body(mockMvc.perform(get("/users/search").param("q", surname.toLowerCase())
                .cookie(me.session())).andExpect(status().isOk()));
        Map<String, JsonNode> byName = new HashMap<>();
        results.path("data").forEach(r -> byName.put(r.path("name").asText(), r));

        assertThat(byName).containsOnlyKeys(friend.name(), friendOfFriend.name(), stranger.name());
        assertThat(byName.get(friend.name()).path("friend").asBoolean()).isTrue();
        assertThat(byName.get(friendOfFriend.name()).path("friend").asBoolean()).isFalse();
        assertThat(byName.get(friendOfFriend.name()).path("mutualCount").asInt()).isEqualTo(1);
        assertThat(byName.get(stranger.name()).path("mutualCount").asInt()).isZero();
        assertThat(byName.get(stranger.name()).has("email")).isFalse();

        mockMvc.perform(get("/friends").cookie(me.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(friend.id().toString()))
                .andExpect(jsonPath("$.data[0].sharedGroupCount").value(1));
    }

    @Test
    void searchValidatesQueryAndTreatsWildcardsLiterally() throws Exception {
        TestUser me = signupAndLogin("Wildcard " + uniqueSurname());

        mockMvc.perform(get("/users/search").param("q", "a").cookie(me.session()))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.fieldErrors.q").exists());
        mockMvc.perform(get("/users/search").param("q", "%%").cookie(me.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(0));
    }

    @Test
    void searchIsRateLimitedPerUser() throws Exception {
        TestUser me = signupAndLogin("Limited " + uniqueSurname());
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(get("/users/search").param("q", "nobody-matches").cookie(me.session()))
                    .andExpect(status().isOk());
        }
        mockMvc.perform(get("/users/search").param("q", "nobody-matches").cookie(me.session()))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.code").value("RATE_LIMITED"));

        // The bucket is per user, so someone else is unaffected.
        TestUser other = signupAndLogin("Other " + uniqueSurname());
        mockMvc.perform(get("/users/search").param("q", "nobody-matches").cookie(other.session()))
                .andExpect(status().isOk());
    }
}
