import { Bell, Globe, Palette, Shield, User } from "lucide-react";

export const SETTINGS_SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "currency", label: "Currency & Region", icon: Globe },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]["id"];
