import { getCurrencyMeta } from "./currencies";

export function formatAmount(amount: number, currency = "USD") {
  const meta = getCurrencyMeta(currency);
  return meta.symbol === "Rp"
    ? `Rp ${Math.round(amount * meta.rate).toLocaleString("id-ID")}`
    : `${meta.symbol}${(amount * meta.rate).toFixed(2)}`;
}
