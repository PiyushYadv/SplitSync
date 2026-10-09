package com.splitsync;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.splitsync.service.fx.ExchangeRateProvider;

import jakarta.servlet.http.Cookie;

/**
 * Starts Postgres and Redis once for the whole test run; every integration test class shares them and the
 * Spring context. The external FX API is replaced with a mock.
 */
@SpringBootTest
@AutoConfigureMockMvc
public abstract class IntegrationTestBase {

    protected static final String SESSION_COOKIE = "splitsync_session";

    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @ServiceConnection(name = "redis")
    static final GenericContainer<?> REDIS = new GenericContainer<>("redis:7-alpine").withExposedPorts(6379);

    static {
        POSTGRES.start();
        REDIS.start();
    }

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @MockBean
    protected ExchangeRateProvider exchangeRateProvider;

    protected record TestUser(UUID id, String name, Cookie session) {
    }

    /** Signs up a user with a unique email and returns their logged-in session. */
    protected TestUser signupAndLogin(String name) throws Exception {
        String email = name.toLowerCase().replace(' ', '.') + "." + UUID.randomUUID().toString().substring(0, 8)
                + "@example.com";
        mockMvc.perform(post("/auth/signup").contentType(MediaType.APPLICATION_JSON)
                        .content(json("name", name, "email", email, "password", "password123")))
                .andExpect(status().isOk());
        var login = mockMvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json("email", email, "password", "password123")))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode body = objectMapper.readTree(login.getResponse().getContentAsString());
        return new TestUser(UUID.fromString(body.path("user").path("id").asText()), name,
                login.getResponse().getCookie(SESSION_COOKIE));
    }

    protected String json(Object... keyValues) throws Exception {
        var map = new java.util.LinkedHashMap<String, Object>();
        for (int i = 0; i < keyValues.length; i += 2) {
            map.put((String) keyValues[i], keyValues[i + 1]);
        }
        return objectMapper.writeValueAsString(map);
    }

    protected JsonNode body(org.springframework.test.web.servlet.ResultActions result) throws Exception {
        return objectMapper.readTree(result.andReturn().getResponse().getContentAsString());
    }
}
