import { useEffect, useState } from 'react';

/** Re-renders every `ms` while `on`, returning the current time. For clocks and countdowns. */
export function useNow(ms = 1000, on = true): number {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms, on]);
  return now;
}

/** 754 → "12:34". */
export const clock = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** The user's own calendar date, YYYY-MM-DD. */
export const todayISO = () => new Date().toLocaleDateString('en-CA');

export function greeting(hour = new Date().getHours()): string {
  if (hour < 5) return 'Good evening';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
