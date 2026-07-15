import type { SymbolName } from "../Types/types";
import { paylines, ACTIVE_LINES } from "./paylines";
import { payoutMultiplier, isAnimal, scatterMultiplier, WILD, SCATTER, BONUS } from "./symbols";

export interface WinLine {
  symbol: SymbolName;
  lineId: number;    // 1-based payline index
  matchCount: number;
  payout: number;
  hasWild: boolean;  // a Wild substituted into this winning run
}

export interface ScatterResult {
  count: number;
  payout: number;
}

// reels: 4 rows x 5 cols, row-major. Cell for line p at column c is reels[p[c]][c].
// Wild substitutes for the line's animal symbol; Scatter never joins a line.
export function evaluateWins(reels: string[][], bet: number): WinLine[] {
  const wins: WinLine[] = [];

  paylines.slice(0, ACTIVE_LINES).forEach((line, i) => {
    // The line's paying symbol is the first animal from the left; leading Wilds
    // are allowed (they substitute), but a Scatter/blank before any animal ends it.
    let lineSymbol: SymbolName | undefined;
    for (let c = 0; c < line.length; c++) {
      const cell = reels[line[c]]?.[c];
      if (cell && isAnimal(cell)) { lineSymbol = cell; break; }
      if (cell !== WILD) break;
    }
    if (!lineSymbol) return;

    let matchCount = 0;
    let hasWild = false;
    for (let c = 0; c < line.length; c++) {
      const cell = reels[line[c]]?.[c];
      if (cell === lineSymbol || cell === WILD) {
        if (cell === WILD) hasWild = true;
        matchCount++;
      } else break;
    }

    if (matchCount >= 3) {
      wins.push({
        symbol: lineSymbol,
        lineId: i + 1,
        matchCount,
        payout: payoutMultiplier(lineSymbol, matchCount) * bet,
        hasWild,
      });
    }
  });

  return wins;
}

// Scatters pay by count anywhere on the grid (3+).
export function evaluateScatter(reels: string[][], bet: number): ScatterResult {
  let count = 0;
  for (const rowArr of reels) {
    for (const cell of rowArr) if (cell === SCATTER) count++;
  }
  const payout = count >= 3 ? scatterMultiplier(count) * bet : 0;
  return { count, payout };
}

// Bonus symbols anywhere on the grid — collected toward the Safari Bonus wheel.
export function evaluateBonus(reels: string[][]): number {
  let count = 0;
  for (const rowArr of reels) {
    for (const cell of rowArr) if (cell === BONUS) count++;
  }
  return count;
}
