/**
 * Client-side checks that mirror the server's, so most mistakes are caught before
 * submitting. Amounts are compared in integer cents to avoid floating-point error;
 * the server still recomputes and validates every split.
 */

const DECIMAL = /^\d+(\.\d{1,2})?$/;

/** "12.5" → 1250; null if not a non-negative number with at most two decimals. */
export function toHundredths(value: string): number | null {
  const trimmed = value.trim();
  if (!DECIMAL.test(trimmed)) return null;
  const [whole, fraction = ""] = trimmed.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export function fromHundredths(value: number) {
  return (value / 100).toFixed(2);
}

/** Equal shares in cents, leftover cents to the first participants (as the server does). */
export function equalShares(totalCents: number, count: number) {
  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count;
  return Array.from({ length: count }, (_, index) =>
    index < remainder ? base + 1 : base,
  );
}
