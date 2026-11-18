import { notFound } from "next/navigation";

// The Wellness tracker is hidden for all users for now. The view and its API client are kept
// (components/wellness, lib/api/wellness.ts; data via getWellnessData in lib/api/server.ts)
// so it can be re-enabled: restore this page, the nav item and the dashboard section.
export default function WellnessPage() {
  notFound();
}
