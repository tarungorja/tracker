import { Users } from "lucide-react";

import { getCaregivers, getPatients } from "@/lib/api/server";
import { PageHeader } from "@/components/common/page-header";
import { FamilyView } from "@/components/family/family-view";

export const metadata = { title: "Family" };
export const dynamic = "force-dynamic";

export default async function FamilyPage() {
  const [patients, caregivers] = await Promise.all([getPatients(), getCaregivers()]);
  return (
    <>
      <PageHeader
        title="Family"
        description="Follow a family member's medications, or let someone follow yours."
        icon={Users}
      />
      <FamilyView patients={patients} caregivers={caregivers} />
    </>
  );
}
