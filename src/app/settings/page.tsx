import type { Metadata } from "next";
import { CheckCircle2, XCircle, Database, Mail, Clock } from "lucide-react";
import { PageIntro } from "@/components/common/page-intro";
import { ConfigNotice } from "@/components/common/config-notice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "@/components/settings/settings-form";
import { getSettings } from "@/lib/data/settings";
import { isDatabaseConfigured, isEmailConfigured } from "@/lib/env";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  if (!isDatabaseConfigured) return <ConfigNotice />;

  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-2xl">
      <PageIntro
        title="Settings"
        description="Manage reminders, summaries and appearance."
      />

      {/* System status */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">
            System status
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <StatusRow ok icon={Database} label="Database connected" />
          <StatusRow
            ok={isEmailConfigured}
            icon={Mail}
            label={isEmailConfigured ? "Email (Resend) ready" : "Email not configured"}
          />
        </CardContent>
      </Card>

      <SettingsForm defaultValues={settings} />

      {/* Cron help */}
      <Card className="mt-6 bg-[var(--muted)]/40">
        <CardContent className="p-5 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <Clock className="size-4 text-muted-foreground" />
            Automated reminders
          </p>
          <p className="mt-2 text-muted-foreground">
            Reminders and summaries are sent by a scheduled call to the cron
            endpoint. Point an external scheduler (Vercel Cron, cron-job.org,
            GitHub Actions…) at it every minute:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-[var(--card)] p-3 font-mono text-xs">
            GET /api/reminders
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusRow({
  ok,
  icon: Icon,
  label,
}: {
  ok: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] p-3">
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl",
          ok ? "bg-emerald-500/12 text-emerald-500" : "bg-amber-500/12 text-amber-500",
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {ok ? (
        <CheckCircle2 className="size-4 text-emerald-500" />
      ) : (
        <XCircle className="size-4 text-amber-500" />
      )}
    </div>
  );
}
