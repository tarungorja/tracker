"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BellRing, Loader2 } from "lucide-react";

import { remindPatient } from "@/lib/api/family";
import { pluralize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface RemindButtonProps {
  patientId: string;
  patientEmail: string;
  /** Doses past their time and not taken. The button only works when this is above zero. */
  missedCount: number;
  /** Seconds until another reminder is allowed (0 when it's allowed now). */
  waitSeconds: number;
  /** Small inline button (no helper text), for lists and cards. */
  compact?: boolean;
}

/** Sends a "you missed a dose" push to the followed account, and only when a dose was missed. */
export function RemindButton({
  patientId,
  patientEmail,
  missedCount,
  waitSeconds,
  compact = false,
}: RemindButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = React.useTransition();
  const [wait, setWait] = React.useState(waitSeconds);

  // The page refreshes itself every minute, which hands us a new server-side value.
  React.useEffect(() => setWait(waitSeconds), [waitSeconds]);
  React.useEffect(() => {
    if (wait <= 0) return;
    const id = setInterval(() => setWait((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [wait > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const nothingMissed = missedCount === 0;
  const cooling = wait > 0;

  function send() {
    startTransition(async () => {
      const result = await remindPatient(patientId);
      if (result.ok) {
        toast({
          title: "Reminder sent",
          description: `${patientEmail} was notified about ${pluralize(result.missedCount, "missed dose")}.`,
          variant: "success",
        });
        setWait(300);
      } else {
        toast({ title: "Couldn't send the reminder", description: result.error, variant: "error" });
      }
      router.refresh();
    });
  }

  const countdown = `${Math.floor(wait / 60)}:${String(wait % 60).padStart(2, "0")}`;
  let label = compact ? "Remind" : `Remind about ${pluralize(missedCount, "missed dose")}`;
  if (nothingMissed) label = "No missed doses";
  else if (cooling) label = compact ? `Sent · ${countdown}` : `Sent. Again in ${countdown}`;

  return (
    <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
      <Button
        size={compact ? "sm" : "default"}
        onClick={send}
        disabled={pending || nothingMissed || cooling}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
        {label}
      </Button>
      {nothingMissed && !compact ? (
        <p className="max-w-[16rem] text-xs text-muted-foreground sm:text-right">
          You can send a reminder once a dose is past its time and not taken.
        </p>
      ) : null}
    </div>
  );
}
