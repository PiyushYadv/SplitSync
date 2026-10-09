package com.splitsync.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(Cors cors, Session session, Fx fx) {

    public record Cors(List<String> allowedOrigins) {
    }

    public record Session(String cookieName, String cookieSameSite, boolean cookieSecure) {
    }

    public record Fx(int cacheTtlHours, String baseUrl) {
    }
}
