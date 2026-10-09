"use client";

import { useState } from "react";
import { Check, Loader2, Search, UserPlus, X } from "lucide-react";
import Avatar from "@/src/features/dashboard/components/Avatar";
import { errorMessage } from "@/src/lib/api/client";
import { useFriends, useUserSearch } from "@/src/lib/data/queries";
import { useDebouncedValue } from "@/src/lib/hooks/useDebouncedValue";

export type PickedUser = {
  id: string;
  name: string;
  username?: string;
  initials: string;
  color: string;
  avatarUrl?: string;
};

/**
 * Pick people from your friends (anyone you share a group with) or search all
 * users by name / @username. `excludeIds` hides people who are already members.
 */
export default function MemberPicker({
  selected,
  onChange,
  excludeIds = [],
}: {
  selected: PickedUser[];
  onChange: (users: PickedUser[]) => void;
  excludeIds?: string[];
}) {
  const [tab, setTab] = useState<"friends" | "search">("friends");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const friends = useFriends(tab === "friends");
  const search = useUserSearch(tab === "search" ? debouncedQuery : "");
  const hidden = new Set(excludeIds);

  const toggle = (user: PickedUser) =>
    onChange(
      selected.some((item) => item.id === user.id)
        ? selected.filter((item) => item.id !== user.id)
        : [...selected, user],
    );
  const isAdded = (id: string) => selected.some((item) => item.id === id);
  const queryTooShort = query.trim().replace(/^@/, "").length < 2;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
        {(["friends", "search"] as const).map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => setTab(item)}
            className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${tab === item ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {item === "friends" ? "My Friends" : "Search by Username"}
          </button>
        ))}
      </div>

      {tab === "friends" ? (
        <div className="flex flex-col gap-1 max-h-56 overflow-y-auto">
          {friends.isPending && <Hint>Loading friends…</Hint>}
          {friends.isError && <Hint error>{errorMessage(friends.error)}</Hint>}
          {friends.data?.length === 0 && (
            <Hint>
              Friends are people you share a group with. Search by username to
              invite someone new.
            </Hint>
          )}
          {friends.data
            ?.filter((user) => !hidden.has(user.id))
            .map((user) => (
              <MemberRow
                key={user.id}
                user={user}
                detail={`${user.sharedGroupCount} shared group${user.sharedGroupCount === 1 ? "" : "s"}`}
                added={isAdded(user.id)}
                onToggle={() => toggle(user)}
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
              className="w-full border border-slate-200 rounded-lg pl-8 pr-8 py-2.5 text-sm"
            />
            {search.isFetching && (
              <Loader2
                size={13}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin"
              />
            )}
          </div>
          {queryTooShort ? (
            <Hint>Type at least 2 characters to search</Hint>
          ) : search.isError ? (
            <Hint error>{errorMessage(search.error)}</Hint>
          ) : search.data?.length === 0 ? (
            <Hint>No users found for “{query.trim()}”</Hint>
          ) : (
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
              {search.data
                ?.filter((user) => !hidden.has(user.id))
                .map((user) => (
                  <MemberRow
                    key={user.id}
                    user={user}
                    detail={
                      user.friend
                        ? "Friend"
                        : user.mutualCount > 0
                          ? `${user.mutualCount} mutual friend${user.mutualCount === 1 ? "" : "s"}`
                          : undefined
                    }
                    added={isAdded(user.id)}
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
            Selected ({selected.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map((user) => (
              <span
                key={user.id}
                className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium"
              >
                {user.name}
                <button
                  type="button"
                  onClick={() => toggle(user)}
                  aria-label={`Remove ${user.name}`}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Hint({ children, error = false }: { children: React.ReactNode; error?: boolean }) {
  return (
    <p className={`text-xs text-center py-4 ${error ? "text-rose-600" : "text-slate-400"}`}>
      {children}
    </p>
  );
}

function MemberRow({
  user,
  detail,
  added,
  onToggle,
}: {
  user: PickedUser;
  detail?: string;
  added: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
      <Avatar member={user} size={8} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
        <p className="text-xs text-slate-400 truncate">
          {user.username}
          {detail ? ` · ${detail}` : ""}
        </p>
      </div>
      <button
        type="button"
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
