import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth/session";
import { AmbientBackground } from "@/components/layout/ambient-background";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  if (await getCurrentUser()) redirect("/");

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
      </div>
    </div>
  );
}
