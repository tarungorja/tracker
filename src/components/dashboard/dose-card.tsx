"use client";

import * as React from "react";
import {
  Check,
  SkipForward,
  Undo2,
  Clock,
  StickyNote,
  ChevronDown,
  TriangleAlert,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  completeDose,
  skipDose,
  undoDose,
  saveDoseNote,
} from "@/lib/actions/dose";
import { COLOR_META, STATUS_META } from "@/lib/constants";
import { formatTime12 } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { DoseStatus, TimelineDose } from "@/types";

function localTime(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function DoseCard({
  dose,
  dateKey,
}: {
  dose: TimelineDose;
  dateKey?: string;
}) {
  const day = dateKey ?? dose.dateKey;
  const color = COLOR_META[dose.color];

  const [status, setStatus] = React.useState<DoseStatus>(dose.status);
  const [pending, startTransition] = React.useTransition();
  const [showDetails, setShowDetails] = React.useState(false);
  const [showNotes, setShowNotes] = React.useState(false);
  const [note, setNote] = React.useState(dose.notes);
  const [savingNote, setSavingNote] = React.useState(false);

  // Re-sync local optimistic state when the server props change after a
  // revalidation (React-endorsed "adjust state during render" pattern).
  const [syncedStatus, setSyncedStatus] = React.useState(dose.status);
  if (syncedStatus !== dose.status) {
    setSyncedStatus(dose.status);
    setStatus(dose.status);
  }
  const [syncedNote, setSyncedNote] = React.useState(dose.notes);
  if (syncedNote !== dose.notes) {
    setSyncedNote(dose.notes);
    setNote(dose.notes);
  }

  const statusMeta = STATUS_META[status];

  function apply(
    action: (doseKey: string, dateKey?: string) => Promise<{ ok: boolean; message?: string }>,
    optimistic: DoseStatus,
    successMsg: string,
  ) {
    const prev = status;
    setStatus(optimistic);
    startTransition(async () => {
      const res = await action(dose.doseKey, day);
      if (!res.ok) {
        setStatus(prev);
        toast.error(res.message ?? "Something went wrong");
      } else {
        toast.success(successMsg);
      }
    });
  }

  async function persistNote() {
    setSavingNote(true);
    const res = await saveDoseNote(dose.doseKey, note, day);
    setSavingNote(false);
    if (res.ok) {
      toast.success("Note saved");
      setShowNotes(false);
    } else {
      toast.error(res.message ?? "Could not save note");
    }
  }

  const done = status === "completed";
  const skipped = status === "skipped";
  const resolved = done || skipped;

  return (
    <div
      className={cn(
        "card-surface rounded-3xl p-4 transition-all sm:p-5",
        pending && "opacity-70",
      )}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-2xl text-2xl ring-1",
            color.soft,
            color.ring,
          )}
        >
          <span aria-hidden>{dose.emoji}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-semibold leading-tight">{dose.medicationName}</h3>
            {dose.doseLabel ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-medium",
                  color.soft,
                  color.text,
                )}
              >
                {dose.doseLabel}
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-3.5" />
            <span className="tabular-nums">{formatTime12(dose.scheduledTime)}</span>
            <span aria-hidden>·</span>
            <span className={cn("inline-flex items-center gap-1.5", statusMeta.text)}>
              <span className={cn("size-1.5 rounded-full", statusMeta.dot)} />
              {statusMeta.label}
              {done && dose.completedAt ? ` · ${localTime(dose.completedAt)}` : ""}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          aria-label="Toggle instructions"
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-[var(--muted)] hover:text-foreground"
        >
          <ChevronDown
            className={cn("size-4 transition-transform", showDetails && "rotate-180")}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        {!resolved ? (
          <>
            <Button
              size="sm"
              variant="success"
              disabled={pending}
              onClick={() => apply(completeDose, "completed", "Marked complete")}
            >
              <Check className="size-4" />
              Complete
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => apply(skipDose, "skipped", "Marked skipped")}
            >
              <SkipForward className="size-4" />
              Skip
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="subtle"
            disabled={pending}
            onClick={() => apply(undoDose, "pending", "Undone")}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Undo2 className="size-4" />
            )}
            Undo
          </Button>
        )}

        <button
          type="button"
          onClick={() => setShowNotes((v) => !v)}
          className={cn(
            "ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors",
            note
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <StickyNote className="size-3.5" />
          {note ? "Note added" : "Add note"}
        </button>
      </div>

      {/* Notes editor */}
      {showNotes ? (
        <div className="mt-3 space-y-2">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How did it go? Any side effects?"
            rows={2}
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={persistNote} disabled={savingNote}>
              {savingNote ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save note
            </Button>
          </div>
        </div>
      ) : null}

      {/* Details */}
      {showDetails ? (
        <div className="mt-3.5 space-y-3 border-t border-[var(--border)] pt-3.5">
          {dose.instructions.length ? (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Instructions
              </p>
              <ul className="space-y-1">
                {dose.instructions.map((line, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-foreground/90"
                  >
                    <span
                      className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", color.solid)}
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {dose.warnings.length ? (
            <div className="rounded-2xl bg-rose-500/8 p-3 ring-1 ring-rose-500/20">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-rose-500">
                <TriangleAlert className="size-3.5" />
                Stop medication if
              </p>
              <div className="flex flex-wrap gap-1.5">
                {dose.warnings.map((w, i) => (
                  <Badge key={i} variant="missed">
                    {w}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          {note ? (
            <p className="rounded-2xl bg-[var(--muted)] p-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Note: </span>
              {note}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
