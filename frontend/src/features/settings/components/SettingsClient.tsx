"use client";

import { useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import SaveButton from "@/src/features/settings/components/SaveButton";
import Toggle from "@/src/features/settings/components/Toggle";
import {
  SETTINGS_SECTIONS,
  type SettingsSectionId,
} from "@/src/features/settings/sections";
import { saveSettings } from "@/src/lib/data/settingsMutations";
import {
  useTheme,
  type ThemePreference,
} from "@/src/components/providers/ThemeProvider";

const THEMES = [
  {
    key: "light",
    label: "Light",
    icon: Sun,
    preview: "bg-white border-slate-200",
  },
  {
    key: "dark",
    label: "Dark",
    icon: Moon,
    preview: "bg-slate-800 border-slate-700",
  },
  {
    key: "system",
    label: "System",
    icon: Monitor,
    preview: "bg-gradient-to-br from-white to-slate-800 border-slate-300",
  },
] as const;

export default function SettingsClient() {
  const [active, setActive] = useState<SettingsSectionId>("profile");
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState({
    expense: true,
    settlement: true,
    reminder: false,
    digest: true,
  });
  const { theme, setTheme } = useTheme();
  const [draftTheme, setDraftTheme] = useState<ThemePreference>(theme);

  const save = async () => {
    setErrorMessage(null);
    try {
      if (process.env.NEXT_PUBLIC_DATA_SOURCE === "api") {
        await saveSettings({
          section: active,
          values:
            active === "notifications" ? notifications : { theme: draftTheme },
        });
      }
      setTheme(draftTheme);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save settings",
      );
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <p className="text-[11px] text-slate-400">Account</p>
          <h1 className="text-lg font-bold text-slate-900">Settings</h1>
        </div>
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: "200px 1fr" }}
        >
          <nav className="flex flex-col gap-1">
            {SETTINGS_SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
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
                {
                  SETTINGS_SECTIONS.find((section) => section.id === active)
                    ?.label
                }
              </h2>
              {active === "profile" && (
                <div className="grid grid-cols-2 gap-4">
                  {["First name", "Last name", "Email address", "Username"].map(
                    (label) => (
                      <label
                        key={label}
                        className="text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        {label}
                        <input
                          defaultValue={
                            label === "Email address"
                              ? "you@email.com"
                              : label === "Username"
                                ? "@yourname"
                                : ""
                          }
                          readOnly={label === "Username"}
                          className="mt-1.5 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800"
                        />
                      </label>
                    ),
                  )}
                </div>
              )}
              {active === "notifications" && (
                <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800 capitalize">
                          {key} notifications
                        </p>
                        <p className="text-xs text-slate-400">
                          Receive updates about your SplitSync activity
                        </p>
                      </div>
                      <Toggle
                        on={value}
                        onChange={() =>
                          setNotifications((current) => ({
                            ...current,
                            [key]: !value,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
              {active === "appearance" && (
                <div>
                  <p className="text-sm font-bold text-slate-900 mb-1">
                    Appearance
                  </p>
                  <p className="text-xs text-slate-400 mb-5">
                    Customize how SplitSync looks on your device.
                  </p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Theme
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {THEMES.map(({ key, label, icon: Icon, preview }) => (
                      <button
                        key={key}
                        onClick={() => setDraftTheme(key as ThemePreference)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${draftTheme === key ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300 bg-white"}`}
                      >
                        <div
                          className={`w-full h-10 rounded-md border ${preview} flex items-center justify-center`}
                        >
                          <Icon
                            size={16}
                            className={
                              draftTheme === key
                                ? "text-indigo-600"
                                : "text-slate-400"
                            }
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
              {active !== "profile" &&
                active !== "notifications" &&
                active !== "appearance" && (
                  <p className="text-sm text-slate-500">
                    This settings section is ready for backend-backed
                    preferences.
                  </p>
                )}
            </section>
            {errorMessage && (
              <p className="text-sm text-rose-600">{errorMessage}</p>
            )}
            <SaveButton saved={saved} onClick={save} />
          </div>
        </div>
      </div>
    </div>
  );
}
