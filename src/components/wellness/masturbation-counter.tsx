"use client";

import * as React from "react";
import { Plus, Minus, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  incrementMasturbation,
  decrementMasturbation,
  resetMasturbationToday,
} from "@/lib/actions/masturbation";
import { cn } from "@/lib/utils";

export function MasturbationCounter({
  initialCount,
  variant = "compact",
}: {
  initialCount: number;
  variant?: "compact" | "full";
}) {
  const [count, setCount] = React.useState(initialCount);
  const [pending, startTransition] = React.useTransition();
  const [bump, setBump] = React.useState(0);

  // Re-sync when the server prop changes after a revalidation.
  const [synced, setSynced] = React.useState(initialCount);
  if (synced !== initialCount) {
    setSynced(initialCount);
    setCount(initialCount);
  }

  function run(
    action: () => Promise<{ ok: boolean; count?: number; message?: string }>,
    optimistic: number,
  ) {
    const prev = count;
    setCount(optimistic);
    setBump((b) => b + 1);
    startTransition(async () => {
      const res = await action();
      if (!res.ok) {
        setCount(prev);
        toast.error(res.message ?? "Could not update");
      } else if (typeof res.count === "number") {
        setCount(res.count);
      }
    });
  }

  function onReset() {
    const prev = count;
    setCount(0);
    startTransition(async () => {
      const res = await resetMasturbationToday();
      if (!res.ok) {
        setCount(prev);
        toast.error(res.message ?? "Could not reset");
      } else {
        toast.success("Reset for today");
      }
    });
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center",
        variant === "full" ? "gap-6 py-2" : "gap-4",
      )}
    >
      <div className="flex flex-col items-center">
        <span
          key={bump}
          className={cn(
            "font-semibold tabular-nums leading-none animate-pop",
            variant === "full" ? "text-7xl" : "text-5xl",
          )}
        >
          {count}
        </span>
        <span className="mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Today&apos;s count
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          disabled={pending || count <= 0}
          onClick={() => run(decrementMasturbation, Math.max(0, count - 1))}
          aria-label="Decrease"
        >
          <Minus className="size-4" />
        </Button>

        <Button
          size={variant === "full" ? "lg" : "default"}
          className={cn(variant === "full" ? "h-14 w-14 rounded-full" : "h-12 w-12 rounded-full")}
          disabled={pending}
          onClick={() => run(incrementMasturbation, count + 1)}
          aria-label="Increase"
        >
          {pending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Plus className="size-5" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          disabled={pending || count <= 0}
          onClick={onReset}
          aria-label="Reset"
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
    </div>
  );
}
