import { Pencil } from "lucide-react";

import type { MedicationWithHistory } from "@/lib/data/medications";
import { pluralize } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DoseItem } from "@/components/doses/dose-item";
import { HistoryStrip } from "@/components/medications/history-strip";
import { Instructions } from "@/components/medications/instructions";
import { MedicationFormDialog } from "@/components/medications/medication-form-dialog";
import { MedicationToggle } from "@/components/medications/medication-toggle";

interface MedicationCardProps {
  medication: MedicationWithHistory;
  todayKey: string;
  nowMinutes: number;
}

export function MedicationCard({ medication, todayKey, nowMinutes }: MedicationCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold">{medication.name}</h3>
            {medication.description ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{medication.description}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <MedicationFormDialog
              medication={medication}
              trigger={
                <Button variant="ghost" size="icon-sm" aria-label="Edit medication">
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
            <MedicationToggle
              id={medication.id}
              enabled={medication.enabled}
              name={medication.name}
            />
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {medication.scheduleTimes.map((time) => (
            <Badge key={time} variant="secondary">
              {time}
            </Badge>
          ))}
          {!medication.enabled ? <Badge variant="warning">Paused</Badge> : null}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {/* Today's doses */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Today · {medication.completedToday}/{medication.totalToday} done
          </p>
          {medication.todayDoses.map((dose) => (
            <DoseItem
              key={dose.time}
              medicationName={medication.name}
              scheduledTime={dose.time}
              scheduledMinutes={dose.minutes}
              date={todayKey}
              initialCompleted={dose.completed}
              nowMinutes={nowMinutes}
              showMedName={false}
            />
          ))}
        </div>

        <Separator />

        {/* Instructions */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Instructions
          </p>
          <Instructions text={medication.instructions} />
        </div>

        {/* History */}
        <div className="mt-auto">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Last {pluralize(medication.history.length, "day")}
          </p>
          <HistoryStrip history={medication.history} todayKey={todayKey} />
        </div>
      </CardContent>
    </Card>
  );
}
