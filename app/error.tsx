"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md text-center">
        <CardContent className="flex flex-col items-center gap-4 p-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/12 text-destructive">
            <AlertOctagon className="h-7 w-7" />
          </span>
          <div>
            <h2 className="text-lg font-bold">Something went wrong</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We couldn&apos;t load this page. This usually means the database is
              unreachable or the environment isn&apos;t configured yet.
            </p>
          </div>
          <Button onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
