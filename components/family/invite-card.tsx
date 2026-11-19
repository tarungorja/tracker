"use client";

import * as React from "react";
import { Check, Copy, KeyRound, Loader2 } from "lucide-react";

import { createInvite } from "@/lib/api/family";
import type { InviteView } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/** The person being followed (the father) creates a one-time code and shares it. */
export function InviteCard() {
  const { toast } = useToast();
  const [invite, setInvite] = React.useState<InviteView | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  function generate() {
    startTransition(async () => {
      const result = await createInvite();
      if (result.ok) {
        setInvite({ code: result.code, expiresAt: result.expiresAt });
        setCopied(false);
      } else {
        toast({ title: "Couldn't create a code", description: result.error, variant: "error" });
      }
    });
  }

  async function copy() {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Couldn't copy", description: "Select the code and copy it by hand.", variant: "info" });
    }
  }

  return (
    <div className="space-y-3">
      {invite ? (
        <div className="rounded-2xl bg-secondary/50 p-4 text-center">
          <div
            className="select-all font-mono text-3xl font-bold tracking-[0.25em] tabular-nums"
            aria-label={`Invite code ${invite.code.split("").join(" ")}`}
          >
            {invite.code}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Works once and expires in 24 hours. Give it to the family member who should follow your
            medications. Creating a new code cancels this one.
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={copy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy code"}
          </Button>
        </div>
      ) : null}

      <Button onClick={generate} disabled={pending} variant={invite ? "ghost" : "default"}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        {invite ? "Create a new code" : "Create invite code"}
      </Button>
    </div>
  );
}
