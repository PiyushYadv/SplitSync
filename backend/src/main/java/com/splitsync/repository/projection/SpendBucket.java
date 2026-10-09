package com.splitsync.repository.projection;

import java.math.BigDecimal;

/** Spend for one (base currency, UTC month "yyyy-MM", category) bucket. */
public interface SpendBucket {

    String getCurrency();

    String getMonth();

    String getCategory();

    BigDecimal getAmount();
}
