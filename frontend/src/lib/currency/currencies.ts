/**
 * Currencies offered in pickers. The backend accepts any ISO 4217 code that the
 * exchange-rate provider (ECB reference rates) supports; these are the common ones.
 */
export const CURRENCY_CODES = [
  "USD",
  "EUR",
  "GBP",
  "INR",
  "IDR",
  "SGD",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
] as const;
