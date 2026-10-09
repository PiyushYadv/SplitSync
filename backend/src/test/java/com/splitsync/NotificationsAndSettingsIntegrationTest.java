package com.splitsync;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import com.fasterxml.jackson.databind.JsonNode;

import jakarta.servlet.http.Cookie;

class NotificationsAndSettingsIntegrationTest extends IntegrationTestBase {

    @Test
    void notificationsCanBeReadAndDismissed() throws Exception {
        TestUser alice = signupAndLogin("Alice Notify");
        TestUser bob = signupAndLogin("Bob Notify");
        UUID groupId = createGroup(alice, "Flat", "USD", bob);
        addExpense(alice, groupId, "Rent", "1000.00", "USD", "Rent");

        JsonNode list = body(mockMvc.perform(get("/notifications").cookie(bob.session())).andExpect(status().isOk()));
        assertThat(list.path("unreadCount").asInt()).isEqualTo(2);
        assertThat(list.path("data").get(0).path("type").asText()).isEqualTo("expense");
        assertThat(list.path("data").get(0).path("desc").asText()).contains("Rent");
        assertThat(list.path("data").get(1).path("type").asText()).isEqualTo("invite");

        String expenseNotification = list.path("data").get(0).path("id").asText();
        for (int i = 0; i < 2; i++) {
            mockMvc.perform(post("/notifications/{id}/read", expenseNotification).cookie(bob.session()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.read").value(true));
        }
        // Alice can't touch Bob's notifications.
        mockMvc.perform(post("/notifications/{id}/read", expenseNotification).cookie(alice.session()))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/notifications/read-all").cookie(bob.session())).andExpect(status().isNoContent());
        mockMvc.perform(get("/notifications").cookie(bob.session())).andExpect(jsonPath("$.unreadCount").value(0));

        for (int i = 0; i < 2; i++) {
            mockMvc.perform(delete("/notifications/{id}", expenseNotification).cookie(bob.session()))
                    .andExpect(status().isNoContent());
        }
        mockMvc.perform(get("/notifications").cookie(bob.session())).andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    void disabledNotificationTypesAreNotDelivered() throws Exception {
        TestUser alice = signupAndLogin("Alice Mute");
        TestUser bob = signupAndLogin("Bob Mute");
        UUID groupId = createGroup(alice, "Trip", "USD", bob);

        patchSettings(bob.session(), "notifications", Map.of("expense", false))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notifications.expense").value(false))
                .andExpect(jsonPath("$.notifications.settlement").value(true));
        addExpense(alice, groupId, "Fuel", "40.00", "USD", "Transport");

        JsonNode list = body(mockMvc.perform(get("/notifications").cookie(bob.session())));
        assertThat(list.path("data")).allSatisfy(n -> assertThat(n.path("type").asText()).isNotEqualTo("expense"));
    }

    @Test
    void settingsAreValidatedPerSection() throws Exception {
        TestUser user = signupAndLogin("Settings User");

        mockMvc.perform(get("/me/settings").cookie(user.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.theme").value("system"))
                .andExpect(jsonPath("$.currency").value("USD"))
                .andExpect(jsonPath("$.profile.name").value("Settings User"));

        patchSettings(user.session(), "appearance", Map.of("theme", "dark", "dateFormat", "YYYY-MM-DD"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.theme").value("dark"))
                .andExpect(jsonPath("$.dateFormat").value("YYYY-MM-DD"));
        patchSettings(user.session(), "appearance", Map.of("theme", "neon"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.fieldErrors.theme").exists());
        patchSettings(user.session(), "appearance", Map.of("currency", "EUR"))
                .andExpect(status().isUnprocessableEntity());
        patchSettings(user.session(), "currency", Map.of("currency", "eur"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currency").value("EUR"));
        patchSettings(user.session(), "billing", Map.of("plan", "pro"))
                .andExpect(status().isUnprocessableEntity());

        String handle = "handle_" + UUID.randomUUID().toString().substring(0, 8);
        patchSettings(user.session(), "profile", Map.of("username", "@" + handle, "name", "Renamed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.username").value("@" + handle))
                .andExpect(jsonPath("$.profile.name").value("Renamed"));
        TestUser other = signupAndLogin("Other Settings");
        patchSettings(other.session(), "profile", Map.of("username", handle))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("USERNAME_TAKEN"));
    }

    @Test
    void passwordChangeSignsOutOtherSessions() throws Exception {
        TestUser user = signupAndLogin("Password User");
        String email = body(mockMvc.perform(get("/auth/me").cookie(user.session()))).path("email").asText();
        Cookie secondDevice = mockMvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json("email", email, "password", "password123")))
                .andExpect(status().isOk())
                .andReturn().getResponse().getCookie(SESSION_COOKIE);

        patchSettings(user.session(), "security", Map.of("currentPassword", "wrong-password", "newPassword", "newpass123"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.fieldErrors.currentPassword").exists());
        patchSettings(user.session(), "security", Map.of("currentPassword", "password123", "newPassword", "newpass123"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/auth/me").cookie(user.session())).andExpect(status().isOk());
        mockMvc.perform(get("/auth/me").cookie(secondDevice)).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json("email", email, "password", "newpass123")))
                .andExpect(status().isOk());
    }

    private org.springframework.test.web.servlet.ResultActions patchSettings(Cookie session, String section,
            Map<String, Object> values) throws Exception {
        return mockMvc.perform(patch("/me/settings").cookie(session).contentType(MediaType.APPLICATION_JSON)
                .content(json("section", section, "values", values)));
    }
}
