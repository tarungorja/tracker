"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActivePath } from "@/components/layout/nav-config";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="glass-strong fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl px-2 py-2 lg:hidden">
      {NAV_ITEMS.map((item) => {
        const active = isActivePath(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="mobile-active"
                className="absolute inset-0 rounded-xl bg-primary/10"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <Icon className="relative z-10 h-5 w-5" />
            <span className="relative z-10">{item.short}</span>
          </Link>
        );
      })}
    </nav>
  );
}
