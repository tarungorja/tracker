import Link from "next/link";
import { ArrowRight, Eye, Users } from "lucide-react";

import type { LinkedUser, PatientOverview } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RemindButton } from "@/components/family/remind-button";

export interface FollowedMember {
  user: LinkedUser;
  /** null when it couldn't be loaded: the person is still listed, without a Remind button. */
  overview: PatientOverview | null;
}

/** Dashboard shortcut: each followed person with View, plus Remind when a dose was missed. */
export function FamilyShortcutCard({ members }: { members: FollowedMember[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Family medications
        </CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link href="/family">
            {members.length === 0 ? "Set up" : "Manage"} <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Follow a family member to see their medications and whether they took their doses, or
            invite someone to follow yours.
          </p>
        ) : (
          <ul className="grid gap-2 lg:grid-cols-2">
            {members.map(({ user, overview }) => {
              const missedCount = overview?.missed.length ?? 0;
              return (
                <li
                  key={user.id}
                  className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-xl bg-secondary/40 px-3 py-2.5"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{user.email}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    {overview && missedCount > 0 ? (
                      <RemindButton
                        compact
                        patientId={user.id}
                        patientEmail={user.email}
                        missedCount={missedCount}
                        waitSeconds={overview.remindAvailableInSeconds}
                      />
                    ) : null}
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/family/${user.id}`}>
                        <Eye className="h-4 w-4" /> View
                      </Link>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
