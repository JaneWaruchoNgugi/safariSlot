import { useCallback, useState } from "react";

// A free-spins round: spins that cost no balance and pay at a boosted rate.
export const FREE_SPINS_AWARD = 10;      // spins granted per trigger
export const FREE_SPIN_MULTIPLIER = 2;   // win multiplier while a round is live
export const BUY_COST_MULTIPLIER = 80;   // buy price = totalBet × this

// Price to buy a free-spins round for the current stake.
// At the default bet (totalBet 25) this is KSh 2,000 — matching the panel art.
export function buyPrice(totalBet: number): number {
  return totalBet * BUY_COST_MULTIPLIER;
}

// A round is ephemeral (unlike the wallet it is not persisted).
export function useFreeSpins() {
  const [remaining, setRemaining] = useState<number>(0);
  const active = remaining > 0;

  const grant = useCallback((n: number = FREE_SPINS_AWARD): void => {
    setRemaining((r) => r + n);
  }, []);

  const consume = useCallback((): void => {
    setRemaining((r) => Math.max(0, r - 1));
  }, []);

  return { remaining, active, grant, consume };
}
