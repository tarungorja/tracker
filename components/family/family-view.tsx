import Link from "next/link";
import { ArrowRight, Eye, ShieldCheck, Users } from "lucide-react";

import type { LinkedUser } from "@/lib/api/types";
import { formatWhen } from "@/lib/time";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/common/reveal";
import { ConnectForm } from "@/components/family/connect-form";
import { InviteCard } from "@/components/family/invite-card";
import { UnlinkButton } from "@/components/family/unlink-button";

interface FamilyViewProps {
  /** Accounts I follow (I'm the son). */
  patients: LinkedUser[];
  /** People who follow me (I'm the father). */
  caregivers: LinkedUser[];
}

export function FamilyView({ patients, caregivers }: FamilyViewProps) {
  return (
    <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
      <Reveal>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              Following
            </CardTitle>
            <CardDescription>
              See whether a family member took their doses and changed their medications, and
              remind them when they miss one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {patients.length === 0 ? (
              <p className="text-sm text-muted-foreground">You aren&apos;t following anyone yet.</p>
            ) : (
              <ul className="space-y-2">
                {patients.map((person) => (
                  <li
                    key={person.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/40 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{person.email}</div>
                      <div className="text-xs text-muted-foreground">
                        Connected {formatWhen(person.linkedAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <UnlinkButton kind="following" userId={person.id} email={person.email} />
                      <Button asChild size="sm">
                        <Link href={`/family/${person.id}`}>
                          View <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <ConnectForm />
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Followed by
            </CardTitle>
            <CardDescription>
              Let a family member keep an eye on your medications. They can see your doses and
              medication list, but can&apos;t change anything. You can remove their access any time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {caregivers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nobody follows your account.</p>
            ) : (
              <ul className="space-y-2">
                {caregivers.map((person) => (
                  <li
                    key={person.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/40 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 truncate text-sm font-medium">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-health-green" />
                        {person.email}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Since {formatWhen(person.linkedAt)}
                      </div>
                    </div>
                    <UnlinkButton kind="follower" userId={person.id} email={person.email} />
                  </li>
                ))}
              </ul>
            )}
            <InviteCard />
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
