package com.splitsync.config;

import java.util.Arrays;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.ConverterFactory;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.splitsync.ratelimit.RateLimitInterceptor;
import com.splitsync.ratelimit.RateLimiter;

import lombok.RequiredArgsConstructor;

import com.splitsync.entity.enums.DbEnum;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final AppProperties appProperties;
    private final RateLimiter rateLimiter;
    private final ObjectMapper objectMapper;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        AppProperties.RateLimit limits = appProperties.rateLimit();
        if (!limits.enabled()) {
            return;
        }
        // Paths are relative to the /api context path. Only login/signup POSTs reach these handlers.
        registry.addInterceptor(RateLimitInterceptor.perClientIp("login", limits.login(), rateLimiter, objectMapper))
                .addPathPatterns("/auth/login");
        registry.addInterceptor(RateLimitInterceptor.perClientIp("signup", limits.signup(), rateLimiter, objectMapper))
                .addPathPatterns("/auth/signup");
        registry.addInterceptor(RateLimitInterceptor.perUser("user-search", limits.userSearch(), rateLimiter, objectMapper))
                .addPathPatterns("/users/search");
    }

    /** Lets query params like {@code ?status=pending} bind to enums by their lowercase API value. */
    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverterFactory(new DbEnumConverterFactory());
    }

    @SuppressWarnings({ "rawtypes", "unchecked" })
    private static final class DbEnumConverterFactory implements ConverterFactory<String, Enum> {
        @Override
        public <T extends Enum> org.springframework.core.convert.converter.Converter<String, T> getConverter(
                Class<T> targetType) {
            if (!DbEnum.class.isAssignableFrom(targetType)) {
                return source -> (T) Enum.valueOf(targetType, source.trim());
            }
            return source -> Arrays.stream(targetType.getEnumConstants())
                    .filter(e -> ((DbEnum) e).dbValue().equalsIgnoreCase(source.trim()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Unknown value " + source));
        }
    }
}
