import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";

import { getPatientOverview } from "@/lib/api/server";
import { PageHeader } from "@/components/common/page-header";
import { PatientOverviewView } from "@/components/family/patient-overview";

export const metadata = { title: "Family member" };
export const dynamic = "force-dynamic";

export default async function PatientPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  const data = await getPatientOverview(patientId);

  return (
    <>
      <Link
        href="/family"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Family
      </Link>
      <PageHeader
        title={data.patient.email}
        description="Read-only view. Updates every minute."
        icon={Eye}
      />
      <PatientOverviewView data={data} />
    </>
  );
}
