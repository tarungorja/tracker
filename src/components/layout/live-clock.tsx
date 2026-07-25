"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNow } from "@/lib/hooks";

interface LiveClockProps {
  timeZone: string;
  className?: string;
  variant?: "bar" | "hero";
}

/** Ticking clock rendered in the user's configured timezone. */
export function LiveClock({ timeZone, className, variant = "bar" }: LiveClockProps) {
  const nowMs = useNow();
  const now = nowMs === null ? null : new Date(nowMs);

  const time = now
    ? now.toLocaleTimeString("en-US", {
        timeZone,
        hour: "numeric",
        minute: "2-digit",
        second: variant === "hero" ? "2-digit" : undefined,
        hour12: true,
      })
    : "--:--";

  const date = now
    ? now.toLocaleDateString("en-US", {
        timeZone,
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  if (variant === "hero") {
    return (
      <div className={cn("flex flex-col", className)}>
        <span className="font-mono text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
          {time}
        </span>
        <span className="mt-1 text-sm text-muted-foreground">{date}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3.5 py-2 text-sm font-medium tabular-nums sm:inline-flex",
        className,
      )}
    >
      <Clock className="size-4 text-muted-foreground" />
      <span suppressHydrationWarning>{time}</span>
    </div>
  );
}
