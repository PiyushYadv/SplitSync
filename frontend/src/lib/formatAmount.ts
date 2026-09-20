export function formatAmount(
  usdAmount: number,
  meta: {
    symbol: string;
    rate: number;
  },
) {
  const converted = usdAmount * meta.rate;

  if (meta.symbol === "Rp") {
    return `Rp ${Math.round(converted).toLocaleString("id-ID")}`;
  }

  return `${meta.symbol}${converted.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
