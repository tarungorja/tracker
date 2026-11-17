import { notFound } from "next/navigation";

// The Wellness tracker is hidden for all users for now. The view, data helpers and
// actions are kept (components/wellness, lib/data/wellness.ts, actions/wellness.ts)
// so it can be re-enabled: restore this page, the nav item and the dashboard section.
export default function WellnessPage() {
  notFound();
}
