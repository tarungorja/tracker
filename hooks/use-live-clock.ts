"use client";

import { useEffect, useState } from "react";

import { IST_TIMEZONE } from "@/lib/time";

const TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: IST_TIMEZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: IST_TIMEZONE,
  weekday: "long",
  month: "long",
  day: "numeric",
});

export interface LiveClock {
  time: string;
  date: string;
  mounted: boolean;
}

/**
 * A ticking IST clock. Returns `mounted: false` on the very first render so
 * server and client markup match (avoiding hydration mismatch), then updates
 * every second.
 */
export function useLiveClock(): LiveClock {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return { time: "", date: "", mounted: false };
  return {
    time: TIME_FORMAT.format(now),
    date: DATE_FORMAT.format(now),
    mounted: true,
  };
}
