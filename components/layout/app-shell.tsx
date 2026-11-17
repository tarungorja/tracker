import type { ReactNode } from "react";

import { AmbientBackground } from "@/components/layout/ambient-background";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail: string;
}) {
  return (
    <div className="relative flex min-h-screen">
      <AmbientBackground />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 sm:px-6 lg:pb-10">
          <Topbar userEmail={userEmail} />
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
