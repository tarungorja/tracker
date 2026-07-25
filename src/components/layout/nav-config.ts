import {
  LayoutDashboard,
  Pill,
  CalendarDays,
  BarChart3,
  Activity,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shorter label for the mobile tab bar. */
  short?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, short: "Home" },
  { href: "/medications", label: "Schedule", icon: Pill, short: "Meds" },
  { href: "/calendar", label: "Calendar", icon: CalendarDays, short: "Calendar" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, short: "Stats" },
  { href: "/masturbation", label: "Wellness", icon: Activity, short: "Wellness" },
  { href: "/settings", label: "Settings", icon: Settings, short: "Settings" },
];

/** Page title shown in the top bar for a given pathname. */
export function titleForPath(pathname: string): string {
  const exact = NAV_ITEMS.find((i) => i.href === pathname);
  if (exact) return exact.label;
  const prefix = NAV_ITEMS.filter((i) => i.href !== "/").find((i) =>
    pathname.startsWith(i.href),
  );
  return prefix?.label ?? "Dashboard";
}
