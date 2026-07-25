import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type Accent = "primary" | "rose" | "amber" | "green" | "blue" | "violet";

const ACCENT_TEXT: Record<Accent, string> = {
  primary: "text-primary",
  rose: "text-health-rose",
  amber: "text-health-amber",
  green: "text-health-green",
  blue: "text-health-blue",
  violet: "text-health-violet",
};

const ACCENT_BG: Record<Accent, string> = {
  primary: "bg-primary/10",
  rose: "bg-health-rose/12",
  amber: "bg-health-amber/12",
  green: "bg-health-green/12",
  blue: "bg-health-blue/12",
  violet: "bg-health-violet/12",
};

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: LucideIcon;
  accent?: Accent;
  className?: string;
}

/** Compact metric tile used across the dashboard and statistics pages. */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "primary",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {Icon ? (
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-xl",
              ACCENT_BG[accent],
              ACCENT_TEXT[accent],
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <div className={cn("mt-2 text-2xl font-bold tabular-nums sm:text-3xl", ACCENT_TEXT[accent])}>
        {value}
      </div>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}
