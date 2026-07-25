"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface BarDatum {
  label: string;
  value: number;
  /** Optional secondary label shown under the primary (e.g. weekday). */
  caption?: string;
}

interface BarChartProps {
  data: BarDatum[];
  height?: number;
  barClassName?: string;
  className?: string;
  /** Show the label under every Nth bar to avoid crowding. */
  labelEvery?: number;
  /** Format the value shown on hover / above a bar. */
  formatValue?: (value: number) => string;
}

export function BarChart({
  data,
  height = 160,
  barClassName,
  className,
  labelEvery = 1,
  formatValue = (v) => String(v),
}: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => {
          const ratio = d.value / max;
          return (
            <div key={i} className="group flex min-w-0 flex-1 flex-col items-center justify-end">
              <span className="mb-1 text-[10px] font-semibold tabular-nums text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                {formatValue(d.value)}
              </span>
              <motion.div
                className={cn(
                  "w-full rounded-t-md bg-primary/80 group-hover:bg-primary",
                  barClassName,
                )}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(ratio * 100, d.value > 0 ? 4 : 1.5)}%` }}
                transition={{ duration: 0.6, delay: i * 0.015, ease: "easeOut" }}
                title={`${d.label}: ${formatValue(d.value)}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="min-w-0 flex-1 text-center">
            {i % labelEvery === 0 ? (
              <span className="block truncate text-[10px] text-muted-foreground">
                {d.caption ?? d.label}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
