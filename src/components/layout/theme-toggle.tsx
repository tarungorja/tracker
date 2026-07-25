"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMounted } from "@/lib/hooks";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-foreground transition-colors hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        className,
      )}
    >
      {mounted ? (
        isDark ? (
          <Moon className="size-[18px]" />
        ) : (
          <Sun className="size-[18px]" />
        )
      ) : (
        <span className="size-[18px]" />
      )}
    </button>
  );
}
