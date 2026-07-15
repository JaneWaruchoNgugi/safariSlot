import { useCallback, useRef, useState } from "react";

export const STORAGE_KEY = "safari_balance";
export const DEFAULT_BALANCE = 10000;

function writeBalance(value: number): void {
  localStorage.setItem(STORAGE_KEY, String(value));
}

export function useWallet() {
  // Balance resets to the default on every page load (no cross-refresh persistence).
  const [balance, setBalance] = useState<number>(DEFAULT_BALANCE);
  // Source of truth for synchronous reads/writes. React state batching means a
  // functional updater may run after the caller returns, so placeBet cannot
  // decide "sufficient funds?" from inside setBalance. The ref always holds the
  // current balance the instant a mutator runs.
  const balanceRef = useRef<number>(balance);

  const commit = useCallback((next: number): void => {
    balanceRef.current = next;
    writeBalance(next);
    setBalance(next);
  }, []);

  const placeBet = useCallback((bet: number): boolean => {
    if (balanceRef.current < bet) return false;
    commit(balanceRef.current - bet);
    return true;
  }, [commit]);

  const addWin = useCallback((amount: number): void => {
    commit(balanceRef.current + amount);
  }, [commit]);

  const reset = useCallback((): void => {
    commit(DEFAULT_BALANCE);
  }, [commit]);

  return { balance, placeBet, addWin, reset };
}
