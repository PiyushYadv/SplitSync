package com.splitsync.security.oauth;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Provider access tokens are only used during sign-in, so they are not kept (the default would hold every one
 * in memory for the life of the process).
 */
public class NoOpAuthorizedClientRepository implements OAuth2AuthorizedClientRepository {

    @Override
    public <T extends OAuth2AuthorizedClient> T loadAuthorizedClient(String clientRegistrationId,
            Authentication principal, HttpServletRequest request) {
        return null;
    }

    @Override
    public void saveAuthorizedClient(OAuth2AuthorizedClient authorizedClient, Authentication principal,
            HttpServletRequest request, HttpServletResponse response) {
    }

    @Override
    public void removeAuthorizedClient(String clientRegistrationId, Authentication principal,
            HttpServletRequest request, HttpServletResponse response) {
    }
}
