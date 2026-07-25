"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, Clock, Loader2 } from "lucide-react";

import type { DoseStatus } from "@/models";
import { setDoseCompletion } from "@/actions/logs";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface DoseItemProps {
  medicationName: string;
  scheduledTime: string;
  scheduledMinutes: number;
  date: string;
  initialCompleted: boolean;
  nowMinutes: number;
  isToday?: boolean;
  showMedName?: boolean;
}

const STATUS_META: Record<
  DoseStatus,
  { label: string; variant: "success" | "secondary" | "warning" | "default" }
> = {
  completed: { label: "Completed", variant: "success" },
  upcoming: { label: "Pending", variant: "default" },
  pending: { label: "Pending", variant: "default" },
  missed: { label: "Missed", variant: "warning" },
};

export function DoseItem({
  medicationName,
  scheduledTime,
  scheduledMinutes,
  date,
  initialCompleted,
  nowMinutes,
  isToday = true,
  showMedName = true,
}: DoseItemProps) {
  const [completed, setCompleted] = React.useState(initialCompleted);
  const [pending, startTransition] = React.useTransition();
  const { toast } = useToast();

  const status: DoseStatus = completed
    ? "completed"
    : isToday && scheduledMinutes > nowMinutes
      ? "upcoming"
      : "missed";
  const meta = STATUS_META[status];

  function toggle() {
    const next = !completed;
    setCompleted(next);
    startTransition(async () => {
      const result = await setDoseCompletion({
        medicationName,
        scheduledTime,
        completed: next,
        date,
      });
      if (!result.ok) {
        setCompleted(!next);
        toast({ title: "Couldn't save", description: result.error, variant: "error" });
      } else if (next) {
        toast({ title: "Nice! Dose completed", variant: "success" });
      }
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-secondary/40 p-3 transition-colors hover:bg-secondary/70">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={completed}
        aria-label={completed ? "Mark dose incomplete" : "Mark dose complete"}
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all active:scale-90",
          completed
            ? "border-health-green bg-health-green text-white"
            : "border-border bg-background text-muted-foreground hover:border-health-green hover:text-health-green",
        )}
      >
        {pending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : completed ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
          >
            <Check className="h-5 w-5" strokeWidth={3} />
          </motion.span>
        ) : (
          <Check className="h-5 w-5 opacity-40" strokeWidth={3} />
        )}
      </button>

      <div className="min-w-0 flex-1">
        {showMedName ? (
          <p
            className={cn(
              "truncate text-sm font-semibold",
              completed && "text-muted-foreground line-through",
            )}
          >
            {medicationName}
          </p>
        ) : null}
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {scheduledTime}
        </p>
      </div>

      <Badge variant={meta.variant}>{meta.label}</Badge>
    </div>
  );
}
