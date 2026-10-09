package com.splitsync.ratelimit;

import java.util.List;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Component;

import com.splitsync.config.AppProperties.Bucket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Redis token bucket. The refill-and-take runs as one Lua script, so it is atomic across app instances, and
 * it uses Redis' clock so instances with skewed clocks agree.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimiter {

    public record Decision(boolean allowed, long retryAfterSeconds) {
    }

    @SuppressWarnings("rawtypes")
    private static final RedisScript<List> TOKEN_BUCKET = RedisScript.of("""
            local capacity = tonumber(ARGV[1])
            local refill_per_ms = tonumber(ARGV[2])
            local time = redis.call('TIME')
            local now = tonumber(time[1]) * 1000 + math.floor(tonumber(time[2]) / 1000)

            local state = redis.call('HMGET', KEYS[1], 'tokens', 'ts')
            local tokens = tonumber(state[1]) or capacity
            local ts = tonumber(state[2]) or now
            tokens = math.min(capacity, tokens + (now - ts) * refill_per_ms)

            local allowed = 0
            local retry_ms = 0
            if tokens >= 1 then
              tokens = tokens - 1
              allowed = 1
            else
              retry_ms = math.ceil((1 - tokens) / refill_per_ms)
            end

            redis.call('HSET', KEYS[1], 'tokens', tostring(tokens), 'ts', now)
            redis.call('PEXPIRE', KEYS[1], math.ceil(capacity / refill_per_ms))
            return {allowed, retry_ms}
            """, List.class);

    private final StringRedisTemplate redis;

    public Decision tryConsume(String key, Bucket bucket) {
        double refillPerMs = bucket.refillPerMinute() / 60_000.0;
        try {
            List<?> result = redis.execute(TOKEN_BUCKET, List.of("ratelimit:" + key),
                    String.valueOf(bucket.capacity()), String.valueOf(refillPerMs));
            boolean allowed = ((Number) result.get(0)).longValue() == 1;
            long retryAfterSeconds = (long) Math.ceil(((Number) result.get(1)).longValue() / 1000.0);
            return new Decision(allowed, Math.max(retryAfterSeconds, allowed ? 0 : 1));
        } catch (RuntimeException ex) {
            // Fail open: a Redis outage shouldn't lock everyone out of logging in.
            log.warn("Rate limiter unavailable, allowing request for {}", key, ex);
            return new Decision(true, 0);
        }
    }
}
