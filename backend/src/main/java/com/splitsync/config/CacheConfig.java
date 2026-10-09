package com.splitsync.config;

import java.time.Duration;

import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;

import com.splitsync.service.fx.ExchangeRateService;

@Configuration
public class CacheConfig {

    @Bean
    public RedisCacheManagerBuilderCustomizer exchangeRateCacheCustomizer(AppProperties appProperties) {
        return builder -> builder.withCacheConfiguration(ExchangeRateService.CACHE_NAME,
                RedisCacheConfiguration.defaultCacheConfig()
                        .entryTtl(Duration.ofHours(appProperties.fx().cacheTtlHours()))
                        .disableCachingNullValues());
    }
}
