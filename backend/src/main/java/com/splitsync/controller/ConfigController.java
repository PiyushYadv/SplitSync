package com.splitsync.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.splitsync.config.AppProperties;
import com.splitsync.dto.config.ClientConfigResponse;
import com.splitsync.security.oauth.OAuthRegistrations;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ConfigController {

    private final OAuthRegistrations oauthRegistrations;
    private final AppProperties appProperties;

    @GetMapping("/config")
    public ClientConfigResponse config() {
        return new ClientConfigResponse(oauthRegistrations.providerIds(),
                appProperties.ocr().gemini().isConfigured());
    }
}
