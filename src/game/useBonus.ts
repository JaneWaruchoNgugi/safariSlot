import { useCallback, useRef, useState } from "react";

export const BONUS_NEEDED = 3;
export const STORAGE_KEY = "safari_bonus";

function readCollected(): number {
  const raw = localStorage.getItem(STORAGE_KEY);
  const n = raw === null ? NaN : Number(raw);
  return Number.isFinite(n) ? Math.max(0, Math.min(BONUS_NEEDED - 1, Math.floor(n))) : 0;
}

// Collect Bonus symbols toward the Safari Bonus wheel (3 → trigger, then reset).
export function useBonus() {
  const [collected, setCollected] = useState<number>(readCollected);
  const ref = useRef<number>(collected);

  const commit = useCallback((next: number): void => {
    ref.current = next;
    localStorage.setItem(STORAGE_KEY, String(next));
    setCollected(next);
  }, []);

  // Add landed bonus symbols. Returns whether the wheel should trigger.
  // On trigger the counter resets, carrying any remainder past 3.
  const add = useCallback((count: number): { triggered: boolean } => {
    const total = ref.current + Math.max(0, count);
    if (total >= BONUS_NEEDED) {
      commit(total - BONUS_NEEDED);
      return { triggered: true };
    }
    commit(total);
    return { triggered: false };
  }, [commit]);

  const reset = useCallback((): void => commit(0), [commit]);

  return { collected, add, reset };
}
