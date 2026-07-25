import * as React from "react";
import { cn } from "@/lib/utils";

const fieldClasses =
  "flex h-11 w-full rounded-xl border border-[var(--input)] bg-[var(--card)] px-3.5 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input ref={ref} type={type} className={cn(fieldClasses, className)} {...props} />
));
Input.displayName = "Input";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(fieldClasses, "cursor-pointer appearance-none pr-8", className)}
    {...props}
  />
));
Select.displayName = "Select";

export { Input, Select, fieldClasses };
