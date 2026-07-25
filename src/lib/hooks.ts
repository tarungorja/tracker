"use client";

import { useSyncExternalStore } from "react";

/**
 * Hydration-safe "are we on the client yet?" flag, without a setState-in-effect.
 * Returns false during SSR / first server render, true on the client.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

// ---- Shared ticking clock (one interval for all consumers) ----
let now = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (listeners.size === 1) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      for (const l of listeners) l();
    }, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/**
 * Current time (ms) that ticks every second, shared across all clocks.
 * Returns `null` during SSR so the caller can render a stable placeholder.
 */
export function useNow(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => now || Date.now(),
    () => null,
  );
}
