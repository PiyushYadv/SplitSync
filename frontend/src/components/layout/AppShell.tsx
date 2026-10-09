"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Plus,
  Bell,
  Search,
  LogOut,
  X,
  DollarSign,
  Receipt,
  UserPlus,
  CheckCheck,
} from "lucide-react";

import { useAppContext } from "@/src/context/AppContext";
import { CURRENCY_CODES } from "@/src/lib/currency/currencies";
import { APP_NAVIGATION } from "@/src/config/app-navigation";
import NewExpenseModalComponent from "@/src/features/expenses/components/NewExpenseModal";
import CreateGroupModal from "@/src/features/groups/components/CreateGroupModal";
import { GROUP_COLOR_STYLES } from "@/src/features/groups/types";
import Avatar from "@/src/features/dashboard/components/Avatar";
import {
  useDismissNotification,
  useLogout,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useSaveSettings,
} from "@/src/lib/data/mutations";
import {
  useCurrentUser,
  useExpenses,
  useGroups,
  useNotifications,
  useSettings,
} from "@/src/lib/data/queries";
import { formatRelativeTime } from "@/src/lib/format/date";
import { formatMoney } from "@/src/lib/format/money";
import type { CurrentUser, Notification } from "@/src/types/domain";

const NOTIF_ICON = {
  expense: <Receipt size={13} className="text-indigo-600" />,
  settlement: <DollarSign size={13} className="text-emerald-600" />,
  invite: <UserPlus size={13} className="text-amber-600" />,
  reminder: <Bell size={13} className="text-rose-500" />,
};

const NOTIF_BG = {
  expense: "bg-indigo-50",
  settlement: "bg-emerald-50",
  invite: "bg-amber-50",
  reminder: "bg-rose-50",
};

/** Where clicking a notification takes you. */
function notificationHref(notification: Notification) {
  if (notification.type === "invite") return "/groups";
  const groupId = notification.metadata?.groupId;
  return typeof groupId === "string" ? `/groups/${groupId}` : null;
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (
    parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts.at(-1)![0]
  ).toUpperCase();
}

