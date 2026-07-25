import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { PwaRegister } from "@/components/providers/pwa-register";
import { Toaster } from "@/components/ui/toast";
import { AmbientBackground } from "@/components/layout/ambient-background";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Topbar } from "@/components/layout/topbar";
import { getSettings } from "@/lib/data/settings";
import { DEFAULT_TIMEZONE } from "@/lib/time";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MedTrack — Medication Tracker",
    template: "%s · MedTrack",
  },
  description:
    "A personal medication reminder & habit tracker with history, analytics and email reminders.",
  applicationName: "MedTrack",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MedTrack",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#08080b" },
  ],
};

async function resolveTimezone(): Promise<string> {
  try {
    const settings = await getSettings();
    return settings.timezone || DEFAULT_TIMEZONE;
  } catch {
    // DB not configured yet — fall back so the shell still renders.
    return DEFAULT_TIMEZONE;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const timeZone = await resolveTimezone();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AmbientBackground />
          <Sidebar />
          <div className="lg:pl-64">
            <Topbar timeZone={timeZone} />
            <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12">
              {children}
            </main>
          </div>
          <MobileNav />
          <Toaster />
          <PwaRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
