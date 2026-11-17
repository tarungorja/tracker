"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X } from "lucide-react";

import { ALL_DAYS, WEEKDAY_SHORT, labelToTimeInput } from "@/lib/time";
import { cn } from "@/lib/utils";

import type { MedicationView } from "@/models";
import { deleteMedication, upsertMedication } from "@/actions/medications";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface MedicationFormDialogProps {
  medication?: MedicationView;
  trigger: React.ReactNode;
}

function initialTimes(medication?: MedicationView): string[] {
  const times = (medication?.scheduleTimes ?? []).map(labelToTimeInput).filter(Boolean);
  return times.length > 0 ? times : ["08:00"];
}

export function MedicationFormDialog({ medication, trigger }: MedicationFormDialogProps) {
  const isEdit = Boolean(medication);
  const router = useRouter();
  const { toast } = useToast();

  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const [name, setName] = React.useState(medication?.name ?? "");
  const [description, setDescription] = React.useState(medication?.description ?? "");
  const [instructions, setInstructions] = React.useState(medication?.instructions ?? "");
  const [times, setTimes] = React.useState<string[]>(initialTimes(medication));
  const [days, setDays] = React.useState<number[]>(
    medication?.daysOfWeek.length ? medication.daysOfWeek : [...ALL_DAYS],
  );

  function reset() {
    setName(medication?.name ?? "");
    setDescription(medication?.description ?? "");
    setInstructions(medication?.instructions ?? "");
    setTimes(initialTimes(medication));
    setDays(medication?.daysOfWeek.length ? medication.daysOfWeek : [...ALL_DAYS]);
  }

  function toggleDay(day: number) {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function updateTime(index: number, value: string) {
    setTimes((prev) => prev.map((t, i) => (i === index ? value : t)));
  }

  function submit() {
    const cleanTimes = times.map((t) => t.trim()).filter(Boolean);
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "error" });
      return;
    }
    if (cleanTimes.length === 0) {
      toast({ title: "Add at least one time", variant: "error" });
      return;
    }
    if (days.length === 0) {
      toast({ title: "Pick at least one day", variant: "error" });
      return;
    }

    startTransition(async () => {
      const result = await upsertMedication({
        id: medication?.id,
        name: name.trim(),
        description: description.trim(),
        instructions,
        scheduleTimes: cleanTimes,
        daysOfWeek: days,
      });
      if (result.ok) {
        toast({ title: isEdit ? "Medication updated" : "Medication added", variant: "success" });
        setOpen(false);
        router.refresh();
      } else {
        toast({ title: "Couldn't save", description: result.error, variant: "error" });
      }
    });
  }

  function remove() {
    if (!medication) return;
    startTransition(async () => {
      const result = await deleteMedication({ id: medication.id });
      if (result.ok) {
        toast({ title: "Medication removed", variant: "info" });
        setOpen(false);
        router.refresh();
      } else {
        toast({ title: "Couldn't delete", description: result.error, variant: "error" });
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit medication" : "Add medication"}</DialogTitle>
          <DialogDescription>
            Pick the times and weekdays you take this medication. Times use IST.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="med-name">Name</Label>
            <Input
              id="med-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Biotin Hair Gummies"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="med-desc">Description</Label>
            <Input
              id="med-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary (optional)"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Schedule times</Label>
            <div className="space-y-2">
              {times.map((time, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => updateTime(i, e.target.value)}
                    aria-label={`Time ${i + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setTimes((prev) => prev.filter((_, idx) => idx !== i))}
                    disabled={times.length === 1}
                    aria-label="Remove time"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTimes((prev) => [...prev, "08:00"])}
              >
                <Plus className="h-4 w-4" /> Add time
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Days of the week</Label>
              <button
                type="button"
                onClick={() => setDays(days.length === 7 ? [] : [...ALL_DAYS])}
                className="text-xs font-medium text-primary hover:underline"
              >
                {days.length === 7 ? "Clear" : "Every day"}
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {ALL_DAYS.map((day) => {
                const selected = days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "h-9 rounded-xl border text-xs font-semibold transition-colors",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background/60 text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    {WEEKDAY_SHORT[day]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="med-instructions">Instructions</Label>
            <Textarea
              id="med-instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="How and when to take this medication…"
              className="min-h-[120px]"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          {isEdit ? (
            <Button
              type="button"
              variant="ghost"
              onClick={remove}
              disabled={pending}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="button" onClick={submit} disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save changes" : "Add medication"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
