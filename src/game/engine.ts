import type { SymbolName } from "../Types/types";
import { paylines, ACTIVE_LINES } from "./paylines";
import { SYMBOLS, WIN_SYMBOL_WEIGHT, WILD, SCATTER, BONUS } from "./symbols";
import { evaluateWins, evaluateScatter, evaluateBonus, type WinLine } from "./evaluate";
import { getPaylinePositions } from "../Hooks/mapWinToCanvas";
import type { PaylineResult } from "../Hooks/mapWinToCanvas";

export type Rng = () => number; // returns [0, 1)

export interface SpinResult {
  reels: string[][];        // 4 rows x 5 cols
  wins: WinLine[];
  totalPayout: number;
  scatterCount: number;
  bonusCount: number;
}

type Outcome = "none" | "small" | "medium" | "big" | "jackpot";

// Weighted outcome table. ~22% of spins win something.
const OUTCOME_TABLE: [Outcome, number][] = [
  ["none", 78],
  ["small", 14],   // 3-of-a-kind, common symbol
  ["medium", 5],   // 4-of-a-kind
  ["big", 2],      // 5-of-a-kind, mid symbol
  ["jackpot", 1],  // 5-of-a-kind, high symbol
];

export function pickOutcome(rng: Rng): Outcome {
  const total = OUTCOME_TABLE.reduce((a, [, w]) => a + w, 0);
  let roll = rng() * total;
  for (const [outcome, weight] of OUTCOME_TABLE) {
    if (roll < weight) return outcome;
    roll -= weight;
  }
  return "none";
}

function weightedSymbol(rng: Rng, maxTier: number): SymbolName {
  // maxTier caps how valuable the winning symbol can be:
  // small -> cheap symbols only; jackpot -> allow Lion.
  const pool = SYMBOLS.slice(0, maxTier);
  const total = pool.reduce((a, s) => a + WIN_SYMBOL_WEIGHT[s], 0);
  let roll = rng() * total;
  for (const s of pool) {
    if (roll < WIN_SYMBOL_WEIGHT[s]) return s;
    roll -= WIN_SYMBOL_WEIGHT[s];
  }
  return pool[pool.length - 1];
}

function randomSymbol(rng: Rng): SymbolName {
  return SYMBOLS[Math.floor(rng() * SYMBOLS.length)];
}

function emptyGrid(): string[][] {
  return Array.from({ length: 4 }, () => Array.from({ length: 5 }, () => ""));
}

// Fill blank cells with random symbols.
function fillBlanks(reels: string[][], rng: Rng): void {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      if (!reels[r][c]) reels[r][c] = randomSymbol(rng);
    }
  }
}

// Break accidental wins we did not intend.
// frozenCells: set of "row,col" keys whose symbols must not be changed
// (they belong to an intentionally planted winning run).
function breakAccidentals(
  reels: string[][],
  bet: number,
  frozen: Set<string>,
): void {
  for (let guard = 0; guard < 200; guard++) {
    const wins = evaluateWins(reels, bet);
    if (wins.length === 0) break;

    // Find a win we can break without touching frozen cells.
    let broke = false;
    for (const win of wins) {
      const line = paylines[win.lineId - 1];
      // Try columns 2..4 (prefer not to touch col 0 which anchors every line).
      for (let c = 2; c < 5; c++) {
        const key = `${line[c]},${c}`;
        if (!frozen.has(key)) {
          const current = reels[line[c]][c];
          reels[line[c]][c] = SYMBOLS.find((s) => s !== current)!;
          broke = true;
          break;
        }
      }
      if (broke) break;
    }
    // If every remaining win only touches frozen cells, we can't break them —
    // they are all acceptable (part of, or aligned with, the planted win).
    if (!broke) break;
  }
}

function buildGrid(outcome: Outcome, bet: number, rng: Rng): string[][] {
  const reels = emptyGrid();
  if (outcome === "none") {
    fillBlanks(reels, rng);
    breakAccidentals(reels, bet, new Set());
    return reels;
  }

  const matchCount: number = outcome === "small" ? 3 : outcome === "medium" ? 4 : 5;
  const maxTier = outcome === "jackpot" ? SYMBOLS.length
    : outcome === "big" ? 5 : outcome === "medium" ? 4 : 3;
  const symbol = weightedSymbol(rng, maxTier);
  const lineIndex = Math.floor(rng() * ACTIVE_LINES);
  const line = paylines[lineIndex];

  // Plant the winning run along the chosen line and record frozen cells.
  const frozen = new Set<string>();
  for (let c = 0; c < matchCount; c++) {
    reels[line[c]][c] = symbol;
    frozen.add(`${line[c]},${c}`);
  }
  // Ensure the run stops: force the next reel on this line to differ.
  if (matchCount < 5) {
    const c = matchCount;
    reels[line[c]][c] = SYMBOLS.find((s) => s !== symbol)!;
  }

  fillBlanks(reels, rng);
  breakAccidentals(reels, bet, frozen);
  return reels;
}

// Sprinkle Wild/Scatter into the settled grid at low frequency.
function injectSpecials(reels: string[][], rng: Rng): void {
  const rows = reels.length;
  const cols = reels[0]?.length ?? 0;
  const put = (val: string) => {
    reels[Math.floor(rng() * rows)][Math.floor(rng() * cols)] = val;
  };
  // ~8% of spins add a single Wild (can help a line via substitution).
  if (rng() < 0.08) put(WILD);
  // Scatters: ~4% place 3 (demo the trigger); otherwise 0-2 rarely.
  const roll = rng();
  const scatters = roll < 0.04 ? 3 : roll < 0.16 ? 1 : roll < 0.2 ? 2 : 0;
  for (let s = 0; s < scatters; s++) put(SCATTER);
  // Bonus symbols: usually 1, occasionally 2 (to demo the collect-to-3 wheel).
  const bRoll = rng();
  const bonuses = bRoll < 0.02 ? 2 : bRoll < 0.09 ? 1 : 0;
  for (let b = 0; b < bonuses; b++) put(BONUS);
}

export function spin(bet: number, rng: Rng = Math.random): SpinResult {
  const outcome = pickOutcome(rng);
  const reels = buildGrid(outcome, bet, rng);
  injectSpecials(reels, rng);
  const wins = evaluateWins(reels, bet);
  const scatter = evaluateScatter(reels, bet);
  const bonusCount = evaluateBonus(reels);
  const totalPayout = wins.reduce((a, w) => a + w.payout, 0) + scatter.payout;
  return { reels, wins, totalPayout, scatterCount: scatter.count, bonusCount };
}

// Adapt engine wins to the PaylineResult shape the canvas consumes.
export function toPaylineResults(wins: WinLine[]): PaylineResult[] {
  return wins.map((w) => ({
    symbol: w.symbol,
    payout: w.payout,
    linesHit: 1,
    lineIds: [w.lineId],
    positions: getPaylinePositions(w.lineId),
  }));
}
