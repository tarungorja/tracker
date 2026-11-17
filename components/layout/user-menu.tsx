"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { signOut } from "@/actions/auth";
import { removePushToken } from "@/actions/push";
import { revokePushToken } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";

export function UserMenu({ email }: { email: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function handleSignOut() {
    startTransition(async () => {
      // Stop reminders for this user on this browser (needs the session, so do it first).
      try {
        const token = await revokePushToken();
        if (token) await removePushToken({ token });
      } catch {}
      await signOut();
      router.replace("/signin");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1">
      <span className="hidden max-w-[10rem] truncate text-xs text-muted-foreground md:inline">
        {email}
      </span>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Sign out"
        title="Sign out"
        disabled={pending}
        onClick={handleSignOut}
        className="rounded-full"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
}
