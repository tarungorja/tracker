import { Pill } from "lucide-react";

import { requireUser } from "@/lib/auth/session";
import { getMedicationsPageData } from "@/lib/data/medications";
import { PageHeader } from "@/components/common/page-header";
import {
  AddMedicationButton,
  MedicationsView,
} from "@/components/medications/medications-view";

export const dynamic = "force-dynamic";

export const metadata = { title: "Medications" };

export default async function MedicationsPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader
        title="Medications"
        description="Manage schedules and instructions."
        icon={Pill}
        action={<AddMedicationButton />}
      />
      <MedicationsView data={await getMedicationsPageData(user.id)} />
    </>
  );
}
