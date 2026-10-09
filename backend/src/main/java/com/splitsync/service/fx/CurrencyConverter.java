package com.splitsync.service.fx;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;

import com.splitsync.util.Money;

import lombok.RequiredArgsConstructor;

/** Converts ledger amounts for reporting. Lives outside ExchangeRateService so its calls go through the cache proxy. */
@Component
@RequiredArgsConstructor
public class CurrencyConverter {

    private final ExchangeRateService exchangeRateService;

    public BigDecimal convert(BigDecimal amount, String from, String to) {
        if (from.equals(to) || amount.signum() == 0) {
            return Money.of(amount);
        }
        return Money.of(amount.multiply(exchangeRateService.getRate(from, to)));
    }
}
