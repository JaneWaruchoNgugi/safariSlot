import type { SymbolName } from "../Types/types";

// All symbols in play (must match keys in Hooks/symbolsImages.ts).
export const SYMBOLS: SymbolName[] = [
  "Leopard", "Tigre", "Hippo", "Rhino", "Elephant", "Lion",
];

// Payout multiplier (× bet) for [3-of-a-kind, 4-of-a-kind, 5-of-a-kind].
export const PAYTABLE: Record<SymbolName, [number, number, number]> = {
  Leopard:  [0.25, 0.75, 2],
  Tigre:    [0.4,  0.9,  4],
  Hippo:    [0.5,  1,    5],
  Rhino:    [0.8,  1.2,  8],
  Elephant: [2,    5,    15],
  Lion:     [10,   25,   50],
};

// Relative weight for choosing which symbol forms a planted win.
// Low-value symbols win often; Lion is rare.
export const WIN_SYMBOL_WEIGHT: Record<SymbolName, number> = {
  Leopard: 30, Tigre: 25, Hippo: 20, Rhino: 12, Elephant: 8, Lion: 5,
};

// Payout for a given symbol and match length (3..5). 0 if length < 3.
export function payoutMultiplier(symbol: SymbolName, matchCount: number): number {
  if (matchCount < 3) return 0;
  const idx = Math.min(matchCount, 5) - 3;
  return PAYTABLE[symbol][idx];
}

// Special symbols (not animals). Wild substitutes on lines; Scatter pays by
// count anywhere on the grid; Bonus is collected toward the Safari Bonus wheel.
export const WILD = "Wild";
export const SCATTER = "Scatter";
export const BONUS = "Bonus";

// True for the six paying animal symbols (excludes Wild/Scatter/blank).
export function isAnimal(name: string): name is SymbolName {
  return (SYMBOLS as string[]).includes(name);
}

// Scatter payout multiplier (× bet) by scatter count on the grid.
export const SCATTER_PAYOUT: Record<number, number> = { 3: 2, 4: 10, 5: 50 };

export function scatterMultiplier(count: number): number {
  return SCATTER_PAYOUT[Math.min(count, 5)] ?? 0;
}
