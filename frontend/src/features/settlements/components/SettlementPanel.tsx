"use client";

import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import Avatar from "@/src/features/dashboard/components/Avatar";
import { errorMessage } from "@/src/lib/api/client";
import { usePaySettlement } from "@/src/lib/data/mutations";
import { formatMoney, formatSignedMoney } from "@/src/lib/format/money";
import type { GroupDetail } from "@/src/types/domain";

export default function SettlementPanel({
  group,
  currentUserId,
}: {
  group: GroupDetail;
  currentUserId?: string;
}) {
  const paySettlement = usePaySettlement();
  const pending = group.settlements.filter((item) => item.status === "pending");
  const paid = group.settlements.filter((item) => item.status === "paid");
  const nameOf = (user: { id: string; name: string }) =>
    user.id === currentUserId ? "You" : user.name;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Settle up</h3>
          <span className="text-[11px] text-slate-400">
            {pending.length} pending · fewest payments
          </span>
        </div>
        {paySettlement.isError && (
          <p className="mb-2 text-xs text-rose-600">{errorMessage(paySettlement.error)}</p>
        )}
        <div className="flex flex-col gap-2">
          {pending.map((item) => {
            const involved = item.fromUserId === currentUserId || item.toUserId === currentUserId;
            const paying = paySettlement.isPending && paySettlement.variables === item.id;
            return (
              <div key={item.id} className="border border-slate-200 rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar member={item.from} size={5} />
                  <span className="text-xs font-medium text-slate-700">{nameOf(item.from)}</span>
                  <ArrowRight size={12} className="text-slate-400" />
                  <Avatar member={item.to} size={5} />
                  <span className="text-xs font-medium text-slate-700">{nameOf(item.to)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900">
                    {formatMoney(item.amount, item.currency)}
                  </span>
                  {involved && (
                    <button
                      onClick={() => paySettlement.mutate(item.id)}
                      disabled={paying}
                      className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 disabled:opacity-50"
                    >
                      {paying ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={13} />
                      )}
                      Mark paid
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {pending.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">
              {group.expenses.length === 0 ? "No expenses yet." : "Everyone is settled up."}
            </p>
          )}
        </div>
        {paid.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Paid
            </p>
            {paid.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center gap-2 py-1 text-xs text-slate-500">
                <span>{nameOf(item.from)}</span>
                <ArrowRight size={10} className="text-slate-400" />
                <span className="flex-1">{nameOf(item.to)}</span>
                <span className="font-semibold">{formatMoney(item.amount, item.currency)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Balances</h3>
        <div className="flex flex-col gap-2">
          {group.members.map((member) => (
            <div key={member.id} className="flex items-center gap-2">
              <Avatar member={member} size={6} />
              <span className="flex-1 text-xs text-slate-700 truncate">
                {nameOf(member)}
                {member.role === "owner" && (
                  <span className="ml-1.5 text-[10px] text-slate-400">owner</span>
                )}
              </span>
              <span
                className={`text-xs font-bold ${member.balance > 0 ? "text-emerald-600" : member.balance < 0 ? "text-rose-500" : "text-slate-400"}`}
              >
                {formatSignedMoney(member.balance, group.baseCurrency)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
