"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { NAV_ITEMS } from "./nav-config";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[var(--border)] bg-[var(--card)]/60 px-4 py-6 backdrop-blur-xl lg:flex">
      <Link href="/" className="mb-8 flex items-center gap-3 px-2">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
          <Sparkles className="size-5" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">MedTrack</span>
          <span className="text-xs text-muted-foreground">Daily routine</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-[var(--muted)] text-foreground"
                  : "text-muted-foreground hover:bg-[var(--muted)]/60 hover:text-foreground",
              )}
            >
              {active ? (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              ) : null}
              <Icon
                className={cn(
                  "size-[18px] transition-transform group-hover:scale-110",
                  active ? "text-primary" : "",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 p-3.5 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Stay consistent 🌱</p>
        <p className="mt-1 leading-relaxed">
          Small daily habits compound. You&apos;ve got this.
        </p>
      </div>
    </aside>
  );
}
