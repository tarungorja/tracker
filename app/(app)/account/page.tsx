import Link from "next/link";
import { ShieldCheck, UserRound } from "lucide-react";

import { requireUser } from "@/lib/api/server";
import { DeleteAccountDialog } from "@/components/account/delete-account-dialog";
import { HelpCard } from "@/components/account/help-card";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader title="Account" description="Your sign-in and your data." icon={UserRound} />

      <div className="flex max-w-2xl flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Signed in as</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <ShieldCheck className="h-4 w-4" /> How your data is used (privacy policy)
            </Link>
          </CardContent>
        </Card>

        <HelpCard />

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Delete account</CardTitle>
            <CardDescription>
              Permanently erase your account and every medication, dose log and note. This cannot
              be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteAccountDialog />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
