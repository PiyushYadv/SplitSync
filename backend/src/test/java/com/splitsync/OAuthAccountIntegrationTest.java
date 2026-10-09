package com.splitsync;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;

import com.splitsync.entity.User;
import com.splitsync.entity.enums.AuthProvider;
import com.splitsync.repository.UserRepository;
import com.splitsync.security.UserPrincipal;
import com.splitsync.security.oauth.ExternalProfile;
import com.splitsync.security.oauth.OAuthAccountService;

/** Account matching behind Google/GitHub sign-in; the redirect flow itself is Spring Security's. */
class OAuthAccountIntegrationTest extends IntegrationTestBase {

    @Autowired
    private OAuthAccountService oauthAccountService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void firstSignInCreatesAVerifiedAccountWithoutPassword() {
        String email = unique("new") + "@Gmail.com";
        User user = oauthAccountService.signIn(profile(AuthProvider.GOOGLE, "g-" + UUID.randomUUID(), email, true));

        assertThat(user.getEmail()).isEqualTo(email.toLowerCase());
        assertThat(user.isEmailVerified()).isTrue();
        assertThat(user.getPasswordHash()).isNull();
        assertThat(user.getAvatarUrl()).isEqualTo("https://example.com/avatar.png");
    }

    @Test
    void laterSignInsFindTheLinkedAccountEvenAfterAnEmailChange() {
        String subject = "gh-" + UUID.randomUUID();
        User first = oauthAccountService.signIn(profile(AuthProvider.GITHUB, subject, unique("a") + "@x.dev", true));
        User again = oauthAccountService.signIn(profile(AuthProvider.GITHUB, subject, unique("b") + "@x.dev", true));

        assertThat(again.getId()).isEqualTo(first.getId());
    }

    @Test
    void unverifiedProviderEmailIsRejected() {
        assertThatThrownBy(() -> oauthAccountService.signIn(
                profile(AuthProvider.GITHUB, "gh-" + UUID.randomUUID(), unique("u") + "@x.dev", false)))
                .isInstanceOf(OAuth2AuthenticationException.class)
                .extracting(ex -> ((OAuth2AuthenticationException) ex).getError().getErrorCode())
                .isEqualTo("email_not_verified");
    }

    @Test
    void signingInToAnUnverifiedPasswordAccountRevokesThePasswordAndSessions() throws Exception {
        // Someone registers an address they don't own; the real owner later signs in with Google.
        TestUser squatter = signupAndLogin("Squatter");
        String email = body(mockMvc.perform(get("/auth/me").cookie(squatter.session()))).path("email").asText();

        User owner = oauthAccountService.signIn(profile(AuthProvider.GOOGLE, "g-" + UUID.randomUUID(), email, true));

        assertThat(owner.getId()).isEqualTo(squatter.id());
        assertThat(userRepository.findById(owner.getId()).orElseThrow().getPasswordHash()).isNull();
        mockMvc.perform(get("/auth/me").cookie(squatter.session())).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json("email", email, "password", "password123")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void signingInToAVerifiedPasswordAccountKeepsThePassword() throws Exception {
        TestUser user = signupAndLogin("Verified Owner");
        String email = body(mockMvc.perform(get("/auth/me").cookie(user.session()))).path("email").asText();
        mockMvc.perform(post("/auth/verify-email").contentType(MediaType.APPLICATION_JSON)
                        .content(json("token", tokenIn(awaitEmail(email, "Verify")))))
                .andExpect(status().isNoContent());

        oauthAccountService.signIn(profile(AuthProvider.GOOGLE, "g-" + UUID.randomUUID(), email, true));

        mockMvc.perform(get("/auth/me").cookie(user.session())).andExpect(status().isOk());
        mockMvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json("email", email, "password", "password123")))
                .andExpect(status().isOk());
    }

    @Test
    void passwordlessAccountCanSetAPasswordWithoutTheCurrentOne() throws Exception {
        String email = unique("passwordless") + "@x.dev";
        User user = oauthAccountService.signIn(profile(AuthProvider.GOOGLE, "g-" + UUID.randomUUID(), email, true));
        UserPrincipal principal = UserPrincipal.from(user);
        var signedIn = authentication(
                UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.getAuthorities()));

        mockMvc.perform(get("/me/settings").with(signedIn))
                .andExpect(jsonPath("$.profile.hasPassword").value(false))
                .andExpect(jsonPath("$.profile.emailVerified").value(true));
        mockMvc.perform(patch("/me/settings").with(signedIn).contentType(MediaType.APPLICATION_JSON)
                        .content(json("section", "security", "values", Map.of("newPassword", "first-password"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.hasPassword").value(true));

        mockMvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json("email", email, "password", "first-password")))
                .andExpect(status().isOk());
    }

    private static ExternalProfile profile(AuthProvider provider, String subject, String email, boolean verified) {
        return new ExternalProfile(provider, subject, email, verified, "Provider User",
                "https://example.com/avatar.png");
    }

    private static String unique(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8);
    }
}
