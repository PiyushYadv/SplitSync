import {
  BarChart3,
  Camera,
  Globe,
  Shield,
  TrendingDown,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: Camera,
    color: "indigo",
    title: "AI Receipt Scanning",
    desc: "Point your camera at any receipt. Our OCR engine extracts line items, tax, and total automatically — even crumpled paper.",
  },
  {
    icon: Globe,
    color: "blue",
    title: "Multi-Currency Support",
    desc: "Live exchange rates updated every 15 minutes. Spend in INR, split in USD, settle in EUR — we handle all conversions.",
  },
  {
    icon: TrendingDown,
    color: "emerald",
    title: "Debt Optimization",
    desc: "Our minimum-flow algorithm collapses any number of mutual debts into the fewest possible transfers. 12 IOUs become 4 payments.",
  },
  {
    icon: Zap,
    color: "amber",
    title: "Settlement Tracking",
    desc: "Track who owes whom and mark transfers as settled once payments are completed. No more double-checking.",
  },
  {
    icon: BarChart3,
    color: "purple",
    title: "Spend Analytics",
    desc: "Category breakdowns, per-person summaries, and monthly trend charts so you always know where the money went.",
  },
  {
    icon: Shield,
    color: "rose",
    title: "Secure by Design",
    desc: "Authentication, protected API routes, and secure handling of user and group expense data.",
  },
];

const fColors: Record<string, { bg: string; icon: string; ring: string }> = {
  indigo: {
    bg: "bg-indigo-50",
    icon: "text-indigo-600",
    ring: "ring-indigo-200",
  },
  blue: { bg: "bg-blue-50", icon: "text-blue-600", ring: "ring-blue-200" },
  emerald: {
    bg: "bg-emerald-50",
    icon: "text-emerald-600",
    ring: "ring-emerald-200",
  },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", ring: "ring-amber-200" },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    ring: "ring-purple-200",
  },
  rose: { bg: "bg-rose-50", icon: "text-rose-600", ring: "ring-rose-200" },
};

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-4">
            Everything a group needs.
            <br />
            Nothing it doesn&apos;t.
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            SplitSync handles the full lifecycle — from the first receipt to the
            final transfer.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, color, title, desc }) => {
            const c = fColors[color];
            return (
              <div
                key={title}
                className="p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white transition-all"
              >
                <div
                  className={`w-10 h-10 ${c.bg} ring-1 ${c.ring} rounded-xl flex items-center justify-center mb-4`}
                >
                  <Icon size={18} className={c.icon} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
