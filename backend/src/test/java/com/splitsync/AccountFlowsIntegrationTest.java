package com.splitsync;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;

import com.splitsync.service.mail.OutgoingEmail;

import jakarta.servlet.http.Cookie;

class AccountFlowsIntegrationTest extends IntegrationTestBase {

    @Test
    void signupSendsVerificationEmailThatVerifiesOnce() throws Exception {
        TestUser user = signupAndLogin("Verify Me");
        String email = emailOf(user);
        mockMvc.perform(get("/auth/me").cookie(user.session()))
                .andExpect(jsonPath("$.emailVerified").value(false));

        String token = tokenIn(awaitEmail(email, "Verify your SplitSync email"));
        postToken("/auth/verify-email", token).andExpect(status().isNoContent());

        mockMvc.perform(get("/auth/me").cookie(user.session()))
                .andExpect(jsonPath("$.emailVerified").value(true));
        postToken("/auth/verify-email", token)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_TOKEN"));
        mockMvc.perform(post("/auth/verify-email/resend").cookie(user.session()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_VERIFIED"));
    }

    @Test
    void resendingVerificationRetiresTheEarlierLink() throws Exception {
        TestUser user = signupAndLogin("Resend Me");
        String email = emailOf(user);
        String first = tokenIn(awaitEmail(email, "Verify your SplitSync email"));
        Mockito.clearInvocations(emailSender);

        mockMvc.perform(post("/auth/verify-email/resend").cookie(user.session()))
                .andExpect(status().isNoContent());
        String second = tokenIn(awaitEmail(email, "Verify your SplitSync email"));

        assertThat(second).isNotEqualTo(first);
        postToken("/auth/verify-email", first).andExpect(status().isBadRequest());
        postToken("/auth/verify-email", second).andExpect(status().isNoContent());
    }

    @Test
    void forgotPasswordIsSilentForUnknownEmails() throws Exception {
        mockMvc.perform(post("/auth/forgot-password").contentType(MediaType.APPLICATION_JSON)
                        .content(json("email", "nobody-" + UUID.randomUUID() + "@example.com")))
                .andExpect(status().isNoContent());
        Thread.sleep(300);
        Mockito.verify(emailSender, Mockito.never())
                .send(Mockito.argThat(email -> email.subject().contains("Reset")));
    }

    @Test
    void passwordResetChangesPasswordAndSignsOutEverywhere() throws Exception {
        TestUser user = signupAndLogin("Forgetful User");
        String email = emailOf(user);

        mockMvc.perform(post("/auth/forgot-password").contentType(MediaType.APPLICATION_JSON)
                        .content(json("email", email.toUpperCase())))
                .andExpect(status().isNoContent());
        String token = tokenIn(awaitEmail(email, "Reset your SplitSync password"));

        mockMvc.perform(post("/auth/reset-password").contentType(MediaType.APPLICATION_JSON)
                        .content(json("token", token, "password", "short")))
                .andExpect(status().isUnprocessableEntity());
        mockMvc.perform(post("/auth/reset-password").contentType(MediaType.APPLICATION_JSON)
                        .content(json("token", token, "password", "brand-new-pass")))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/auth/me").cookie(user.session())).andExpect(status().isUnauthorized());
        login(email, "password123").andExpect(status().isUnauthorized());
        Cookie session = login(email, "brand-new-pass").andExpect(status().isOk())
                .andReturn().getResponse().getCookie(SESSION_COOKIE);
        // Opening the reset link proved the user owns the inbox.
        mockMvc.perform(get("/auth/me").cookie(session)).andExpect(jsonPath("$.emailVerified").value(true));

        mockMvc.perform(post("/auth/reset-password").contentType(MediaType.APPLICATION_JSON)
                        .content(json("token", token, "password", "another-pass")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_TOKEN"));
    }

    @Test
    void emailChangeAppliesOnlyAfterConfirmationAndKeepsSessions() throws Exception {
        TestUser user = signupAndLogin("Moving User");
        String oldEmail = emailOf(user);
        String newEmail = "moved-" + UUID.randomUUID().toString().substring(0, 8) + "@Example.com";

        changeEmail(user.session(), newEmail, "wrong-password")
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.fieldErrors.currentPassword").exists());
        TestUser other = signupAndLogin("Taken Address");
        changeEmail(user.session(), emailOf(other), "password123")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_REGISTERED"));

        changeEmail(user.session(), newEmail, "password123").andExpect(status().isAccepted());
        String normalized = newEmail.toLowerCase();
        String token = tokenIn(awaitEmail(normalized, "Confirm your new SplitSync email"));
        // Nothing changes until the link is opened.
        assertThat(emailOf(user)).isEqualTo(oldEmail);

        postToken("/auth/confirm-email-change", token).andExpect(status().isNoContent());

        mockMvc.perform(get("/auth/me").cookie(user.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(normalized))
                .andExpect(jsonPath("$.emailVerified").value(true));
        OutgoingEmail notice = awaitEmail(oldEmail, "Your SplitSync email was changed");
        assertThat(notice.text()).contains(normalized);
        login(oldEmail, "password123").andExpect(status().isUnauthorized());
        login(normalized, "password123").andExpect(status().isOk());
    }

    @Test
    void verificationLinkForAnOldAddressStopsWorkingAfterEmailChange() throws Exception {
        TestUser user = signupAndLogin("Changed Before Verifying");
        String verifyToken = tokenIn(awaitEmail(emailOf(user), "Verify your SplitSync email"));
        String newEmail = "new-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";

        changeEmail(user.session(), newEmail, "password123").andExpect(status().isAccepted());
        postToken("/auth/confirm-email-change", tokenIn(awaitEmail(newEmail, "Confirm your new")))
                .andExpect(status().isNoContent());

        postToken("/auth/verify-email", verifyToken)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_TOKEN"));
    }

    @Test
    void configReportsNoOptionalFeaturesWhenUnconfigured() throws Exception {
        mockMvc.perform(get("/config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.oauthProviders").isEmpty())
                .andExpect(jsonPath("$.receiptScanning").value(false));
    }

    private String emailOf(TestUser user) throws Exception {
        return body(mockMvc.perform(get("/auth/me").cookie(user.session()))).path("email").asText();
    }

    private org.springframework.test.web.servlet.ResultActions postToken(String path, String token) throws Exception {
        return mockMvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content(json("token", token)));
    }

    private org.springframework.test.web.servlet.ResultActions login(String email, String password) throws Exception {
        return mockMvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(json("email", email, "password", password)));
    }

    private org.springframework.test.web.servlet.ResultActions changeEmail(Cookie session, String email,
            String currentPassword) throws Exception {
        return mockMvc.perform(post("/me/email").cookie(session).contentType(MediaType.APPLICATION_JSON)
                .content(json("email", email, "currentPassword", currentPassword)));
    }
}
