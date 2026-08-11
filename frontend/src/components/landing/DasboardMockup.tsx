import {
  ArrowRight,
  BarChart3,
  Bell,
  Clock,
  LayoutDashboard,
  Plus,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

export default function DashboardMockup() {
  const rows = [
    {
      emoji: "🏠",
      title: "Villa at Seminyak",
      cat: "Accommodation",
      payer: "Alice",
      color: "#6366f1",
      amt: "$480.00",
      badge: "Equal",
      bc: "bg-emerald-50 text-emerald-700",
    },
    {
      emoji: "🍽️",
      title: "Sunset dinner",
      cat: "Food & Drink",
      payer: "Bob",
      color: "#6366f1",
      amt: "$88.50",
      badge: "Exact",
      bc: "bg-indigo-50 text-indigo-700",
    },
    {
      emoji: "🛵",
      title: "Scooter rental",
      cat: "Transport",
      payer: "You",
      color: "#f43f5e",
      amt: "$165.00",
      badge: "Equal",
      bc: "bg-emerald-50 text-emerald-700",
    },
    {
      emoji: "💆",
      title: "Spa session",
      cat: "Wellness",
      payer: "Charlie",
      color: "#f59e0b",
      amt: "$230.00",
      badge: "Percent",
      bc: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <div className="flex bg-slate-50" style={{ height: 480 }}>
      <div className="w-44 bg-white border-r border-slate-200 flex flex-col shrink-0 p-3">
        <div className="flex items-center gap-2 mb-5 px-1 pt-1">
          <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
            <RefreshCw size={10} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-slate-900 text-xs">SplitSync</span>
          {/* <span className="ml-auto text-[9px] font-bold bg-indigo-50 text-indigo-600 px-1 py-0.5 rounded">
            Pro
          </span> */}
        </div>
        {[
          { icon: LayoutDashboard, label: "Dashboard", active: true },
          { icon: BarChart3, label: "Analytics", active: false },
          { icon: Users, label: "Groups", active: false },
        ].map(({ icon: Icon, label, active }) => (
          <div
            key={label}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-[11px] font-medium mb-0.5 ${active ? "bg-indigo-50 text-indigo-700" : "text-slate-500"}`}
          >
            <Icon size={12} />
            {label}
          </div>
        ))}
        <div className="mt-3">
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
            My Groups
          </p>
          {[
            { label: "Trip to Bali", color: "bg-emerald-400", active: true },
            { label: "Apartment Bills", color: "bg-indigo-400", active: false },
            { label: "Ski Trip", color: "bg-amber-400", active: false },
          ].map(({ label, color, active }) => (
            <div
              key={label}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-[11px] mb-0.5 ${active ? "bg-slate-100 text-slate-800 font-medium" : "text-slate-500"}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${color} shrink-0`} />
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="h-10 bg-white border-b border-slate-200 flex items-center gap-3 px-4 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-100 rounded px-2.5 py-1 flex-1 max-w-48">
            <Search size={10} className="text-slate-400" />
            <span className="text-[10px] text-slate-400">Search… ⌘K</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="text-[10px] text-slate-500 border border-slate-200 rounded px-2 py-0.5">
              USD ▾
            </div>
            <div className="relative w-6 h-6 rounded flex items-center justify-center bg-slate-100">
              <Bell size={11} className="text-slate-500" />
              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
            </div>
            <div className="flex items-center gap-1 bg-indigo-600 text-white text-[10px] font-semibold px-2 py-1 rounded">
              <Plus size={9} strokeWidth={2.5} /> New Expense
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-3 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2.5">
            {[
              {
                label: "Total Spend",
                val: "$3,420.00",
                sub: "Trip to Bali",
                icon: Wallet,
                c: "text-slate-700",
                bg: "bg-slate-100",
              },
              {
                label: "Your Balance",
                val: "+$125.00",
                sub: "You are owed",
                icon: TrendingUp,
                c: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                label: "Pending",
                val: "2 settlements",
                sub: "$65.50 left",
                icon: Clock,
                c: "text-amber-600",
                bg: "bg-amber-50",
              },
            ].map(({ label, val, sub, icon: Icon, c, bg }) => (
              <div
                key={label}
                className="bg-white border border-slate-200 rounded-lg p-3"
              >
                <div
                  className={`w-6 h-6 ${bg} rounded flex items-center justify-center mb-2`}
                >
                  <Icon size={11} className={c} />
                </div>
                <p className={`text-sm font-bold ${c} leading-tight`}>{val}</p>
                <p className="text-[10px] font-semibold text-slate-600 mt-0.5">
                  {label}
                </p>
                <p className="text-[9px] text-slate-400">{sub}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2.5 flex-1 min-h-0">
            <div className="flex-1 bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
                <span className="text-[11px] font-semibold text-slate-700">
                  Transactions
                </span>
                <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                  8 items
                </span>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Title", "Paid by", "Split", "Amount"].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-1.5 text-[9px] font-semibold text-slate-400 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((e, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{e.emoji}</span>
                          <div>
                            <p className="text-[10px] font-medium text-slate-800 leading-tight truncate max-w-28">
                              {e.title}
                            </p>
                            <p className="text-[9px] text-slate-400">{e.cat}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                            style={{ backgroundColor: e.color }}
                          >
                            {e.payer[0]}
                          </div>
                          <span className="text-[10px] text-slate-600">
                            {e.payer}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${e.bc}`}
                        >
                          {e.badge}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[11px] font-bold text-slate-900">
                        {e.amt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="w-40 shrink-0">
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-slate-700">
                    Debt Matrix
                  </span>
                  <span className="text-[8px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full">
                    Optimized
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 rounded p-1.5 mb-2">
                  <Zap size={9} className="text-indigo-500" />
                  <span className="text-[9px] text-slate-600 font-medium">
                    12 → 4 transfers
                  </span>
                </div>
                {[
                  { from: "You", to: "Alice", amt: "$45" },
                  { from: "Charlie", to: "Bob", amt: "$20" },
                ].map((s) => (
                  <div
                    key={s.from}
                    className="border border-slate-200 rounded p-2 mb-1.5"
                  >
                    <div className="flex items-center gap-1 text-[9px] text-slate-600 mb-1.5">
                      <span className="font-medium">{s.from}</span>
                      <ArrowRight size={8} className="text-slate-400" />
                      <span className="font-medium">{s.to}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-900">
                        {s.amt}
                      </span>
                      <div className="bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                        Settle
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
