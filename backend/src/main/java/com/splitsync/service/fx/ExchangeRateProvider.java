package com.splitsync.service.fx;

import java.math.BigDecimal;

public interface ExchangeRateProvider {

    /** Units of {@code to} per one unit of {@code from}. Both codes are upper-case ISO 4217. */
    BigDecimal fetchRate(String from, String to);
}
