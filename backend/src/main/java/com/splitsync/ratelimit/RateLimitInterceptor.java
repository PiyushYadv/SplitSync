package com.splitsync.ratelimit;

import java.io.IOException;
import java.util.function.Function;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.servlet.HandlerInterceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.splitsync.config.AppProperties.Bucket;
import com.splitsync.exception.ApiErrorResponse;
import com.splitsync.exception.ErrorCode;
import com.splitsync.security.UserPrincipal;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/** Applies one rate-limit rule to the paths it is registered for (see WebConfig). */
public class RateLimitInterceptor implements HandlerInterceptor {

    private final String name;
    private final Bucket bucket;
    private final Function<HttpServletRequest, String> keyResolver;
    private final RateLimiter rateLimiter;
    private final ObjectMapper objectMapper;

    private RateLimitInterceptor(String name, Bucket bucket, Function<HttpServletRequest, String> keyResolver,
            RateLimiter rateLimiter, ObjectMapper objectMapper) {
        this.name = name;
        this.bucket = bucket;
        this.keyResolver = keyResolver;
        this.rateLimiter = rateLimiter;
        this.objectMapper = objectMapper;
    }

    public static RateLimitInterceptor perClientIp(String name, Bucket bucket, RateLimiter rateLimiter,
            ObjectMapper objectMapper) {
        return new RateLimitInterceptor(name, bucket, HttpServletRequest::getRemoteAddr, rateLimiter, objectMapper);
    }

    /** Falls back to the client IP for unauthenticated requests (Spring Security normally rejects those first). */
    public static RateLimitInterceptor perUser(String name, Bucket bucket, RateLimiter rateLimiter,
            ObjectMapper objectMapper) {
        return new RateLimitInterceptor(name, bucket, request -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return auth != null && auth.getPrincipal() instanceof UserPrincipal principal
                    ? "user:" + principal.getId()
                    : request.getRemoteAddr();
        }, rateLimiter, objectMapper);
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }
        RateLimiter.Decision decision = rateLimiter.tryConsume(name + ":" + keyResolver.apply(request), bucket);
        if (decision.allowed()) {
            return true;
        }
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(decision.retryAfterSeconds()));
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(),
                ApiErrorResponse.of("Too many requests. Try again in " + decision.retryAfterSeconds() + "s.",
                        ErrorCode.RATE_LIMITED));
        return false;
    }
}
