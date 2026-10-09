"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import Avatar from "@/src/features/dashboard/components/Avatar";
import { EXPENSE_CATEGORIES } from "@/src/features/expenses/categories";
import { ApiError, errorMessage } from "@/src/lib/api/client";
import { CURRENCY_CODES } from "@/src/lib/currency/currencies";
import { useCreateExpense, type CreateExpenseInput } from "@/src/lib/data/mutations";
import { useCurrentUser, useGroup, useGroups } from "@/src/lib/data/queries";
import { formatMoney } from "@/src/lib/format/money";
import {
  equalShares,
  fromHundredths,
  toHundredths,
} from "@/src/lib/validation/expenses";
import type { GroupMember, SplitType } from "@/src/types/domain";

/** Starting values, e.g. read from a receipt. */
export type ExpensePrefill = {
  title?: string;
  amount?: string;
  category?: string;
  currency?: string;
  /** yyyy-MM-dd */
  date?: string;
};

type Participant = { included: boolean; value: string };
type ParticipantState = { groupId: string; byUser: Record<string, Participant> };

const SPLIT_TYPES: Array<{ id: SplitType; label: string }> = [
  { id: "equal", label: "Equally" },
  { id: "exact", label: "Exact amounts" },
  { id: "percentage", label: "Percentages" },
];

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/**
 * Creates an expense in a real group. Members, payer and currency follow the
 * selected group; the split is validated here and again on the server.
 */
