export type CurrencyCode = "USD" | "EUR" | "IDR" | "SGD";

export const CURRENCIES: Record<
  CurrencyCode,
  { symbol: string; rate: number }
> = {
  USD: { symbol: "$", rate: 1 },
  EUR: { symbol: "€", rate: 0.93 },
  IDR: { symbol: "Rp", rate: 15800 },
  SGD: { symbol: "S$", rate: 1.35 },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

export function getCurrencyMeta(currency: string) {
  return CURRENCIES[currency as CurrencyCode] ?? CURRENCIES.USD;
}
