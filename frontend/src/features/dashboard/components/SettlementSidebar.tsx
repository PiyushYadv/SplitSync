"use client";

import { ArrowRight, Check, Loader2, Zap } from "lucide-react";
import Avatar from "@/src/features/dashboard/components/Avatar";
import { errorMessage } from "@/src/lib/api/client";
import { usePaySettlement } from "@/src/lib/data/mutations";
import { formatMoney, formatSignedMoney } from "@/src/lib/format/money";
import type { GroupSummary, Settlement } from "@/src/types/domain";

/** Your pending settlements across groups, plus your balance in each group. */
export default function SettlementSidebar({
  settlements,
  groups,
  currentUserId,
}: {
  settlements: Settlement[];
  groups: GroupSummary[];
  currentUserId?: string;
}) {
  const paySettlement = usePaySettlement();
  const groupMap = new Map(groups.map((group) => [group.id, group]));
  const nameOf = (user: { id: string; name: string }) =>
    user.id === currentUserId ? "You" : user.name;
  const groupsWithBalance = groups.filter((group) => group.balance !== 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Settle Up</h3>
          <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold ring-1 ring-emerald-200">
            Optimized
          </span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-md mb-3">
          <div className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center shrink-0">
            <Zap size={13} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900">
              {settlements.length} payment{settlements.length === 1 ? "" : "s"} involve you
            </p>
            <p className="text-[11px] text-slate-400">Fewest payments to clear every debt</p>
          </div>
        </div>
        {paySettlement.isError && (
          <p className="mb-2 text-xs text-rose-600">{errorMessage(paySettlement.error)}</p>
        )}

        <div className="flex flex-col gap-2">
          {settlements.map((s) => {
            const paying = paySettlement.isPending && paySettlement.variables === s.id;
            const group = groupMap.get(s.groupId);
            return (
              <div key={s.id} className="border border-slate-200 rounded-md p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar member={s.from} size={6} />
                  <span className="text-xs font-medium text-slate-700">{nameOf(s.from)}</span>
                  <ArrowRight size={12} className="text-slate-400 mx-0.5" />
                  <span className="text-xs font-medium text-slate-700">{nameOf(s.to)}</span>
                  <Avatar member={s.to} size={6} />
                </div>
                {group && (
                  <p className="text-[11px] text-slate-400 mb-2">
                    {group.emoji} {group.name}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900">
                    {formatMoney(s.amount, s.currency)}
                  </span>
                  <button
                    onClick={() => paySettlement.mutate(s.id)}
                    disabled={paying}
                    className="flex items-center gap-1 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white px-2.5 py-1 rounded transition-colors"
                  >
                    {paying ? (
                      <Loader2 size={10} className="animate-spin" />
                    ) : (
                      <Check size={10} strokeWidth={3} />
                    )}
                    {s.fromUserId === currentUserId ? "I paid" : "Mark received"}
                  </button>
                </div>
              </div>
            );
          })}
          {settlements.length === 0 && (
            <div className="text-center py-4">
              <Check size={20} className="text-emerald-500 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-700">All square!</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Your Balance by Group</h3>
        <div className="flex flex-col gap-2">
          {groupsWithBalance.map((group) => (
            <div
              key={group.id}
              className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0"
            >
              <span className="text-xs text-slate-600 truncate">
                {group.emoji} {group.name}
              </span>
              <span
                className={`text-xs font-bold ${group.balance > 0 ? "text-emerald-600" : "text-rose-500"}`}
              >
                {formatSignedMoney(group.balance, group.baseCurrency)}
              </span>
            </div>
          ))}
          {groupsWithBalance.length === 0 && (
            <p className="text-xs text-slate-400">You&apos;re settled up in every group.</p>
          )}
        </div>
      </div>
    </div>
  );
}
