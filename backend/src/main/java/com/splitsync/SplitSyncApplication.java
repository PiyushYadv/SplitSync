package com.splitsync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisIndexedHttpSession;

@SpringBootApplication
@EnableCaching
@EnableRedisIndexedHttpSession(maxInactiveIntervalInSeconds = 60 * 60 * 24 * 7) // 7 days
public class SplitSyncApplication {

    public static void main(String[] args) {
        SpringApplication.run(SplitSyncApplication.class, args);
    }
}
