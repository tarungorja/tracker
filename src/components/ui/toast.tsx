"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";
interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

// --- Minimal external store so any component can call `toast()` ---
let items: ToastItem[] = [];
const listeners = new Set<() => void>();
let counter = 0;

function emit() {
  for (const l of listeners) l();
}

export function toast(message: string, type: ToastType = "success") {
  const id = ++counter;
  items = [...items, { id, message, type }];
  emit();
  setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    emit();
  }, 3200);
}

toast.success = (m: string) => toast(m, "success");
toast.error = (m: string) => toast(m, "error");
toast.info = (m: string) => toast(m, "info");

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function getSnapshot() {
  return items;
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="size-4 text-emerald-500" />,
  error: <AlertCircle className="size-4 text-rose-500" />,
  info: <Info className="size-4 text-sky-500" />,
};

export function Toaster() {
  const toasts = React.useSyncExternalStore(subscribe, getSnapshot, () => items);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-center gap-2.5 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-medium shadow-lg animate-fade-in-up glass",
          )}
        >
          {ICONS[t.type]}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
