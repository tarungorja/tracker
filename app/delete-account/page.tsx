import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  APP_NAME,
  CONTACT_EMAIL,
  PRIVACY_UPDATED,
  SUPPORT_PHONE,
  SUPPORT_PHONE_DISPLAY,
} from "@/lib/constants";

export const metadata = { title: "Delete your account" };

// Public on purpose (see middleware.ts): this is the page to give Google Play as the "delete your
// account" web resource, so it must be readable without signing in.

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function Strong({ children }: { children: ReactNode }) {
  return <strong className="text-foreground">{children}</strong>;
}

export default function DeleteAccountPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">Delete your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Last updated {PRIVACY_UPDATED}</p>

      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        You can permanently delete your {APP_NAME} account and everything stored with it, in the
        Android app or on the website, at any time.
      </p>

      <Section title="If you can sign in">
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>
            Open the <Strong>Android app</Strong> or the{" "}
            <Link href="/signin" className="font-medium text-primary hover:underline">
              website
            </Link>{" "}
            and sign in with your email.
          </li>
          <li>
            Open <Strong>Account</Strong> (the person icon at the top right in the app).
          </li>
          <li>
            Choose <Strong>Delete account</Strong>, type <Strong>DELETE</Strong> when asked, and
            confirm.
          </li>
        </ol>
        <p>The deletion happens immediately and cannot be undone.</p>
      </Section>

      <Section title="If you cannot sign in">
        <p>
          Send an email <Strong>from the address your account uses</Strong> to{" "}
          <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Delete my account")}`} className="font-medium text-primary hover:underline">
            {CONTACT_EMAIL}
          </a>{" "}
          with the subject &ldquo;Delete my account&rdquo;, or call{" "}
          <a href={`tel:${SUPPORT_PHONE}`} className="font-medium text-primary hover:underline">
            {SUPPORT_PHONE_DISPLAY}
          </a>{" "}
          and say which email address the account uses. We confirm the request comes from the
          owner of that address, then delete the account and reply to say it is done.
        </p>
      </Section>

      <Section title="What is deleted">
        <p>
          Your email address, medications and schedules, dose history, any wellness counts and
          notes, notification devices, sign-in sessions and pending sign-in codes are erased from
          our database permanently. Reminders scheduled on your phone by the Android app are
          cancelled when you delete the account from that phone.
        </p>
      </Section>

      <Section title="What may remain">
        <p>
          The email provider (Brevo) and hosting provider (Vercel) may keep routine delivery and
          server logs for a short period under their own policies. See the{" "}
          <Link href="/privacy" className="font-medium text-primary hover:underline">
            privacy policy
          </Link>{" "}
          for who handles what.
        </p>
      </Section>
    </main>
  );
}
