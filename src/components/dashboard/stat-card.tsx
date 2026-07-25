import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon: LucideIcon;
  tone?: "default" | "emerald" | "amber" | "rose" | "indigo" | "sky";
  className?: string;
}

const TONES: Record<
  NonNullable<StatCardProps["tone"]>,
  { icon: string }
> = {
  default: { icon: "bg-[var(--muted)] text-foreground" },
  emerald: { icon: "bg-emerald-500/12 text-emerald-500" },
  amber: { icon: "bg-amber-500/12 text-amber-500" },
  rose: { icon: "bg-rose-500/12 text-rose-500" },
  indigo: { icon: "bg-indigo-500/12 text-indigo-500" },
  sky: { icon: "bg-sky-500/12 text-sky-500" },
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-2xl",
            TONES[tone].icon,
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
    </Card>
  );
}
