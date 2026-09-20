import {
  BarChart3,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export const APP_NAVIGATION: Array<{
  href: string;
  label: string;
  icon: LucideIcon;
}> = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/groups", icon: Users, label: "Groups" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export const DEFAULT_GROUP_NAVIGATION = [
  { id: "bali", label: "Trip to Bali", color: "bg-emerald-400" },
  { id: "apartment", label: "Apartment Bills", color: "bg-indigo-400" },
  { id: "ski", label: "Ski Trip", color: "bg-amber-400" },
];
