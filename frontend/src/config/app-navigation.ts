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
