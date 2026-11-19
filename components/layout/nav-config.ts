import {
  Activity,
  BarChart3,
  CalendarCheck,
  Pill,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  short: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Activity, short: "Home" },
  { label: "Today", href: "/today", icon: CalendarCheck, short: "Today" },
  { label: "Medications", href: "/medications", icon: Pill, short: "Meds" },
  { label: "Statistics", href: "/statistics", icon: BarChart3, short: "Stats" },
  { label: "Family", href: "/family", icon: Users, short: "Family" },
];

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
