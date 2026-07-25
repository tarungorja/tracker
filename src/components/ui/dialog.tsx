"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMounted } from "@/lib/hooks";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
}

/** Lightweight modal dialog with backdrop, Escape-to-close and scroll lock. */
export function Dialog({
  open,
  onOpenChange,
  children,
  className,
  title,
  description,
}: DialogProps) {
  const mounted = useMounted();

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onOpenChange]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-[var(--border)] bg-[var(--popover)] p-5 shadow-2xl animate-fade-in-up sm:max-w-lg sm:rounded-3xl sm:p-6",
          className,
        )}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-[var(--muted)] hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
        {title ? (
          <h2 className="pr-8 text-lg font-semibold tracking-tight">{title}</h2>
        ) : null}
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
        <div className={cn(title || description ? "mt-4" : "")}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
