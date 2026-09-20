type CurrencyBadgeProps = {
  currency: string;
};

const styles: Record<string, string> = {
  USD: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  IDR: "bg-amber-50 text-amber-700 ring-amber-200",
  EUR: "bg-blue-50 text-blue-700 ring-blue-200",
  SGD: "bg-purple-50 text-purple-700 ring-purple-200",
};

export default function CurrencyBadge({ currency }: CurrencyBadgeProps) {
  return (
    <span
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ring-1 ${styles[currency] ?? "bg-slate-100 text-slate-600 ring-slate-200"}`}
    >
      {currency}
    </span>
  );
}
