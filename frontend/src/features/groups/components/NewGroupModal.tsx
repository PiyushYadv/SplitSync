"use client";

import { useState } from "react";
import { X } from "lucide-react";

const EMOJIS = ["🌍", "🏠", "🎉", "✈️", "🍕", "⛷️", "🎸", "🏖️", "🚗", "💼"];
const COLORS = [
  "bg-indigo-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-rose-400",
  "bg-violet-400",
  "bg-sky-400",
];

export default function NewGroupModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (group: { id: string; label: string; color: string }) => void;
}) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [color, setColor] = useState(COLORS[0]);
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    const id = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    onAdd({ id, label: `${emoji} ${name.trim()}`, color });
    onClose();
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">New Group</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400"
          >
            <X size={14} />
          </button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 flex flex-col gap-4">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Group name
            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Trip to Tokyo"
              className="mt-1.5 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm"
            />
          </label>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Icon
            </p>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((item) => (
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
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Color
            </p>
            <div className="flex gap-2">
              {COLORS.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setColor(item)}
                  className={`w-6 h-6 rounded-full ${item} ${color === item ? "ring-2 ring-offset-2 ring-slate-400" : ""}`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 rounded-lg py-2.5 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-semibold"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
