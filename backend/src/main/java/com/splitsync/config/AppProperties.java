package com.splitsync.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(Cors cors, Session session, Fx fx, RateLimit rateLimit) {

    public record Cors(List<String> allowedOrigins) {
    }

    public record Session(String cookieName, String cookieSameSite, boolean cookieSecure) {
    }

    public record Fx(int cacheTtlHours, String baseUrl) {
    }

    public record RateLimit(boolean enabled, Bucket login, Bucket signup, Bucket userSearch) {
    }

    /** Token bucket: up to {@code capacity} requests in a burst, refilled at {@code refillPerMinute}. */
    public record Bucket(int capacity, int refillPerMinute) {
    }
}
