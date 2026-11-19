"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserMinus } from "lucide-react";

import { revokeCaregiver, stopFollowing } from "@/lib/api/family";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface UnlinkButtonProps {
  /** "following": I stop following someone. "follower": I remove someone who follows me. */
  kind: "following" | "follower";
  userId: string;
  email: string;
  /** Where to go afterwards (the detail page leaves for the list). */
  redirectTo?: string;
}

export function UnlinkButton({ kind, userId, email, redirectTo }: UnlinkButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = React.useTransition();

  const label = kind === "following" ? "Stop following" : "Remove access";
  const confirmText =
    kind === "following"
      ? `Stop following ${email}? You'll need a new code to connect again.`
      : `Remove ${email}'s access? They will no longer see your medications.`;

  function unlink() {
    if (!window.confirm(confirmText)) return;
    startTransition(async () => {
      const result =
        kind === "following" ? await stopFollowing(userId) : await revokeCaregiver(userId);
      if (!result.ok) {
        toast({ title: "Couldn't update", description: result.error, variant: "error" });
        return;
      }
      toast({
        title: kind === "following" ? "Stopped following" : "Access removed",
        variant: "info",
      });
      if (redirectTo) router.replace(redirectTo);
      router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={unlink}
      disabled={pending}
      className="text-muted-foreground hover:text-destructive"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
      {label}
    </Button>
  );
}
