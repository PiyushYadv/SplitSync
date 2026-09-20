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
  ArrowRight,
  UserPlus,
  CheckCheck,
} from "lucide-react";

import { ALL_EXPENSES } from "@/src/data/groupData";
import { useAppContext } from "@/src/context/AppContext";
import { AppProvider } from "@/src/context/AppContext";
import { CURRENCY_CODES, getCurrencyMeta } from "@/src/lib/currency/currencies";
import {
  APP_NAVIGATION,
  DEFAULT_GROUP_NAVIGATION,
} from "@/src/config/app-navigation";
import { INITIAL_NOTIFICATIONS } from "@/src/features/notifications/data";
import NewExpenseModalComponent from "@/src/features/expenses/components/NewExpenseModal";
import NewGroupModalComponent from "@/src/features/groups/components/NewGroupModal";
import { createExpense } from "@/src/lib/data/mutations";
import { logout } from "@/src/lib/data/authMutations";
import type { NewExpensePayload } from "@/src/features/expenses/components/NewExpenseModal";
import {
  markNotificationRead,
  dismissNotification,
} from "@/src/lib/data/notificationMutations";
import { QueryProvider } from "@/src/components/providers/QueryProvider";

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

function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { searchQuery, setSearchQuery, currency, setCurrency } =
    useAppContext();

  const [groupsOpen, setGroupsOpen] = useState(true);
  const [groups, setGroups] = useState(DEFAULT_GROUP_NAVIGATION);

  const [showExpense, setShowExpense] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);

  const [showSearch, setShowSearch] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const notifsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const handleCreateExpense = async (payload: NewExpensePayload) => {
    if (process.env.NEXT_PUBLIC_DATA_SOURCE === "api")
      await createExpense(payload);
  };
  const handleLogout = async () => {
    if (process.env.NEXT_PUBLIC_DATA_SOURCE === "api") await logout();
    router.push("/login");
  };

  const searchResults =
    searchQuery.trim().length > 0
      ? ALL_EXPENSES.filter(
          (e) =>
            e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.category.toLowerCase().includes(searchQuery.toLowerCase()),
        ).slice(0, 6)
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

  function markAllRead() {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read: true,
      })),
    );
    if (process.env.NEXT_PUBLIC_DATA_SOURCE === "api") {
      void Promise.all(
        notifications
          .filter((item) => !item.read)
          .map((item) => markNotificationRead(item.id)),
      );
    }
  }

  function dismissNotif(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (process.env.NEXT_PUBLIC_DATA_SOURCE === "api")
      void dismissNotification(id);
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
                {groups.map(({ id, label, color }) => (
                  <button
                    key={id}
                    onClick={() => router.push(`/groups/${id}`)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${color}`} />

                    <span className="truncate">{label}</span>
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
            onClick={() => void handleLogout()}
            className="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-slate-50 cursor-pointer group text-left"
          >
            <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white text-[11px] font-bold">
              ME
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                Your Account
              </p>

              <p className="text-[11px] text-slate-400 truncate">
                you@email.com
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
                placeholder="Search expenses… (⌘K)"
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
              {showSearch && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  {searchResults.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-xs font-semibold text-slate-500">
                        {`No expenses match "${searchQuery}"`}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          {searchResults.length} result
                          {searchResults.length !== 1 ? "s" : ""}
                        </p>

                        <button
                          onClick={() => {
                            router.push("/dashboard");
                            setShowSearch(false);
                          }}
                          className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1"
                        >
                          View all
                          <ArrowRight size={10} />
                        </button>
                      </div>

                      {searchResults.map((exp) => (
                        <button
                          key={exp.id}
                          onClick={() => {
                            router.push("/dashboard");
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

                            <p className="text-[11px] text-slate-400">
                              {exp.category} · {exp.date}
                            </p>
                          </div>

                          <span className="text-sm font-bold text-slate-700">
                            {getCurrencyMeta(currency).symbol}
                            {(
                              exp.amount * getCurrencyMeta(currency).rate
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
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
            {/* CURRENCY */}
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-md pl-3 pr-7 py-1.5 text-sm text-slate-700 font-medium"
              >
                {CURRENCY_CODES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>

            {/* NOTIFICATIONS */}
            <div className="relative" ref={notifsRef}>
              <button
                onClick={() => setShowNotifs((v) => !v)}
                className="relative w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
              >
                <Bell size={16} />

                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                    {unreadCount}
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
                        onClick={markAllRead}
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

                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                              {n.desc}
                            </p>

                            <p className="text-[10px] text-slate-400 mt-1">
                              {n.time}
                            </p>
                          </div>

                          {!n.read && (
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
                          )}

                          <button
                            onClick={() => dismissNotif(n.id)}
                            className="shrink-0 w-5 h-5 flex items-center justify-center text-slate-300 hover:text-slate-500"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-slate-100">
                      <button
                        onClick={() => setNotifications([])}
                        className="w-full text-center text-[11px] font-semibold text-slate-400"
                      >
                        Clear all notifications
                      </button>
                    </div>
                  )}
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

      {/* YOUR EXISTING MODALS */}
      {showExpense && (
        <NewExpenseModalComponent
          onClose={() => setShowExpense(false)}
          onCreate={handleCreateExpense}
        />
      )}

      {showNewGroup && (
        <NewGroupModalComponent
          onClose={() => setShowNewGroup(false)}
          onAdd={(group) => setGroups((prev) => [...prev, group])}
        />
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AppProvider>
        <AppShell>{children}</AppShell>
      </AppProvider>
    </QueryProvider>
  );
}