export default function AppShell({
  initialUser,
  children,
}: {
  initialUser: CurrentUser;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { searchQuery, setSearchQuery } = useAppContext();

  const [groupsOpen, setGroupsOpen] = useState(true);
  const [showExpense, setShowExpense] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const notifsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: currentUser } = useCurrentUser(initialUser);
  const { data: groups = [] } = useGroups();
  const { data: settings } = useSettings();
  const { data: notificationList } = useNotifications();
  const searching = showSearch && searchQuery.trim().length > 0;
  // The API has no text search, so the header searches your latest 100 expenses.
  const { data: recentExpenses } = useExpenses({ limit: 100 }, searching);

  const logout = useLogout();
  const saveSettings = useSaveSettings();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const dismiss = useDismissNotification();

  const notifications = notificationList?.data ?? [];
  const unreadCount = notificationList?.unreadCount ?? 0;
  const groupNames = new Map(groups.map((g) => [g.id, `${g.emoji} ${g.name}`]));

  const handleLogout = () => {
    logout.mutate(undefined, { onSettled: () => router.push("/login") });
  };

  const searchResults = searching
    ? (recentExpenses?.data ?? [])
        .filter(
          (e) =>
            e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.category.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .slice(0, 6)
    : [];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }

      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    }

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  function openNotification(notification: Notification) {
    if (!notification.read) markRead.mutate(notification.id);
    const href = notificationHref(notification);
    if (href) {
      setShowNotifs(false);
      router.push(href);
    }
  }

  const navItems = APP_NAVIGATION;

  return (
    <div
      className="flex h-screen bg-slate-50 overflow-hidden"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 14,
      }}
    >
      {/* SIDEBAR */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
        <div
          className="h-14 flex items-center gap-2.5 px-5 border-b border-slate-200 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <RefreshCw size={14} className="text-white" strokeWidth={2.5} />
          </div>

          <span className="font-bold text-slate-900 text-sm tracking-tight">
            SplitSync
          </span>

          <span className="ml-auto text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded ring-1 ring-indigo-200">
            Pro
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <div className="mb-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2 mb-1.5">
              Menu
            </p>

            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive =
                pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors mb-0.5 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={15} strokeWidth={isActive ? 2.5 : 1.8} />

                  {label}
                </Link>
              );
            })}
          </div>

          {/* GROUPS */}
          <div>
            <button
              className="w-full flex items-center gap-2 px-2 mb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest hover:text-slate-600"
              onClick={() => setGroupsOpen((v) => !v)}
            >
              My Groups
              {groupsOpen ? (
                <ChevronDown size={11} className="ml-auto" />
              ) : (
                <ChevronRight size={11} className="ml-auto" />
              )}
            </button>

            {groupsOpen && (
              <div className="flex flex-col gap-0.5">
                {groups.map(({ id, name, emoji, color }) => (
                  <button
                    key={id}
                    onClick={() => router.push(`/groups/${id}`)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs hover:bg-slate-50 hover:text-slate-700 ${
                      pathname === `/groups/${id}`
                        ? "text-slate-900 font-semibold"
                        : "text-slate-500"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${GROUP_COLOR_STYLES[color]?.dot ?? "bg-indigo-400"}`}
                    />

                    <span className="truncate">
                      {emoji} {name}
                    </span>
                  </button>
                ))}

                <button
                  onClick={() => setShowNewGroup(true)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <Plus size={12} />
                  New group
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* ACCOUNT */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            title="Sign out"
            className="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-slate-50 cursor-pointer group text-left"
          >
            {currentUser ? (
              <Avatar
                member={{
                  name: currentUser.name,
                  initials: initialsOf(currentUser.name),
                  color: "#f43f5e",
                  avatarUrl: currentUser.avatarUrl,
                }}
                size={7}
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-200 animate-pulse" />
            )}

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {currentUser?.name ?? "Loading…"}
              </p>

              <p className="text-[11px] text-slate-400 truncate">
                {currentUser?.email ?? ""}
              </p>
            </div>

            <LogOut
              size={13}
              className="text-slate-400 group-hover:text-slate-600"
            />
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center gap-4 px-6 shrink-0">
          {/* SEARCH */}
          <div className="flex-1 max-w-md" ref={searchRef}>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />

              <input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearch(true);
                }}
                onFocus={() => setShowSearch(true)}
                placeholder="Search recent expenses…"
                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-4 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              />

              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearch(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}

              {/* SEARCH RESULTS */}
              {searching && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  {searchResults.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-xs font-semibold text-slate-500">
                        {recentExpenses
                          ? `No expenses match "${searchQuery}"`
                          : "Searching…"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          {searchResults.length} result
                          {searchResults.length !== 1 ? "s" : ""}
                        </p>
                      </div>

                      {searchResults.map((exp) => (
                        <button
                          key={exp.id}
                          onClick={() => {
                            router.push(`/groups/${exp.groupId}`);
                            setShowSearch(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 text-left"
                        >
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center"
                            style={{
                              backgroundColor: `${exp.categoryColor}18`,
                            }}
                          >
                            <Receipt
                              size={12}
                              style={{
                                color: exp.categoryColor,
                              }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {exp.title}
                            </p>

                            <p className="text-[11px] text-slate-400 truncate">
                              {exp.category} ·{" "}
                              {groupNames.get(exp.groupId) ?? "Group"}
                            </p>
                          </div>

                          <span className="text-sm font-bold text-slate-700">
                            {formatMoney(exp.amount, exp.currency)}
                          </span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* PREFERRED CURRENCY (used for dashboard & analytics totals) */}
            {settings && (
              <div className="relative" title="Currency for totals">
                <select
                  value={settings.currency}
                  disabled={saveSettings.isPending}
                  onChange={(e) =>
                    saveSettings.mutate({
                      section: "currency",
                      values: { currency: e.target.value },
                    })
                  }
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-md pl-3 pr-7 py-1.5 text-sm text-slate-700 font-medium"
                >
                  {[...new Set([settings.currency, ...CURRENCY_CODES])].map(
                    (c) => (
                      <option key={c}>{c}</option>
                    ),
                  )}
                </select>

                <ChevronDown
                  size={12}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            )}

            {/* NOTIFICATIONS */}
            <div className="relative" ref={notifsRef}>
              <button
                onClick={() => setShowNotifs((v) => !v)}
                className="relative w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
                aria-label="Notifications"
              >
                <Bell size={16} />

                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-0.5 bg-rose-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        Notifications
                      </h3>

                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllRead.mutate()}
                        className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600"
                      >
                        <CheckCheck size={12} />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center">
                        <Bell
                          size={22}
                          className="text-slate-300 mx-auto mb-2"
                        />

                        <p className="text-xs font-semibold text-slate-500">
                          All caught up!
                        </p>

                        <p className="text-[11px] text-slate-400 mt-0.5">
                          No new notifications
                        </p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 ${
                            !n.read ? "bg-indigo-50/40" : "hover:bg-slate-50"
                          }`}
                        >
                          <button
                            onClick={() => openNotification(n)}
                            className="flex flex-1 min-w-0 items-start gap-3 text-left"
                          >
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${NOTIF_BG[n.type]}`}
                            >
                              {NOTIF_ICON[n.type]}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs leading-snug ${
                                  !n.read
                                    ? "font-semibold text-slate-900"
                                    : "font-medium text-slate-700"
                                }`}
                              >
                                {n.title}
                              </p>

                              {n.desc && (
                                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                                  {n.desc}
                                </p>
                              )}

                              <p className="text-[10px] text-slate-400 mt-1">
                                {formatRelativeTime(n.time)}
                              </p>
                            </div>

                            {!n.read && (
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
                            )}
                          </button>

                          <button
                            onClick={() => dismiss.mutate(n.id)}
                            aria-label="Dismiss notification"
                            className="shrink-0 w-5 h-5 flex items-center justify-center text-slate-300 hover:text-slate-500"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowExpense(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-3.5 py-1.5 rounded-md"
            >
              <Plus size={15} strokeWidth={2.5} />
              New Expense
            </button>
          </div>
        </header>

        {/* PAGE */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {showExpense && (
        <NewExpenseModalComponent
          defaultGroupId={
            pathname.startsWith("/groups/")
              ? pathname.split("/")[2]
              : undefined
          }
          onClose={() => setShowExpense(false)}
        />
      )}

      {showNewGroup && (
        <CreateGroupModal
          onClose={() => setShowNewGroup(false)}
          onCreated={(group) => {
            setShowNewGroup(false);
            router.push(`/groups/${group.id}`);
          }}
        />
      )}
    </div>
  );
}
