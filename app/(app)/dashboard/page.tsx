import { Activity } from "lucide-react";

import { getDashboardData, getPatientOverview, getPatients } from "@/lib/api/server";
import { PageHeader } from "@/components/common/page-header";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import type { FollowedMember } from "@/components/dashboard/family-card";

export const dynamic = "force-dynamic";

const MAX_FOLLOWED_ON_DASHBOARD = 4;

/** Next.js implements redirect() by throwing; those must reach Next, not be swallowed below. */
function isRedirect(error: unknown): boolean {
  const digest = (error as { digest?: unknown } | null)?.digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

/** The family card is optional: a failure here must never break the dashboard. */
async function followedMembers(): Promise<FollowedMember[]> {
  try {
    const people = (await getPatients()).slice(0, MAX_FOLLOWED_ON_DASHBOARD);
    return await Promise.all(
      people.map(async (user) => {
        try {
          return { user, overview: await getPatientOverview(user.id) };
        } catch (error) {
          if (isRedirect(error)) throw error;
          return { user, overview: null };
        }
      }),
    );
  } catch (error) {
    if (isRedirect(error)) throw error;
    return [];
  }
}

export default async function DashboardPage() {
  const [data, following] = await Promise.all([getDashboardData(), followedMembers()]);
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your medication routine at a glance."
        icon={Activity}
      />
      <DashboardView data={data} following={following} />
    </>
  );
}
