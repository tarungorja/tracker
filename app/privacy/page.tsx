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

export const metadata = { title: "Privacy policy" };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function List({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-1.5 pl-5">{children}</ul>;
}

function Strong({ children }: { children: ReactNode }) {
  return <strong className="text-foreground">{children}</strong>;
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">Privacy policy</h1>
      <p className="mt-1 text-sm text-muted-foreground">Last updated {PRIVACY_UPDATED}</p>

      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        {APP_NAME} helps you track medications and daily wellness. Some of what you
        enter is health-related, so this page explains plainly what we store, why, who handles it,
        and how you can remove it.
      </p>

      <Section title="What we collect">
        <List>
          <li>
            <Strong>Your email address</Strong>, to create your account and send sign-in codes.
          </li>
          <li>
            <Strong>What you enter:</Strong> medication names, descriptions, instructions and
            schedules; which doses you marked as taken and when; your daily wellness counts and
            notes.
          </li>
          <li>
            <Strong>Reminder devices (website):</Strong> if you turn on reminders in a browser, a
            notification token for that browser and its user-agent string. The Android app does
            not register a notification token (see &ldquo;Android app&rdquo; below).
          </li>
          <li>
            <Strong>Family connections:</Strong> if you share an invite code, a hashed one-time
            code (kept up to 24 hours) and, once someone connects, a link between the two accounts
            and the time of the last reminder they sent you.
          </li>
          <li>
            <Strong>A log of medication changes:</Strong> when you add, edit, pause or remove a
            medication (name and time only), kept for 30 days.
          </li>
          <li>
            <Strong>Sign-in data:</Strong> a hashed one-time code (kept for 10 minutes) and a
            hashed session token for each signed-in device.
          </li>
        </List>
        <p>We do not use advertising or analytics trackers, and we do not sell your data.</p>
      </Section>

      <Section title="Why we use it">
        <p>
          Only to run the app: sign you in, show your schedule, history and statistics, and send
          the dose reminders you asked for. We do not use your data for anything else.
        </p>
      </Section>

      <Section title="Sharing with family">
        <p>
          Nothing is shared unless you create an invite code and give it to someone. Anyone who
          connects with your code can see, read-only, your doses for today and past days, your
          active medications, and the log of medication changes, and can send you a reminder when
          a dose was missed. They cannot change anything. You can remove their access at any time
          on the Family page; deleting your account removes every connection.
        </p>
      </Section>

      <Section title="Who handles it">
        <p>These services process data on our behalf:</p>
        <List>
          <li>
            <Strong>MongoDB Atlas</Strong>: stores your account and data.
          </li>
          <li>
            <Strong>Vercel</Strong>: hosts the website and the service&apos;s API, so your
            requests pass through it.
          </li>
          <li>
            <Strong>Brevo</Strong>: delivers the sign-in emails (receives your email address and
            the one-time code in the message).
          </li>
          <li>
            <Strong>Google Firebase Cloud Messaging</Strong>: delivers browser notifications on
            the website only (receives your notification token and the reminder text, for example
            the medication name). The Android app does not use it.
          </li>
        </List>
        <p>
          These providers may process data in other countries. We share data with no one else
          unless the law requires it.
        </p>
      </Section>

      <Section title="Cookies and local storage">
        <p>
          One essential cookie keeps you signed in (HttpOnly, up to 30 days, removed when you
          sign out). Your browser&apos;s local storage holds your theme and reminder preferences.
          There are no tracking cookies.
        </p>
      </Section>

      <Section title="Android app">
        <List>
          <li>
            <Strong>Sign-in:</Strong> after you sign in, the app keeps your session token in the
            phone&apos;s secure storage (the Android Keystore). Signing out, deleting your account
            or uninstalling the app removes it.
          </li>
          <li>
            <Strong>Reminders happen on your phone.</Strong> The app schedules the next two weeks
            of dose reminders locally from your medication list, and no notification token is
            registered with any push service, so no reminder text leaves your phone. To do this it
            asks for Android&apos;s notification permission and for permission to schedule exact
            alarms so reminders arrive on time. Signing out or deleting your account cancels them.
          </li>
          <li>
            <Strong>On the phone:</Strong> your theme and reminder preferences. Android&apos;s
            cloud backup is switched off for the app.
          </li>
          <li>
            <Strong>No tracking:</Strong> no advertising, analytics or crash-reporting services
            are included in the app.
          </li>
        </List>
      </Section>

      <Section title="How long we keep it">
        <p>
          Your data is kept until you delete your account. Sign-in codes expire after 10 minutes,
          sessions after 30 days, and sent-reminder records after 3 days.
        </p>
      </Section>

      <Section title="Your choices and rights">
        <List>
          <li>
            <Strong>Delete everything:</Strong> open{" "}
            <Link href="/account" className="font-medium text-primary hover:underline">
              Account
            </Link>{" "}
            (on the website or in the app) and choose &ldquo;Delete account&rdquo;. Your email,
            medications, dose history, wellness data, notes, devices and sessions are erased from
            our database permanently and immediately. Steps, including what to do if you cannot
            sign in, are on the{" "}
            <Link href="/delete-account" className="font-medium text-primary hover:underline">
              delete-account page
            </Link>
            . Records that the email and hosting providers above keep in their own routine logs
            are governed by their policies.
          </li>
          <li>
            <Strong>Edit or remove entries:</Strong> you can change or delete any medication or
            note in the app at any time.
          </li>
          <li>
            <Strong>Turn off reminders:</Strong> use the bell icon, or block notifications in
            your browser settings.
          </li>
          <li>
            <Strong>Access, correction or a copy of your data:</Strong> contact us and we will
            respond within a reasonable time.
          </li>
        </List>
        <p>
          Depending on where you live (for example under India&apos;s Digital Personal Data
          Protection Act or the EU GDPR) you may have further rights, including to complain to
          your data-protection authority.
        </p>
      </Section>

      <Section title="Security">
        <p>
          Connections are encrypted, sign-in codes and session tokens are stored only as hashes,
          and the session cookie cannot be read by page scripts. No system is perfectly secure,
          so please sign out on shared devices.
        </p>
      </Section>

      <Section title="Not medical advice">
        <p>
          {APP_NAME} is a personal tracker. It does not give medical advice and is not a
          substitute for your doctor. It is not intended for children under 18.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions, help or requests about your data:{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-primary hover:underline"
          >
            {CONTACT_EMAIL}
          </a>{" "}
          or{" "}
          <a href={`tel:${SUPPORT_PHONE}`} className="font-medium text-primary hover:underline">
            {SUPPORT_PHONE_DISPLAY}
          </a>
          .
        </p>
        <p>We will update this page if our practices change and revise the date above.</p>
      </Section>
    </main>
  );
}
