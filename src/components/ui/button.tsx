import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] select-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:brightness-110",
        secondary: "bg-muted text-foreground hover:bg-[var(--accent)]",
        outline:
          "border border-[var(--input)] bg-transparent hover:bg-[var(--muted)]",
        ghost: "hover:bg-[var(--muted)]",
        success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm",
        warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-sm",
        danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-sm",
        subtle:
          "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-foreground",
      },
      size: {
        default: "h-10 px-4 text-sm",
        sm: "h-9 px-3 text-[13px]",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
