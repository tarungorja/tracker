"use client";

import * as React from "react";
import { Save, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { saveMasturbationNote } from "@/lib/actions/masturbation";

export function WellnessNotesEditor({ initialNotes }: { initialNotes: string }) {
  const [notes, setNotes] = React.useState(initialNotes);
  const [saving, setSaving] = React.useState(false);

  // Re-sync when the server prop changes after a revalidation.
  const [synced, setSynced] = React.useState(initialNotes);
  if (synced !== initialNotes) {
    setSynced(initialNotes);
    setNotes(initialNotes);
  }

  async function save() {
    setSaving(true);
    const res = await saveMasturbationNote(notes);
    setSaving(false);
    if (res.ok) toast.success("Note saved");
    else toast.error(res.message ?? "Could not save");
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Reflections, triggers, mood… (private, just for you)"
        rows={3}
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save note
        </Button>
      </div>
    </div>
  );
}
