package com.splitsync.repository.projection;

import java.math.BigDecimal;

public interface CurrencyAmount {

    String getCurrency();

    BigDecimal getAmount();
}
