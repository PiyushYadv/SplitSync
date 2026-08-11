// import {
//   ArrowRight,
//   Check,
//   CheckCircle2,
//   TrendingDown,
//   Zap,
// } from "lucide-react";

// export default function HighlightSettlement() {
//   return (
//     <section className="py-24 bg-white">
//       <div className="max-w-7xl mx-auto px-6">
//         <div className="grid md:grid-cols-2 gap-16 items-center">
//           <div className="relative order-2 md:order-1">
//             <div className="absolute -inset-8 bg-emerald-500/5 rounded-3xl" />
//             <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl p-6">
//               <div className="flex items-center justify-between mb-5">
//                 <div>
//                   <h4 className="text-sm font-bold text-slate-900">
//                     Settlement Plan
//                   </h4>
//                   <p className="text-xs text-slate-400 mt-0.5">
//                     Trip to Bali · 5 members
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
//                   <Zap size={12} className="text-emerald-600" />
//                   <span className="text-xs font-semibold text-emerald-700">
//                     Optimized
//                   </span>
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-3 mb-5">
//                 <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
//                   <p className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider mb-2">
//                     Without SplitSync
//                   </p>
//                   <p className="text-2xl font-extrabold text-rose-600 mb-0.5">
//                     12
//                   </p>
//                   <p className="text-xs text-rose-400">transfers needed</p>
//                 </div>
//                 <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
//                   <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">
//                     With SplitSync
//                   </p>
//                   <p className="text-2xl font-extrabold text-emerald-600 mb-0.5">
//                     4
//                   </p>
//                   <p className="text-xs text-emerald-500">transfers needed</p>
//                 </div>
//               </div>
//               {[
//                 {
//                   from: "You",
//                   fromC: "#f43f5e",
//                   to: "Alice Chen",
//                   toC: "#10b981",
//                   amt: "$45.00",
//                   done: false,
//                 },
//                 {
//                   from: "Charlie Roy",
//                   fromC: "#f59e0b",
//                   to: "Bob Tanaka",
//                   toC: "#6366f1",
//                   amt: "$20.50",
//                   done: false,
//                 },
//                 {
//                   from: "Diana Lim",
//                   fromC: "#ec4899",
//                   to: "Alice Chen",
//                   toC: "#10b981",
//                   amt: "$18.00",
//                   done: true,
//                 },
//                 {
//                   from: "Bob Tanaka",
//                   fromC: "#6366f1",
//                   to: "Charlie Roy",
//                   toC: "#f59e0b",
//                   amt: "$12.00",
//                   done: true,
//                 },
//               ].map((s) => (
//                 <div
//                   key={s.from}
//                   className={`flex items-center gap-3 p-3 rounded-xl border mb-2 ${s.done ? "border-slate-100 opacity-50" : "border-slate-200"}`}
//                 >
//                   <div
//                     className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
//                     style={{ backgroundColor: s.fromC }}
//                   >
//                     {s.from[0]}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-1.5 text-xs">
//                       <span className="font-semibold text-slate-800 truncate">
//                         {s.from}
//                       </span>
//                       <ArrowRight
//                         size={11}
//                         className="text-slate-400 shrink-0"
//                       />
//                       <span className="font-semibold text-slate-800 truncate">
//                         {s.to}
//                       </span>
//                     </div>
//                   </div>
//                   <div
//                     className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
//                     style={{ backgroundColor: s.toC }}
//                   >
//                     {s.to[0]}
//                   </div>
//                   <span className="text-sm font-bold text-slate-900 w-14 text-right">
//                     {s.amt}
//                   </span>
//                   {s.done ? (
//                     <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
//                       <Check
//                         size={11}
//                         className="text-emerald-600"
//                         strokeWidth={2.5}
//                       />
//                     </div>
//                   ) : (
//                     <div className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-1 rounded shrink-0">
//                       Pay
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="order-1 md:order-2">
//             <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 mb-6">
//               <TrendingDown size={12} className="text-emerald-500" />
//               <span className="text-xs font-semibold text-emerald-600">
//                 Debt Optimization
//               </span>
//             </div>
//             <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-5">
//               12 IOUs become
//               <br />4 clean payments.
//             </h2>
//             <p className="text-slate-500 leading-relaxed mb-8">
//               Our minimum-flow algorithm models all debts as a directed graph
//               and finds the mathematically minimal set of transfers.
//             </p>
//             <ul className="flex flex-col gap-3 mb-8">
//               {[
//                 "Works for groups of any size",
//                 "Integrates with Venmo, PayPal, bank transfer",
//                 "Real-time notifications when someone pays",
//                 "Full audit trail of every settlement",
//               ].map((f) => (
//                 <li
//                   key={f}
//                   className="flex items-start gap-2.5 text-sm text-slate-600"
//                 >
//                   <CheckCircle2
//                     size={16}
//                     className="text-emerald-500 shrink-0 mt-0.5"
//                   />
//                   {f}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

