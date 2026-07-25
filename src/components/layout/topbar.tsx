"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { titleForPath } from "./nav-config";
import { LiveClock } from "./live-clock";
import { ThemeToggle } from "./theme-toggle";

export function Topbar({ timeZone }: { timeZone: string }) {
  const pathname = usePathname();
  const title = titleForPath(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 lg:hidden"
            aria-label="MedTrack home"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
              <Sparkles className="size-[18px]" />
            </span>
          </Link>
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <LiveClock timeZone={timeZone} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
