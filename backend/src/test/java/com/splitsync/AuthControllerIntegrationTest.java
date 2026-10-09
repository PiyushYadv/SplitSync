package com.splitsync;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import jakarta.servlet.http.Cookie;

class AuthControllerIntegrationTest extends IntegrationTestBase {

    @Test
    void meWithoutSessionReturnsJson401() throws Exception {
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
                .andExpect(cookie().doesNotExist(SESSION_COOKIE));
    }

    @Test
    void signupLoginMeLogoutFlow() throws Exception {
        mockMvc.perform(post("/auth/signup").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Alice Chen","email":"Alice.Chen@Example.com","password":"password123"}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").isNotEmpty())
                .andExpect(jsonPath("$.verificationRequired").value(false));

        MvcResult login = mockMvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"alice.chen@example.com","password":"password123"}"""))
                .andExpect(status().isOk())
                .andExpect(cookie().exists(SESSION_COOKIE))
                .andExpect(cookie().httpOnly(SESSION_COOKIE, true))
                .andExpect(jsonPath("$.user.email").value("alice.chen@example.com"))
                .andExpect(jsonPath("$.user.username").value("@alice.chen"))
                .andExpect(jsonPath("$.expiresAt").value(org.hamcrest.Matchers.matchesPattern(
                        "\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z")))
                .andReturn();

        Cookie session = login.getResponse().getCookie(SESSION_COOKIE);
        assertThat(session).isNotNull();

        mockMvc.perform(get("/auth/me").cookie(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Alice Chen"));

        mockMvc.perform(post("/auth/logout").cookie(session))
                .andExpect(status().isNoContent())
                .andExpect(cookie().maxAge(SESSION_COOKIE, 0));

        mockMvc.perform(get("/auth/me").cookie(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void duplicateSignupReturnsConflict() throws Exception {
        String body = """
                {"name":"Bob","email":"bob@example.com","password":"password123"}""";
        mockMvc.perform(post("/auth/signup").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk());
        mockMvc.perform(post("/auth/signup").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_REGISTERED"))
                .andExpect(jsonPath("$.fieldErrors.email").exists());
    }

    @Test
    void invalidSignupReturnsFieldErrors() throws Exception {
        mockMvc.perform(post("/auth/signup").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"","email":"not-an-email","password":"short"}"""))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.name").exists())
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    void wrongPasswordReturns401() throws Exception {
        mockMvc.perform(post("/auth/signup").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Carol","email":"carol@example.com","password":"password123"}"""))
                .andExpect(status().isOk());
        mockMvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"carol@example.com","password":"wrong-password"}"""))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"))
                .andExpect(cookie().doesNotExist(SESSION_COOKIE));
    }
}
