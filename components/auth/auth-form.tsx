"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { requestOtp, verifyOtp } from "@/lib/api/auth";
import type { OtpPurpose } from "@/lib/api/types";
import { OTP_LENGTH } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const RESEND_SECONDS = 60;

const COPY: Record<
  OtpPurpose,
  { title: string; description: string; altText: string; altLabel: string; altHref: string }
> = {
  signup: {
    title: "Create your account",
    description: "Enter your email and we'll send you a verification code.",
    altText: "Already have an account?",
    altLabel: "Sign in",
    altHref: "/signin",
  },
  signin: {
    title: "Welcome back",
    description: "Enter your email and we'll send you a sign-in code.",
    altText: "New here?",
    altLabel: "Create an account",
    altHref: "/signup",
  },
};

export function AuthForm({ purpose }: { purpose: OtpPurpose }) {
  const router = useRouter();
  const { toast } = useToast();
  const copy = COPY[purpose];

  const [step, setStep] = React.useState<"email" | "code">("email");
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [cooldown, setCooldown] = React.useState(0);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  function sendCode(event?: React.FormEvent) {
    event?.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await requestOtp({ email, purpose });
      if (!result.ok) {
        setError(result.error ?? "Could not send the code.");
        return;
      }
      setStep("code");
      setCode("");
      setCooldown(RESEND_SECONDS);
      toast({
        title: "Code sent",
        description: `Check ${email.trim()} for your code.`,
        variant: "success",
      });
    });
  }

  function submitCode(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await verifyOtp({ email, purpose, code });
      if (!result.ok) {
        setError(result.error ?? "Could not verify the code.");
        return;
      }
      router.replace("/");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{step === "email" ? copy.title : "Enter your code"}</CardTitle>
        <CardDescription>
          {step === "email"
            ? copy.description
            : `We sent a ${OTP_LENGTH}-digit code to ${email.trim()}.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "email" ? (
          <form onSubmit={sendCode} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={pending || !email.trim()}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Send code
            </Button>
          </form>
        ) : (
          <form onSubmit={submitCode} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern={`\\d{${OTP_LENGTH}}`}
                maxLength={OTP_LENGTH}
                placeholder={"•".repeat(OTP_LENGTH)}
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
                className="h-12 text-center text-xl font-semibold tracking-[0.5em]"
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={pending || code.length !== OTP_LENGTH}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {purpose === "signup" ? "Verify & create account" : "Verify & sign in"}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setError(null);
                }}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Change email
              </button>
              <button
                type="button"
                onClick={() => sendCode()}
                disabled={pending || cooldown > 0}
                className="text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </div>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {copy.altText}{" "}
          <Link href={copy.altHref} className="font-medium text-primary hover:underline">
            {copy.altLabel}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
