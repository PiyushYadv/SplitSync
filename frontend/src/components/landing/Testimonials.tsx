import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "We used SplitSync for a 3-week Japan trip with 7 people. Zero arguments about money. First time in the history of our friend group.",
    name: "Priya M.",
    role: "Travel blogger",
    color: "#10b981",
    initials: "PM",
  },
  {
    quote:
      "The OCR scan is absurdly good. I photographed a crumpled Thai receipt and it got every line item right. Saved us a 20-minute argument.",
    name: "Tom H.",
    role: "Software engineer",
    color: "#6366f1",
    initials: "TH",
  },
  {
    quote:
      "Switched our whole apartment house. We used to have a shared spreadsheet that nobody updated. SplitSync replaced it in one afternoon.",
    name: "Sofia K.",
    role: "Product designer",
    color: "#ec4899",
    initials: "SK",
  },
  {
    quote:
      "The debt optimization alone is worth it. Our ski trip had 8 people and we settled in 4 Venmo payments. It felt like magic.",
    name: "James L.",
    role: "Startup founder",
    color: "#f59e0b",
    initials: "JL",
  },
  {
    quote:
      "I manage expenses for a corporate offsite every quarter. SplitSync's export and audit log make reimbursements completely painless.",
    name: "Rachel T.",
    role: "Operations lead",
    color: "#3b82f6",
    initials: "RT",
  },
  {
    quote:
      "Multi-currency support is flawless. We split costs across USD, EUR, and Baht without a single conversion headache.",
    name: "Carlos V.",
    role: "Digital nomad",
    color: "#f43f5e",
    initials: "CV",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">
            Testimonials
          </p>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Loved by groups worldwide
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ quote, name, role, color, initials }) => (
            <div
              key={name}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className="text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                &quot;{quote}&quot;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: color }}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{name}</p>
                  <p className="text-xs text-slate-400">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
