"use client";

import { useState } from "react";
import { X } from "lucide-react";

const CATEGORIES = [
  "Food & Drink",
  "Accommodation",
  "Transport",
  "Activities",
  "Utilities",
  "Home",
  "Wellness",
  "Other",
];
const GROUPS = ["Trip to Bali", "Apartment Bills", "Ski Trip"];
const MEMBERS = ["You", "Alice Chen", "Bob Tanaka", "Charlie Roy", "Diana Lim"];
export type NewExpensePayload = {
  groupId: string;
  title: string;
  amount: number;
  currency: string;
  paidByUserId: string;
  category: string;
};

export default function NewExpenseModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate?: (payload: NewExpensePayload) => Promise<void> | void;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [group, setGroup] = useState(GROUPS[0]);
  const [paidBy, setPaidBy] = useState(MEMBERS[0]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await onCreate?.({
      groupId: group.toLowerCase().replace(/\s+/g, "-"),
      title: description,
      amount: Number(amount),
      currency: "USD",
      paidByUserId: paidBy.toLowerCase().replace(/\s+/g, "-"),
      category,
    });
    onClose();
  }

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
            <h2 className="text-base font-bold text-slate-900">New Expense</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Split with your group
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X size={14} />
          </button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 flex flex-col gap-4">
          <Field label="Description">
            <input
              autoFocus
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What was it for?"
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (USD)">
              <input
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className={inputClass}
              />
            </Field>
            <Field label="Category">
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={inputClass}
              >
                {CATEGORIES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Group">
              <select
                value={group}
                onChange={(event) => setGroup(event.target.value)}
                className={inputClass}
              >
                {GROUPS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
            <Field label="Paid by">
              <select
                value={paidBy}
                onChange={(event) => setPaidBy(event.target.value)}
                className={inputClass}
              >
                {MEMBERS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 rounded-lg py-2.5 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-semibold"
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 bg-white";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
