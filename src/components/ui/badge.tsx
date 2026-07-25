import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary ring-primary/20",
        neutral:
          "bg-[var(--muted)] text-[var(--muted-foreground)] ring-transparent",
        completed:
          "bg-emerald-500/10 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400",
        skipped:
          "bg-amber-500/10 text-amber-600 ring-amber-500/25 dark:text-amber-400",
        missed:
          "bg-rose-500/10 text-rose-600 ring-rose-500/25 dark:text-rose-400",
        pending:
          "bg-zinc-500/10 text-zinc-500 ring-zinc-500/20 dark:text-zinc-400",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
