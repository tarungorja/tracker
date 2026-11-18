"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";

import { signOut } from "@/lib/api/auth";
import { removePushToken } from "@/lib/api/push";
import { forgetAskedForPush, revokePushToken } from "@/lib/firebase/client";
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
      forgetAskedForPush(); // the next login is asked about notifications again
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
        asChild
        variant="ghost"
        size="icon"
        aria-label="Account and privacy"
        title="Account and privacy"
        className="rounded-full"
      >
        <Link href="/account">
          <UserRound className="h-5 w-5" />
        </Link>
      </Button>
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
