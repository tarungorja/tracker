import * as React from "react";
import { cn } from "@/lib/utils";
import { clamp } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  indicatorClassName?: string;
}

/** Slim, rounded, accessible progress bar. */
export function Progress({
  value,
  className,
  indicatorClassName,
  ...props
}: ProgressProps) {
  const pct = clamp(value, 0, 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full bg-primary transition-[width] duration-700 ease-out",
          indicatorClassName,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
