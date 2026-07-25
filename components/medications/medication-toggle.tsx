"use client";

import * as React from "react";

import { setMedicationEnabled } from "@/actions/medications";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export function MedicationToggle({
  id,
  enabled,
  name,
}: {
  id: string;
  enabled: boolean;
  name: string;
}) {
  const [on, setOn] = React.useState(enabled);
  const [pending, startTransition] = React.useTransition();
  const { toast } = useToast();

  function handleChange(next: boolean) {
    setOn(next);
    startTransition(async () => {
      const result = await setMedicationEnabled({ id, enabled: next });
      if (!result.ok) {
        setOn(!next);
        toast({ title: "Couldn't update", description: result.error, variant: "error" });
      } else {
        toast({
          title: next ? `${name} reminders on` : `${name} reminders off`,
          variant: "info",
        });
      }
    });
  }

  return (
    <Switch
      checked={on}
      onCheckedChange={handleChange}
      disabled={pending}
      aria-label={`Toggle reminders for ${name}`}
    />
  );
}
