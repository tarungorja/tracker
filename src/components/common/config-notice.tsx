import { Database, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

/** Shown when `MONGODB_URI` is missing so pages degrade gracefully. */
export function ConfigNotice() {
  return (
    <Card className="mx-auto mt-8 max-w-xl p-8 text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Database className="size-7" />
      </div>
      <h2 className="text-lg font-semibold">Connect your database</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        MedTrack needs a MongoDB connection to store your schedule and history.
        Add a <code className="rounded bg-[var(--muted)] px-1.5 py-0.5">MONGODB_URI</code>{" "}
        to your <code className="rounded bg-[var(--muted)] px-1.5 py-0.5">.env.local</code>{" "}
        file, then run the seed script.
      </p>
      <div className="mt-5 rounded-2xl bg-[var(--muted)] p-4 text-left font-mono text-xs leading-relaxed text-muted-foreground">
        <div>MONGODB_URI=mongodb://localhost:27017/medtrack</div>
        <div className="mt-2 flex items-center gap-2 text-foreground">
          <ArrowRight className="size-3.5" /> npm run seed
        </div>
      </div>
    </Card>
  );
}
