import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";

import { APP_NAME, CONTACT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY } from "@/lib/constants";
import { getCurrentUser } from "@/lib/api/server";
import { AmbientBackground } from "@/components/layout/ambient-background";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <AmbientBackground />
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-health-violet text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-base font-bold">{APP_NAME}</span>
        </div>
        {children}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to how we handle your data, described in our{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            privacy policy
          </Link>
          .
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Need help?{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-foreground">
            {CONTACT_EMAIL}
          </a>{" "}
          or{" "}
          <a href={`tel:${SUPPORT_PHONE}`} className="underline hover:text-foreground">
            {SUPPORT_PHONE_DISPLAY}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
