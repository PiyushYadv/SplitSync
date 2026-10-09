"use client";

import { useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import SaveButton from "@/src/features/settings/components/SaveButton";
import Toggle from "@/src/features/settings/components/Toggle";
import {
  SETTINGS_SECTIONS,
  type SettingsSectionId,
} from "@/src/features/settings/sections";
import { ApiError, errorMessage } from "@/src/lib/api/client";
import { CURRENCY_CODES } from "@/src/lib/currency/currencies";
import { useSaveSettings, type SettingsSection } from "@/src/lib/data/mutations";
import { useSettings } from "@/src/lib/data/queries";
import {
  useTheme,
  type ThemePreference,
} from "@/src/components/providers/ThemeProvider";
import type { NotificationPreferences, Settings } from "@/src/types/domain";

const THEMES = [
  { key: "light", label: "Light", icon: Sun, preview: "bg-white border-slate-200" },
  { key: "dark", label: "Dark", icon: Moon, preview: "bg-slate-800 border-slate-700" },
  {
    key: "system",
    label: "System",
    icon: Monitor,
    preview: "bg-gradient-to-br from-white to-slate-800 border-slate-300",
  },
] as const;

const NOTIFICATION_LABELS: Record<keyof NotificationPreferences, [string, string]> = {
  expense: ["Expenses", "When someone adds an expense you're part of"],
  settlement: ["Settlements", "When someone marks a payment to or from you as paid"],
  reminder: ["Reminders", "Nudges about payments you still owe"],
  digest: ["Weekly digest", "A summary of your groups' activity"],
};

export default function SettingsClient({ initialData }: { initialData: Settings }) {
  const { data: settings = initialData } = useSettings(initialData);
  const saveSettings = useSaveSettings();
  const { setTheme } = useTheme();

  const [active, setActive] = useState<SettingsSectionId>("profile");
  const [saved, setSaved] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [localError, setLocalError] = useState<string | null>(null);

  // Drafts start from the saved settings; each section is saved separately.
  const [profile, setProfile] = useState({
    name: settings.profile.name,
    username: settings.profile.username ?? "",
    avatarUrl: settings.profile.avatarUrl ?? "",
  });
  const [notifications, setNotifications] = useState(settings.notifications);
  const [currency, setCurrency] = useState(settings.currency);
  const [draftTheme, setDraftTheme] = useState<ThemePreference>(settings.theme);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });

  const switchSection = (id: SettingsSectionId) => {
    setActive(id);
    setFieldErrors({});
    setLocalError(null);
    saveSettings.reset();
  };

  function valuesFor(section: SettingsSection): Record<string, unknown> | string {
    switch (section) {
      case "profile":
        return {
          name: profile.name,
          username: profile.username,
          avatarUrl: profile.avatarUrl.trim() || null,
        };
      case "notifications":
        return notifications;
      case "currency":
        return { currency };
      case "appearance":
        return { theme: draftTheme };
      case "security":
        if (passwords.next.length < 8) return "New password must be at least 8 characters";
        if (passwords.next !== passwords.confirm) return "New passwords don't match";
        return { currentPassword: passwords.current, newPassword: passwords.next };
    }
  }

  const save = () => {
    if (active === "billing") return;
    setFieldErrors({});
    setLocalError(null);
    const values = valuesFor(active);
    if (typeof values === "string") {
      setLocalError(values);
      return;
    }
    saveSettings.mutate(
      { section: active, values },
      {
        onSuccess: () => {
          if (active === "appearance") setTheme(draftTheme);
          if (active === "security") setPasswords({ current: "", next: "", confirm: "" });
          setSaved(true);
          window.setTimeout(() => setSaved(false), 1800);
        },
        onError: (error) => {
          if (error instanceof ApiError && error.fieldErrors) setFieldErrors(error.fieldErrors);
        },
      },
    );
  };

  const error =
    localError ?? (saveSettings.isError ? errorMessage(saveSettings.error, "Unable to save settings") : null);

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <p className="text-[11px] text-slate-400">Account</p>
          <h1 className="text-lg font-bold text-slate-900">Settings</h1>
        </div>
        <div className="grid gap-6" style={{ gridTemplateColumns: "200px 1fr" }}>
          <nav className="flex flex-col gap-1">
            {SETTINGS_SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => switchSection(id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-left ${active === id ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>
          <div className="flex flex-col gap-5">
            <section className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-sm font-bold text-slate-900 mb-5">
                {SETTINGS_SECTIONS.find((section) => section.id === active)?.label}
              </h2>

              {active === "profile" && (
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    label="Full name"
                    value={profile.name}
                    error={fieldErrors.name}
                    onChange={(name) => setProfile({ ...profile, name })}
                  />
                  <TextField
                    label="Username"
                    value={profile.username}
                    error={fieldErrors.username}
                    placeholder="@yourname"
                    onChange={(username) => setProfile({ ...profile, username })}
                  />
                  <TextField
                    label="Email address"
                    value={settings.profile.email}
                    readOnly
                    hint="Email changes aren't supported yet"
                  />
                  <TextField
                    label="Avatar URL"
                    value={profile.avatarUrl}
                    error={fieldErrors.avatarUrl}
                    placeholder="https://…"
                    onChange={(avatarUrl) => setProfile({ ...profile, avatarUrl })}
                  />
                </div>
              )}

              {active === "notifications" && (
                <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                  {(Object.keys(NOTIFICATION_LABELS) as Array<keyof NotificationPreferences>).map(
                    (key) => (
                      <div key={key} className="flex items-center justify-between py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {NOTIFICATION_LABELS[key][0]}
                          </p>
                          <p className="text-xs text-slate-400">{NOTIFICATION_LABELS[key][1]}</p>
                        </div>
                        <Toggle
                          on={notifications[key]}
                          onChange={() =>
                            setNotifications({ ...notifications, [key]: !notifications[key] })
                          }
                        />
                      </div>
                    ),
                  )}
                  <p className="pt-4 text-[11px] text-slate-400">
                    Group invitations are always delivered.
                  </p>
                </div>
              )}

              {active === "currency" && (
                <div className="max-w-xs">
                  <label className={labelClass}>
                    Preferred currency
                    <select
                      value={currency}
                      onChange={(event) => setCurrency(event.target.value)}
                      className={inputClass}
                    >
                      {[...new Set([currency, ...CURRENCY_CODES])].map((code) => (
                        <option key={code}>{code}</option>
                      ))}
                    </select>
                  </label>
                  {fieldErrors.currency && <p className={errorClass}>{fieldErrors.currency}</p>}
                  <p className="mt-3 text-xs text-slate-400">
                    Dashboard and analytics totals are shown in this currency, and new
                    groups use it by default. Individual expenses keep their own currency.
                  </p>
                </div>
              )}

              {active === "security" && (
                <div className="grid grid-cols-1 gap-4 max-w-sm">
                  <TextField
                    label="Current password"
                    type="password"
                    value={passwords.current}
                    error={fieldErrors.currentPassword}
                    onChange={(current) => setPasswords({ ...passwords, current })}
                  />
                  <TextField
                    label="New password"
                    type="password"
                    value={passwords.next}
                    error={fieldErrors.newPassword}
                    placeholder="At least 8 characters"
                    onChange={(next) => setPasswords({ ...passwords, next })}
                  />
                  <TextField
                    label="Confirm new password"
                    type="password"
                    value={passwords.confirm}
                    onChange={(confirm) => setPasswords({ ...passwords, confirm })}
                  />
                  <p className="text-xs text-slate-400">
                    Changing your password signs you out on all other devices.
                  </p>
                </div>
              )}

              {active === "billing" && (
                <p className="text-sm text-slate-500">Billing isn&apos;t available yet.</p>
              )}

              {active === "appearance" && (
                <div>
                  <p className="text-xs text-slate-400 mb-5">
                    Customize how SplitSync looks. Saved to your account.
                  </p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Theme
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {THEMES.map(({ key, label, icon: Icon, preview }) => (
                      <button
                        key={key}
                        onClick={() => setDraftTheme(key)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${draftTheme === key ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300 bg-white"}`}
                      >
                        <div
                          className={`w-full h-10 rounded-md border ${preview} flex items-center justify-center`}
                        >
                          <Icon
                            size={16}
                            className={draftTheme === key ? "text-indigo-600" : "text-slate-400"}
                          />
                        </div>
                        <span
                          className={`text-xs font-semibold ${draftTheme === key ? "text-indigo-700" : "text-slate-600"}`}
                        >
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            {active !== "billing" && (
              <SaveButton saved={saved} pending={saveSettings.isPending} onClick={save} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider";
const inputClass =
  "mt-1.5 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 normal-case tracking-normal font-normal read-only:bg-slate-50 read-only:text-slate-500";
const errorClass = "mt-1 text-[11px] text-rose-600 normal-case tracking-normal font-normal";

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  hint,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  readOnly?: boolean;
}) {
  return (
    <label className={labelClass}>
      {label}
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        autoComplete={type === "password" ? "new-password" : undefined}
        onChange={(event) => onChange?.(event.target.value)}
        className={inputClass}
      />
      {error && <p className={errorClass}>{error}</p>}
      {hint && !error && (
        <p className="mt-1 text-[11px] text-slate-400 normal-case tracking-normal font-normal">
          {hint}
        </p>
      )}
    </label>
  );
}