export default function ExpenseForm({
  defaultGroupId,
  prefill,
  onCancel,
  onCreated,
}: {
  defaultGroupId?: string;
  prefill?: ExpensePrefill;
  onCancel: () => void;
  onCreated: () => void;
}) {
  const groupsQuery = useGroups();
  const { data: currentUser } = useCurrentUser();
  const createExpense = useCreateExpense();

  const [selectedGroupId, setSelectedGroupId] = useState(defaultGroupId ?? "");
  const groups = (groupsQuery.data ?? []).filter((g) => g.status !== "archived");
  const groupId = selectedGroupId || groups[0]?.id || "";
  const groupQuery = useGroup(groupId || undefined);
  const group = groupQuery.data;
  const members: GroupMember[] = group?.members ?? [];

  const [title, setTitle] = useState(prefill?.title ?? "");
  const [amount, setAmount] = useState(prefill?.amount ?? "");
  const [category, setCategory] = useState(prefill?.category ?? EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(() => prefill?.date ?? todayIso());
  // A receipt's currency wins over the group's default.
  const [currencyChoice, setCurrencyChoice] = useState<string | null>(prefill?.currency ?? null);
  const [payerChoice, setPayerChoice] = useState<string | null>(null);
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [participantState, setParticipantState] = useState<ParticipantState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // One key per form: resubmitting after a network error can't create a duplicate.
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  // Currency, payer and participants default from the selected group until edited.
  const currency = currencyChoice ?? group?.baseCurrency ?? "USD";
  const memberIds = members.map((m) => m.id);
  const payerId =
    payerChoice && memberIds.includes(payerChoice)
      ? payerChoice
      : currentUser && memberIds.includes(currentUser.id)
        ? currentUser.id
        : (memberIds[0] ?? "");
  const participants: Record<string, Participant> =
    participantState?.groupId === groupId
      ? participantState.byUser
      : Object.fromEntries(members.map((m) => [m.id, { included: true, value: "" }]));

  const included = members.filter((m) => participants[m.id]?.included);
  const amountCents = toHundredths(amount);
  const previews = amountCents && included.length > 0
    ? equalShares(amountCents, included.length)
    : [];

  function updateParticipant(userId: string, change: Partial<Participant>) {
    setParticipantState({
      groupId,
      byUser: { ...participants, [userId]: { ...participants[userId], ...change } },
    });
  }

  function changeGroup(nextGroupId: string) {
    setSelectedGroupId(nextGroupId);
    setCurrencyChoice(prefill?.currency ?? null);
    setPayerChoice(null);
    setFieldErrors({});
  }

  /** Returns an error message, or the request to send. */
  function buildRequest(): string | CreateExpenseInput {
    if (!groupId || !group) return "Choose a group";
    if (!title.trim()) return "Add a description";
    if (!amountCents) return "Enter an amount greater than zero, with at most 2 decimals";
    if (!payerId) return "Choose who paid";
    if (included.length === 0) return "Choose at least one person to split with";

    const base = {
      groupId,
      title: title.trim(),
      amount: Number(fromHundredths(amountCents)),
      currency,
      paidByUserId: payerId,
      category,
      splitType,
      occurredAt:
        date === todayIso() ? undefined : new Date(`${date}T12:00:00`).toISOString(),
    };

    if (splitType === "equal") {
      return { ...base, splits: included.map((m) => ({ userId: m.id })) };
    }

    const values = included.map((m) => toHundredths(participants[m.id]?.value ?? ""));
    if (values.some((v) => v === null)) {
      return splitType === "exact"
        ? "Enter an amount for everyone in the split"
        : "Enter a percentage for everyone in the split";
    }
    const sum = values.reduce<number>((total, v) => total + (v ?? 0), 0);
    if (splitType === "exact") {
      if (sum !== amountCents) {
        return `Split amounts add up to ${fromHundredths(sum)}, but the expense is ${fromHundredths(amountCents)}`;
      }
      return {
        ...base,
        splits: included.map((m, i) => ({ userId: m.id, amount: Number(fromHundredths(values[i]!)) })),
      };
    }
    if (sum !== 10_000) {
      return `Percentages add up to ${fromHundredths(sum)}% instead of 100%`;
    }
    return {
      ...base,
      splits: included.map((m, i) => ({ userId: m.id, percentage: Number(fromHundredths(values[i]!)) })),
    };
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    const request = buildRequest();
    if (typeof request === "string") {
      setError(request);
      return;
    }
    createExpense.mutate(
      { input: request, idempotencyKey },
      {
        onSuccess: onCreated,
        onError: (err) => {
          setError(errorMessage(err, "Couldn't add the expense"));
          if (err instanceof ApiError && err.fieldErrors) setFieldErrors(err.fieldErrors);
        },
      },
    );
  }

  if (groupsQuery.isPending) {
    return <p className="p-6 text-sm text-slate-400">Loading your groups…</p>;
  }
  if (groups.length === 0) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Create or join a group first, then you can add expenses to it.
        <div className="mt-4">
          <button type="button" onClick={onCancel} className={secondaryButton}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="px-6 py-5 flex flex-col gap-4">
      <Field label="Description" error={fieldErrors.title}>
        <input
          autoFocus
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What was it for?"
          maxLength={255}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Amount" error={fieldErrors.amount}>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
            placeholder="0.00"
            className={inputClass}
          />
        </Field>
        <Field label="Currency" error={fieldErrors.currency}>
          <select
            value={currency}
            onChange={(event) => setCurrencyChoice(event.target.value)}
            className={inputClass}
          >
            {[...new Set([currency, ...CURRENCY_CODES])].map((code) => (
              <option key={code}>{code}</option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input
            type="date"
            value={date}
            max={todayIso()}
            onChange={(event) => setDate(event.target.value || todayIso())}
            className={inputClass}
          />
        </Field>
      </div>
      {group && currency !== group.baseCurrency && (
        <p className="-mt-2 text-[11px] text-slate-400">
          Converted to {group.baseCurrency} at today&apos;s rate when saved.
        </p>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Field label="Group" error={fieldErrors.groupId}>
          <select
            value={groupId}
            onChange={(event) => changeGroup(event.target.value)}
            className={inputClass}
          >
            {groups.map((item) => (
              <option key={item.id} value={item.id}>
                {item.emoji} {item.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Paid by" error={fieldErrors.paidByUserId}>
          <select
            value={payerId}
            onChange={(event) => setPayerChoice(event.target.value)}
            className={inputClass}
            disabled={members.length === 0}
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.id === currentUser?.id ? "You" : member.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={inputClass}
          >
            {EXPENSE_CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className={labelClass}>Split</p>
          <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
            {SPLIT_TYPES.map((type) => (
              <button
                type="button"
                key={type.id}
                onClick={() => setSplitType(type.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                  splitType === type.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
        <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-56 overflow-y-auto">
          {groupQuery.isPending && (
            <p className="px-3 py-4 text-xs text-slate-400">Loading members…</p>
          )}
          {members.map((member) => {
            const state = participants[member.id];
            const index = included.findIndex((m) => m.id === member.id);
            return (
              <div
                key={member.id}
                className={`flex items-center gap-3 px-3 py-2 ${state?.included ? "" : "opacity-50"}`}
              >
                <label className="flex-1 min-w-0 flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state?.included ?? false}
                    onChange={(event) => updateParticipant(member.id, { included: event.target.checked })}
                    className="w-3.5 h-3.5 accent-indigo-600"
                  />
                  <Avatar member={member} size={6} />
                  <span className="text-sm text-slate-700 truncate">
                    {member.id === currentUser?.id ? "You" : member.name}
                  </span>
                </label>
                {splitType === "equal" ? (
                  <span className="text-xs font-semibold text-slate-600">
                    {index >= 0 && previews[index] !== undefined
                      ? formatMoney(previews[index] / 100, currency)
                      : "—"}
                  </span>
                ) : (
                  <div className="relative w-24">
                    <input
                      value={state?.value ?? ""}
                      disabled={!state?.included}
                      onChange={(event) => updateParticipant(member.id, { value: event.target.value })}
                      inputMode="decimal"
                      placeholder="0.00"
                      className="w-full border border-slate-200 rounded-md pl-2 pr-6 py-1 text-xs text-right"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                      {splitType === "percentage" ? "%" : currency}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {fieldErrors.splits && <p className={errorClass}>{fieldErrors.splits}</p>}
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-600">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className={secondaryButton}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={createExpense.isPending || !group}
          className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 disabled:opacity-60 text-white rounded-lg py-2.5 text-sm font-semibold"
        >
          {createExpense.isPending && <Loader2 size={14} className="animate-spin" />}
          Add Expense
        </button>
      </div>
    </form>
  );
}

const labelClass = "text-xs font-semibold text-slate-500 uppercase tracking-wider";
const inputClass =
  "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-white disabled:bg-slate-50";
const errorClass = "mt-1 text-[11px] text-rose-600";
const secondaryButton =
  "flex-1 border border-slate-200 rounded-lg py-2.5 px-4 text-sm font-semibold text-slate-700";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={`${labelClass} block mb-1.5`}>{label}</label>
      {children}
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
}
