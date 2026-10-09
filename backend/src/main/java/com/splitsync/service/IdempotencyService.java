package com.splitsync.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
import java.util.UUID;
import java.util.function.Function;
import java.util.function.Supplier;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.splitsync.exception.ApiException;
import com.splitsync.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

/**
 * Idempotency-Key support backed by Redis SETNX. The first request claims the key and runs; retries with the
 * same key get the originally created resource back instead of creating a duplicate. Reusing a key with a
 * different payload is rejected. Keys are scoped per user and per operation and expire after 24 hours.
 */
@Service
@RequiredArgsConstructor
public class IdempotencyService {

    static final Duration TTL = Duration.ofHours(24);
    private static final String IN_PROGRESS = "IN_PROGRESS";
    private static final int MAX_KEY_LENGTH = 255;

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;

    /**
     * @param action    performs the operation (its own transaction must have committed when it returns)
     * @param idOf      extracts the created resource id from the action's result
     * @param loader    rebuilds the response for a replayed request from the stored resource id
     */
    public <T> T execute(String idempotencyKey, UUID userId, String scope, Object request,
            Supplier<T> action, Function<T, UUID> idOf, Function<UUID, T> loader) {
        if (idempotencyKey == null) {
            return action.get();
        }
        if (idempotencyKey.isBlank() || idempotencyKey.length() > MAX_KEY_LENGTH) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.MALFORMED_REQUEST,
                    "Idempotency-Key must be 1-" + MAX_KEY_LENGTH + " characters");
        }

        String redisKey = "idempotency:" + scope + ":" + userId + ":" + idempotencyKey;
        String fingerprint = fingerprint(request);

        Boolean claimed = redis.opsForValue().setIfAbsent(redisKey, fingerprint + "|" + IN_PROGRESS, TTL);
        if (Boolean.TRUE.equals(claimed)) {
            T result;
            try {
                result = action.get();
            } catch (RuntimeException ex) {
                // The operation failed and rolled back, so the client may retry with the same key.
                redis.delete(redisKey);
                throw ex;
            }
            redis.opsForValue().set(redisKey, fingerprint + "|" + idOf.apply(result), TTL);
            return result;
        }

        String stored = redis.opsForValue().get(redisKey);
        if (stored == null) {
            // Expired or released between our SETNX and GET; try to claim it again.
            return execute(idempotencyKey, userId, scope, request, action, idOf, loader);
        }
        String[] parts = stored.split("\\|", 2);
        if (!parts[0].equals(fingerprint)) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, ErrorCode.IDEMPOTENCY_KEY_REUSED,
                    "This Idempotency-Key was already used for a different request");
        }
        if (IN_PROGRESS.equals(parts[1])) {
            throw new ApiException(HttpStatus.CONFLICT, ErrorCode.REQUEST_IN_PROGRESS,
                    "A request with this Idempotency-Key is still being processed");
        }
        return loader.apply(UUID.fromString(parts[1]));
    }

    private String fingerprint(Object request) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(
                    objectMapper.writeValueAsString(request).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (JsonProcessingException | NoSuchAlgorithmException ex) {
            throw new IllegalStateException("Could not fingerprint request", ex);
        }
    }
}
