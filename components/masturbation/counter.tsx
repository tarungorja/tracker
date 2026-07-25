"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, RotateCcw } from "lucide-react";

import { decrementCount, incrementCount, resetCount } from "@/actions/masturbation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function Counter({
  date,
  initialCount,
}: {
  date: string;
  initialCount: number;
}) {
  const [count, setCount] = React.useState(initialCount);
  const [pending, startTransition] = React.useTransition();
  const { toast } = useToast();

  function run(
    optimistic: number,
    action: () => Promise<{ ok: boolean; count?: number; error?: string }>,
  ) {
    const previous = count;
    setCount(optimistic);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setCount(previous);
        toast({ title: "Couldn't update", description: result.error, variant: "error" });
      } else if (typeof result.count === "number") {
        setCount(result.count);
      }
    });
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 p-8">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Today
          </p>
          <div className="relative mt-2 flex h-24 items-center justify-center">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={count}
                initial={{ y: 20, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -20, opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 26 }}
                className="text-7xl font-bold tabular-nums text-health-rose"
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-2xl"
            disabled={pending || count === 0}
            onClick={() => run(Math.max(0, count - 1), () => decrementCount(date))}
            aria-label="Decrease count"
          >
            <Minus className="h-6 w-6" />
          </Button>

          <Button
            size="lg"
            className="h-14 rounded-2xl bg-health-rose px-8 text-lg hover:bg-health-rose/90"
            disabled={pending}
            onClick={() => run(count + 1, () => incrementCount(date))}
          >
            <Plus className="h-5 w-5" /> Add
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-2xl"
            disabled={pending || count === 0}
            onClick={() => {
              run(0, () => resetCount(date));
              toast({ title: "Count reset", variant: "info" });
            }}
            aria-label="Reset count"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
