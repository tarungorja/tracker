"use client";

import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { useLiveClock } from "@/hooks/use-live-clock";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Topbar() {
  const { time, date, mounted } = useLiveClock();

  return (
    <header className="sticky top-0 z-30 -mx-4 mb-4 px-4 py-3 sm:-mx-6 sm:px-6">
      <div className="glass flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5">
        <div className="flex items-center gap-2 lg:hidden">
          <MobileSidebar />
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-health-violet text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold">{APP_NAME}</span>
          </Link>
        </div>

        <div className="hidden min-w-0 flex-col lg:flex">
          <span className="truncate text-sm font-semibold text-foreground">
            {mounted ? date : " "}
          </span>
          <span className="text-xs text-muted-foreground">Indian Standard Time</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full bg-secondary/70 px-3 py-1.5 text-sm font-semibold tabular-nums sm:flex">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span suppressHydrationWarning>{mounted ? time : "--:--"}</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
