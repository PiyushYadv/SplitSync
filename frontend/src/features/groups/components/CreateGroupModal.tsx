"use client";

import { useState } from "react";
import { Check, Search, UserPlus, X } from "lucide-react";
import { FRIENDS, SEARCH_USERS, type UserProfile } from "@/src/data/groupData";
import {
  GROUP_COLORS,
  GROUP_EMOJIS,
  type GroupListItem,
} from "@/src/features/groups/types";

export default function CreateGroupModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (group: GroupListItem) => Promise<void> | void;
}) {
  const [step, setStep] = useState<"info" | "members">("info");
  const [tab, setTab] = useState<"friends" | "search">("friends");
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(GROUP_EMOJIS[0]);
  const [color, setColor] = useState("indigo");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<UserProfile[]>([]);
  const results = SEARCH_USERS.filter((user) =>
    `${user.name} ${user.username}`.toLowerCase().includes(query.toLowerCase()),
  );
  const toggle = (user: UserProfile) =>
    setSelected((current) =>
      current.some((item) => item.id === user.id)
        ? current.filter((item) => item.id !== user.id)
        : [...current, user],
    );
  const create = async () => {
    if (!name.trim()) return;
    await onCreate({
      id: `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      name: name.trim(),
      emoji,
      color: color as GroupListItem["color"],
      memberCount: selected.length + 1,
      totalSpend: 0,
      balance: 0,
      status: "active",
      lastActivity: "Just now",
    });
    onClose();
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
                : "Step 2 of 2 — Add members"}
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
                    className={`w-6 h-6 rounded-full ${item.dot} ${color === item.id ? "ring-2 ring-offset-2 ring-slate-400" : ""}`}
                  />
                ))}
              </div>
            </div>
            <button
              disabled={!name.trim()}
              onClick={() => setStep("members")}
              className="bg-indigo-600 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-lg py-2.5 text-sm font-semibold"
            >
              Next: Add Members
            </button>
          </div>
        ) : (
          <div className="px-6 py-5 flex flex-col gap-4">
            <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
              {(["friends", "search"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${tab === item ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {item === "friends" ? "My Friends" : "Search by Username"}
                </button>
              ))}
            </div>
            {tab === "friends" ? (
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                {FRIENDS.map((user) => (
                  <MemberRow
                    key={user.id}
                    user={user}
                    added={selected.some((item) => item.id === user.id)}
                    onToggle={() => toggle(user)}
                    compact
                  />
                ))}
              </div>
            ) : (
              <div>
                <div className="relative mb-3">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    autoFocus
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by name or @username…"
                    className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-2.5 text-sm"
                  />
                </div>
                {query.trim() === "" ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Type a name or username to search
                  </p>
                ) : results.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No users found for “{query}”
                  </p>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                    {results.map((user) => (
                      <MemberRow
                        key={user.id}
                        user={user}
                        added={selected.some((item) => item.id === user.id)}
                        onToggle={() => toggle(user)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            {selected.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Added ({selected.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selected.map((user) => (
                    <span
                      key={user.id}
                      className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium"
                    >
                      {user.name}
                      <button onClick={() => toggle(user)}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
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
                className="flex-1 bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-semibold"
              >
                Create Group
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MemberRow({
  user,
  added,
  onToggle,
  compact = false,
}: {
  user: UserProfile;
  added: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
      <div
        className={`${compact ? "w-8 h-8" : "w-7 h-7"} rounded-full flex items-center justify-center text-white text-xs font-bold`}
        style={{ backgroundColor: user.color }}
      >
        {user.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
        <p className="text-xs text-slate-400">
          {user.username}
          {compact ? ` · ${user.mutual} mutual` : ""}
        </p>
      </div>
      <button
        onClick={onToggle}
        className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md ${added ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"}`}
      >
        {added ? (
          <>
            <Check size={11} /> Added
          </>
        ) : (
          <>
            <UserPlus size={11} /> Add
          </>
        )}
      </button>
    </div>
  );
}
