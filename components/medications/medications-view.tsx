import { Plus } from "lucide-react";

import type { MedicationsPageData } from "@/lib/data/medications";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/common/reveal";
import { MedicationCard } from "@/components/medications/medication-card";
import { MedicationFormDialog } from "@/components/medications/medication-form-dialog";

export function MedicationsView({ data }: { data: MedicationsPageData }) {
  return (
    <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
      {data.medications.map((med, i) => (
        <Reveal key={med.id} delay={i * 0.05}>
          <MedicationCard
            medication={med}
            todayKey={data.todayKey}
            nowMinutes={data.nowMinutes}
          />
        </Reveal>
      ))}
    </div>
  );
}

export function AddMedicationButton() {
  return (
    <MedicationFormDialog
      trigger={
        <Button>
          <Plus className="h-4 w-4" /> Add
        </Button>
      }
    />
  );
}
