package com.splitsync.security.oauth;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.stereotype.Component;

import com.splitsync.config.AppProperties;
import com.splitsync.entity.enums.AuthProvider;

/**
 * Builds a client registration for each provider whose credentials are configured. The callback URL to register
 * with the provider is {@code <backend>/api/auth/oauth/callback/<provider>}.
 */
@Component
public class OAuthRegistrations {

    public static final String AUTHORIZATION_BASE_URI = "/auth/oauth";
    public static final String CALLBACK_BASE_URI = "/auth/oauth/callback";

    private final List<ClientRegistration> registrations;

    public OAuthRegistrations(AppProperties appProperties) {
        AppProperties.OAuth oauth = appProperties.oauth();
        List<ClientRegistration> list = new ArrayList<>();
        if (oauth.google().isConfigured()) {
            // Plain OAuth2 with the userinfo endpoint (no "openid" scope), so both providers share one user service.
            list.add(build(CommonOAuth2Provider.GOOGLE, AuthProvider.GOOGLE, oauth.google(), "profile", "email"));
        }
        if (oauth.github().isConfigured()) {
            // user:email is needed to read a private primary address and whether it is verified.
            list.add(build(CommonOAuth2Provider.GITHUB, AuthProvider.GITHUB, oauth.github(), "read:user",
                    "user:email"));
        }
        this.registrations = List.copyOf(list);
    }

    public List<ClientRegistration> all() {
        return registrations;
    }

    public List<String> providerIds() {
        return registrations.stream().map(ClientRegistration::getRegistrationId).toList();
    }

    private static ClientRegistration build(CommonOAuth2Provider template, AuthProvider provider,
            AppProperties.Client client, String... scopes) {
        return template.getBuilder(provider.dbValue())
                .clientId(client.clientId())
                .clientSecret(client.clientSecret())
                .scope(scopes)
                .redirectUri("{baseUrl}" + CALLBACK_BASE_URI + "/{registrationId}")
                .build();
    }
}
