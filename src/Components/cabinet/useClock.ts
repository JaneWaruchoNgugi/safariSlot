import { useEffect, useState } from "react";

export function formatClock(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// Live HH:MM clock, updates every 30s.
export function useClock(): string {
  const [now, setNow] = useState(() => formatClock(new Date()));
  useEffect(() => {
    const id = setInterval(() => setNow(formatClock(new Date())), 30000);
    return () => clearInterval(id);
  }, []);
  return now;
}
