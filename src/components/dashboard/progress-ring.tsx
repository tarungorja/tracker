"use client";

import * as React from "react";
import { cn, clamp } from "@/lib/utils";

interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  className?: string;
  children?: React.ReactNode;
  trackClassName?: string;
}

/** Circular progress ring with a gradient stroke that draws in via CSS. */
export function ProgressRing({
  value,
  size = 168,
  stroke = 14,
  className,
  children,
  trackClassName,
}: ProgressRingProps) {
  const pct = clamp(value, 0, 100);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);
  const gradientId = React.useId();

  const arcStyle = {
    "--ring-c": circumference,
    "--ring-target": offset,
    animation: "ring-fill 1s cubic-bezier(0.22, 1, 0.36, 1) both",
  } as React.CSSProperties;

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className={cn("stroke-[var(--muted)]", trackClassName)}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={arcStyle}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