import {
  ArrowRight,
  Check,
  CheckCircle2,
  TrendingDown,
  Zap,
} from "lucide-react";

export default function HighlightSettlement() {
  const settlements = [
    {
      from: "You",
      fromC: "#f43f5e",
      to: "Alice Chen",
      toC: "#10b981",
      amount: "$45.00",
      done: false,
    },
    {
      from: "Charlie Roy",
      fromC: "#f59e0b",
      to: "Bob Tanaka",
      toC: "#6366f1",
      amount: "$20.50",
      done: false,
    },
    {
      from: "Diana Lim",
      fromC: "#ec4899",
      to: "Alice Chen",
      toC: "#10b981",
      amount: "$18.00",
      done: true,
    },
    {
      from: "Bob Tanaka",
      fromC: "#6366f1",
      to: "Charlie Roy",
      toC: "#f59e0b",
      amount: "$12.00",
      done: true,
    },
  ];

  return (
    <section className="py-24 bg-white" id="settlement">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Settlement preview */}
          <div className="relative order-2 md:order-1">
            <div className="absolute -inset-8 bg-emerald-500/5 rounded-3xl" />

            <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Settlement Plan
                  </h4>

                  <p className="text-xs text-slate-400 mt-0.5">
                    Trip to Bali · 5 members
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                  <Zap size={12} className="text-emerald-600" />

                  <span className="text-xs font-semibold text-emerald-700">
                    Optimized
                  </span>
                </div>
              </div>

              {/* Before / after comparison */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider mb-2">
                    Before optimization
                  </p>

                  <p className="text-2xl font-extrabold text-rose-600 mb-0.5">
                    12
                  </p>

                  <p className="text-xs text-rose-400">payments</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                    After optimization
                  </p>

                  <p className="text-2xl font-extrabold text-emerald-600 mb-0.5">
                    4
                  </p>

                  <p className="text-xs text-emerald-500">payments</p>
                </div>
              </div>

              {/* Settlement list */}
              <div>
                {settlements.map((settlement) => (
                  <div
                    key={`${settlement.from}-${settlement.to}`}
                    className={`flex items-center gap-3 p-3 rounded-xl border mb-2 ${
                      settlement.done
                        ? "border-slate-100 opacity-50"
                        : "border-slate-200"
                    }`}
                  >
                    {/* Sender */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: settlement.fromC }}
                    >
                      {settlement.from[0]}
                    </div>

                    {/* Transfer */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-semibold text-slate-800 truncate">
                          {settlement.from}
                        </span>

                        <ArrowRight
                          size={11}
                          className="text-slate-400 shrink-0"
                        />

                        <span className="font-semibold text-slate-800 truncate">
                          {settlement.to}
                        </span>
                      </div>
                    </div>

                    {/* Recipient */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: settlement.toC }}
                    >
                      {settlement.to[0]}
                    </div>

                    {/* Amount */}
                    <span className="text-sm font-bold text-slate-900 w-14 text-right">
                      {settlement.amount}
                    </span>

                    {/* Status */}
                    {settlement.done ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Check
                          size={11}
                          className="text-emerald-600"
                          strokeWidth={2.5}
                        />
                      </div>
                    ) : (
                      <div className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-1 rounded shrink-0">
                        Mark paid
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 md:order-2">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 mb-6">
              <TrendingDown size={12} className="text-emerald-500" />

              <span className="text-xs font-semibold text-emerald-600">
                Debt Optimization
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-5">
              12 IOUs become
              <br />4 clean payments.
            </h2>

            <p className="text-slate-500 leading-relaxed mb-8">
              Our settlement algorithm models group debts and consolidates them
              into fewer payments, making it easier to settle shared expenses
              without unnecessary transfers.
            </p>

            <ul className="flex flex-col gap-3 mb-8">
              {[
                "Optimizes settlements across multi-person groups",
                "Reduces unnecessary payment transfers",
                "Tracks outstanding and completed payments",
                "Maintains a history of settlement transactions",
              ].map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-sm text-slate-600"
                >
                  <CheckCircle2
                    size={16}
                    className="text-emerald-500 shrink-0 mt-0.5"
                  />

                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
