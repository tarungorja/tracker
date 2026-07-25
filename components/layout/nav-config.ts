import {
  Activity,
  BarChart3,
  CalendarCheck,
  HeartPulse,
  Pill,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  short: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: Activity, short: "Home" },
  { label: "Today", href: "/today", icon: CalendarCheck, short: "Today" },
  { label: "Medications", href: "/medications", icon: Pill, short: "Meds" },
  { label: "Statistics", href: "/statistics", icon: BarChart3, short: "Stats" },
  { label: "Wellness", href: "/wellness", icon: HeartPulse, short: "Wellness" },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
