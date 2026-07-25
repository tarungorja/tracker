import { Pill } from "lucide-react";

import { isConfigured } from "@/lib/env";
import { getMedicationsPageData } from "@/lib/data/medications";
import { ConfigNotice } from "@/components/common/config-notice";
import { PageHeader } from "@/components/common/page-header";
import {
  AddMedicationButton,
  MedicationsView,
} from "@/components/medications/medications-view";

export const dynamic = "force-dynamic";

export const metadata = { title: "Medications" };

export default async function MedicationsPage() {
  const configured = isConfigured();

  return (
    <>
      <PageHeader
        title="Medications"
        description="Manage schedules, instructions and reminders."
        icon={Pill}
        action={configured ? <AddMedicationButton /> : undefined}
      />
      <ConfigNotice />
      {configured ? <MedicationsView data={await getMedicationsPageData()} /> : null}
    </>
  );
}
