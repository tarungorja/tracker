import { AlertTriangle } from "lucide-react";

import { isConfigured } from "@/lib/env";
import { Card } from "@/components/ui/card";

/**
 * Renders a friendly setup notice when required environment variables are
 * missing, so the app degrades gracefully instead of throwing on first load.
 * Returns null once configured.
 */
export function ConfigNotice() {
  if (isConfigured()) return null;

  return (
    <Card className="mb-6 border-health-amber/30 bg-health-amber/5">
      <div className="flex items-start gap-3 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-health-amber" />
        <div className="text-sm">
          <p className="font-semibold text-foreground">Finish your setup</p>
          <p className="mt-1 text-muted-foreground">
            Add <code className="rounded bg-secondary px-1 py-0.5">MONGODB_URI</code> to your
            environment (see <code className="rounded bg-secondary px-1 py-0.5">.env.example</code>)
            to enable data.
          </p>
        </div>
      </div>
    </Card>
  );
}
