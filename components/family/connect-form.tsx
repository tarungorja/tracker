"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Link2, Loader2 } from "lucide-react";

import { connectWithCode } from "@/lib/api/family";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

/** The follower (the son) enters the code he was given. */
export function ConnectForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await connectWithCode(code);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCode("");
      toast({
        title: "Connected",
        description: `You can now follow ${result.email}.`,
        variant: "success",
      });
      router.push(`/family/${result.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <Label htmlFor="invite-code">Invite code</Label>
      <div className="flex gap-2">
        <Input
          id="invite-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="K7QM-2XPD"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={20}
          className="font-mono tracking-widest"
        />
        <Button type="submit" disabled={pending || code.trim().length === 0}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
          Connect
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Ask the person you want to follow to create a code on their Family page.
        </p>
      )}
    </form>
  );
}
