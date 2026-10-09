"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import MemberPicker, { type PickedUser } from "@/src/features/groups/components/MemberPicker";
import { GROUP_COLORS, GROUP_EMOJIS } from "@/src/features/groups/types";
import { errorMessage } from "@/src/lib/api/client";
import { CURRENCY_CODES } from "@/src/lib/currency/currencies";
import { useCreateGroup } from "@/src/lib/data/mutations";
import { useSettings } from "@/src/lib/data/queries";
import type { GroupColor, GroupDetail } from "@/src/types/domain";

export default function CreateGroupModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (group: GroupDetail) => void;
}) {
  const [step, setStep] = useState<"info" | "members">("info");
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(GROUP_EMOJIS[0]);
  const [color, setColor] = useState<GroupColor>("indigo");
  const [currencyChoice, setCurrencyChoice] = useState<string | null>(null);
  const [selected, setSelected] = useState<PickedUser[]>([]);
  const settings = useSettings();
  const createGroup = useCreateGroup();
  // New groups default to your preferred currency.
  const baseCurrency = currencyChoice ?? settings.data?.currency ?? "USD";

  const create = () => {
    if (!name.trim()) return;
    createGroup.mutate(
      {
        name: name.trim(),
        emoji,
        color,
        baseCurrency,
        memberIds: selected.map((user) => user.id),
      },
      { onSuccess: onCreated },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">New Group</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {step === "info"
                ? "Step 1 of 2 — Group details"
                : "Step 2 of 2 — Invite members"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X size={14} />
          </button>
        </div>
        {step === "info" ? (
          <div className="px-6 py-5 flex flex-col gap-4">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Group name
              <input
                autoFocus
                value={name}
                maxLength={255}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Trip to Tokyo"
                className="mt-1.5 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm normal-case font-normal tracking-normal text-slate-900"
              />
            </label>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Icon
              </p>
              <div className="flex flex-wrap gap-2">
                {GROUP_EMOJIS.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setEmoji(item)}
                    className={`w-9 h-9 rounded-lg text-lg ${emoji === item ? "bg-indigo-100 ring-2 ring-indigo-400" : "bg-slate-100"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Color
                </p>
                <div className="flex gap-2">
                  {GROUP_COLORS.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setColor(item.id)}
                      aria-label={item.id}
                      className={`w-6 h-6 rounded-full ${item.dot} ${color === item.id ? "ring-2 ring-offset-2 ring-slate-400" : ""}`}
                    />
                  ))}
                </div>
              </div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Currency
                <select
                  value={baseCurrency}
                  onChange={(event) => setCurrencyChoice(event.target.value)}
                  className="mt-1.5 block border border-slate-200 rounded-lg px-3 py-2 text-sm normal-case font-normal tracking-normal text-slate-900"
                >
                  {[...new Set([baseCurrency, ...CURRENCY_CODES])].map((code) => (
                    <option key={code}>{code}</option>
                  ))}
                </select>
              </label>
            </div>
            <p className="-mt-2 text-[11px] text-slate-400">
              Balances and settlements in this group are kept in {baseCurrency}.
            </p>
            <button
              disabled={!name.trim()}
              onClick={() => setStep("members")}
              className="bg-indigo-600 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-lg py-2.5 text-sm font-semibold"
            >
              Next: Invite Members
            </button>
          </div>
        ) : (
          <div className="px-6 py-5 flex flex-col gap-4">
            <MemberPicker selected={selected} onChange={setSelected} />
            <p className="text-[11px] text-slate-400">
              People you add get an invitation and join once they accept.
            </p>
            {createGroup.isError && (
              <p className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-600">
                {errorMessage(createGroup.error, "Couldn't create the group")}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setStep("info")}
                className="flex-1 border border-slate-200 rounded-lg py-2.5 text-sm font-semibold"
              >
                Back
              </button>
              <button
                onClick={create}
                disabled={createGroup.isPending}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 disabled:opacity-60 text-white rounded-lg py-2.5 text-sm font-semibold"
              >
                {createGroup.isPending && <Loader2 size={14} className="animate-spin" />}
                Create Group
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
