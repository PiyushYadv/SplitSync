package com.splitsync.service.fx;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExchangeRateService {

    public static final String CACHE_NAME = "exchangeRates";
    /** Matches expenses.exchange_rate NUMERIC(19, 6). */
    public static final int RATE_SCALE = 6;

    private final ExchangeRateProvider provider;

    /** Cached in Redis for app.fx.cache-ttl-hours. Callers should skip this when the currencies match. */
    @Cacheable(value = CACHE_NAME, key = "#from + '_' + #to")
    public BigDecimal getRate(String from, String to) {
        return provider.fetchRate(from, to).setScale(RATE_SCALE, RoundingMode.HALF_EVEN);
    }
}
