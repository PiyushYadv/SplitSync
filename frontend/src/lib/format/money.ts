const formatters = new Map<string, (amount: number) => string>();

function formatterFor(currency: string) {
  let format = formatters.get(currency);
  if (!format) {
    try {
      const intl = new Intl.NumberFormat("en-US", { style: "currency", currency });
      format = (amount) => intl.format(amount);
    } catch {
      // Not a code Intl knows: "1,234.50 XYZ".
      const plain = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      format = (amount) => `${plain.format(amount)} ${currency}`;
    }
    formatters.set(currency, format);
  }
  return format;
}

/** Formats an amount in its own currency, e.g. 1234.5 USD → "$1,234.50". */
export function formatMoney(amount: number, currency: string) {
  return formatterFor(currency)(amount);
}

/** Balance with an explicit sign: "+$12.00", "−$5.50", "$0.00". */
export function formatSignedMoney(amount: number, currency: string) {
  if (amount === 0) return formatMoney(0, currency);
  return `${amount > 0 ? "+" : "−"}${formatMoney(Math.abs(amount), currency)}`;
}
