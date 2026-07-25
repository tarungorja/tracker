"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";

import { setDayNotes } from "@/actions/masturbation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export function NotesEditor({
  date,
  initialNotes,
}: {
  date: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = React.useState(initialNotes);
  const [pending, startTransition] = React.useTransition();
  const { toast } = useToast();

  const dirty = notes !== initialNotes;

  function save() {
    startTransition(async () => {
      const result = await setDayNotes({ notes, date });
      if (result.ok) {
        toast({ title: "Notes saved", variant: "success" });
      } else {
        toast({ title: "Couldn't save", description: result.error, variant: "error" });
      }
    });
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add a note for today (optional)…"
        className="min-h-[90px]"
        maxLength={1000}
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={save} disabled={pending || !dirty}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Save note
        </Button>
      </div>
    </div>
  );
}
