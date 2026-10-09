package com.splitsync.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/** Runs {@code @Async} work (outgoing email) on Spring Boot's auto-configured task executor. */
@Configuration
@EnableAsync
public class AsyncConfig {
}
