package com.splitsync.security.oauth;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.splitsync.entity.enums.AuthProvider;
import com.splitsync.security.UserPrincipal;

import lombok.extern.slf4j.Slf4j;

/**
 * Loads the provider profile after the OAuth2 code exchange and signs in the matching SplitSync user, returning
 * the same {@link UserPrincipal} a password login stores in the session.
 */
@Slf4j
@Service
public class SplitSyncOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    static final String EMAIL_NOT_VERIFIED = "email_not_verified";
    static final String SIGN_IN_FAILED = "oauth_failed";

    private static final String GITHUB_EMAILS_URL = "https://api.github.com/user/emails";

    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
    private final RestClient restClient = RestClient.create();
    private final OAuthAccountService oauthAccountService;

    public SplitSyncOAuth2UserService(OAuthAccountService oauthAccountService) {
        this.oauthAccountService = oauthAccountService;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) {
        OAuth2User providerUser = delegate.loadUser(request);
        AuthProvider provider = AuthProvider.fromRegistrationId(request.getClientRegistration().getRegistrationId());
        ExternalProfile profile = switch (provider) {
            case GOOGLE -> googleProfile(providerUser.getAttributes());
            case GITHUB -> githubProfile(providerUser.getAttributes(), request.getAccessToken().getTokenValue());
        };
        try {
            return UserPrincipal.from(oauthAccountService.signIn(profile));
        } catch (OAuth2AuthenticationException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            log.error("{} sign-in failed", provider, ex);
            throw error(SIGN_IN_FAILED);
        }
    }

    private static ExternalProfile googleProfile(Map<String, Object> attributes) {
        String email = (String) attributes.get("email");
        return new ExternalProfile(AuthProvider.GOOGLE, (String) attributes.get("sub"), email,
                Boolean.TRUE.equals(attributes.get("email_verified")),
                Optional.ofNullable((String) attributes.get("name")).orElse(email),
                (String) attributes.get("picture"));
    }

    /** GitHub omits private addresses from the profile; the emails API says which one is primary and verified. */
    private ExternalProfile githubProfile(Map<String, Object> attributes, String accessToken) {
        List<Map<String, Object>> emails;
        try {
            emails = restClient.get()
                    .uri(GITHUB_EMAILS_URL)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });
        } catch (RestClientException ex) {
            log.error("Could not read GitHub emails", ex);
            throw error(SIGN_IN_FAILED);
        }
        Map<String, Object> primary = Optional.ofNullable(emails).orElse(List.of()).stream()
                .filter(e -> Boolean.TRUE.equals(e.get("primary")))
                .findFirst()
                .orElseThrow(() -> error(EMAIL_NOT_VERIFIED));

        String login = (String) attributes.get("login");
        return new ExternalProfile(AuthProvider.GITHUB, String.valueOf(attributes.get("id")),
                (String) primary.get("email"), Boolean.TRUE.equals(primary.get("verified")),
                Optional.ofNullable((String) attributes.get("name")).filter(n -> !n.isBlank()).orElse(login),
                (String) attributes.get("avatar_url"));
    }

    static OAuth2AuthenticationException error(String code) {
        return new OAuth2AuthenticationException(new OAuth2Error(code));
    }
}
