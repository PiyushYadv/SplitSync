package com.splitsync.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(String frontendUrl, Cors cors, Session session, Fx fx, Mail mail, OAuth oauth,
        Ocr ocr, RateLimit rateLimit) {

    public record Cors(List<String> allowedOrigins) {
    }

    public record Session(String cookieName, String cookieSameSite, boolean cookieSecure) {
    }

    public record Fx(int cacheTtlHours, String baseUrl) {
    }

    /** Sender for verification, password reset and email change messages. */
    public record Mail(String from) {
    }

    /** A provider is offered only when both its client id and secret are set. */
    public record OAuth(Client google, Client github) {
    }

    public record Client(String clientId, String clientSecret) {

        public boolean isConfigured() {
            return clientId != null && !clientId.isBlank() && clientSecret != null && !clientSecret.isBlank();
        }
    }

    /** Receipt scanning is offered only when a Gemini API key is set. */
    public record Ocr(Gemini gemini) {
    }

    public record Gemini(String apiKey, String model, String baseUrl) {

        public boolean isConfigured() {
            return apiKey != null && !apiKey.isBlank();
        }
    }

    public record RateLimit(boolean enabled, Bucket login, Bucket signup, Bucket userSearch, Bucket email,
            Bucket receiptScan) {
    }

    /** Token bucket: up to {@code capacity} requests in a burst, refilled at {@code refillPerMinute}. */
    public record Bucket(int capacity, int refillPerMinute) {
    }
}
