import { useCallback, useRef, useState } from "react";

export type JackpotTier = "mini" | "minor" | "major" | "grand";

export const STORAGE_KEY = "safari_jackpots";

// Starting (and post-award reset) value for each tier.
export const JACKPOT_SEEDS: Record<JackpotTier, number> = {
  mini: 5000,
  minor: 20000,
  major: 100000,
  grand: 1000000,
};

// Fraction of the total bet fed to each tier per paid spin. Grand grows slowest.
export const JACKPOT_CONTRIB: Record<JackpotTier, number> = {
  mini: 0.02,
  minor: 0.01,
  major: 0.004,
  grand: 0.001,
};

// Per-paid-spin probability each tier is awarded. Rare; grand is rarest.
export const JACKPOT_ODDS: Record<JackpotTier, number> = {
  mini: 0.003,
  minor: 0.0006,
  major: 0.0001,
  grand: 0.00002,
};

// Award check order — rarest first so a lucky roll can reach Grand before the
// common tiers claim the spin.
export const TIER_ORDER: JackpotTier[] = ["grand", "major", "minor", "mini"];

export interface JackpotAward {
  tier: JackpotTier;
  amount: number;
}

export type JackpotValues = Record<JackpotTier, number>;

function readJackpots(): JackpotValues {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<JackpotValues>;
      return {
        mini: numberOr(parsed.mini, JACKPOT_SEEDS.mini),
        minor: numberOr(parsed.minor, JACKPOT_SEEDS.minor),
        major: numberOr(parsed.major, JACKPOT_SEEDS.major),
        grand: numberOr(parsed.grand, JACKPOT_SEEDS.grand),
      };
    }
  } catch {
    // fall through to seeds on any parse/storage error
  }
  return { ...JACKPOT_SEEDS };
}

function numberOr(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function writeJackpots(values: JackpotValues): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
}

export function useJackpots() {
  const [values, setValues] = useState<JackpotValues>(readJackpots);
  // Synchronous source of truth (same rationale as useWallet): a spin must read
  // the current values the instant it runs, before React commits state.
  const ref = useRef<JackpotValues>(values);

  const commit = useCallback((next: JackpotValues): void => {
    ref.current = next;
    writeJackpots(next);
    setValues(next);
  }, []);

  // Feed every tier a slice of the stake, then maybe award one (rare).
  // Returns the award, or null. Call once per paid spin.
  const onSpin = useCallback(
    (totalBet: number, rng: () => number = Math.random): JackpotAward | null => {
      const next: JackpotValues = { ...ref.current };
      for (const tier of TIER_ORDER) {
        next[tier] += totalBet * JACKPOT_CONTRIB[tier];
      }

      let award: JackpotAward | null = null;
      for (const tier of TIER_ORDER) {
        if (rng() < JACKPOT_ODDS[tier]) {
          award = { tier, amount: Math.round(next[tier]) };
          next[tier] = JACKPOT_SEEDS[tier];
          break;
        }
      }

      commit(next);
      return award;
    },
    [commit],
  );

  return { values, onSpin };
}
