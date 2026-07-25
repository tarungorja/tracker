import { Pill } from "lucide-react";

import { getMedicationsPageData } from "@/lib/data/medications";
import { PageHeader } from "@/components/common/page-header";
import {
  AddMedicationButton,
  MedicationsView,
} from "@/components/medications/medications-view";

export const dynamic = "force-dynamic";

export const metadata = { title: "Medications" };

export default async function MedicationsPage() {
  return (
    <>
      <PageHeader
        title="Medications"
        description="Manage schedules and instructions."
        icon={Pill}
        action={<AddMedicationButton />}
      />
      <MedicationsView data={await getMedicationsPageData()} />
    </>
  );
}
