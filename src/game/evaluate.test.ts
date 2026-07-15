import { describe, it, expect } from "vitest";
import { evaluateWins, evaluateScatter } from "./evaluate";

// reels are 4 rows x 5 cols, row-major. Column 0 is the leftmost reel.
// Line 1 is [0,0,0,0,0] -> the top row.
function rows(top: string[], r1: string[], r2: string[], bot: string[]) {
  return [top, r1, r2, bot];
}

describe("evaluateWins", () => {
  it("finds a 3-of-a-kind left-aligned on the top row", () => {
    const reels = rows(
      ["Lion", "Lion", "Lion", "Hippo", "Rhino"],
      ["Rhino", "Hippo", "Elephant", "Tigre", "Leopard"],
      ["Tigre", "Leopard", "Rhino", "Hippo", "Elephant"],
      ["Hippo", "Elephant", "Tigre", "Leopard", "Rhino"],
    );
    const wins = evaluateWins(reels, 20);
    expect(wins).toHaveLength(1);
    expect(wins[0]).toMatchObject({ symbol: "Lion", lineId: 1, matchCount: 3 });
    expect(wins[0].payout).toBe(10 * 20); // Lion 3-of-a-kind = x10
  });

  it("returns no wins when the run breaks at 2 on every payline", () => {
    // Every column holds one symbol, so any payline reads the same left-to-right
    // sequence (Lion, Lion, Hippo, ...) regardless of which rows it picks — the
    // run always breaks at 2, guaranteeing no win on all 30 lines.
    const col = ["Lion", "Lion", "Hippo", "Rhino", "Elephant"];
    const reels = rows(col, col, col, col);
    expect(evaluateWins(reels, 20)).toHaveLength(0);
  });

  it("scores a 5-of-a-kind", () => {
    const reels = rows(
      ["Elephant", "Elephant", "Elephant", "Elephant", "Elephant"],
      ["Rhino", "Hippo", "Lion", "Tigre", "Leopard"],
      ["Tigre", "Leopard", "Rhino", "Hippo", "Lion"],
      ["Hippo", "Lion", "Tigre", "Leopard", "Rhino"],
    );
    const wins = evaluateWins(reels, 10);
    expect(wins[0]).toMatchObject({ symbol: "Elephant", matchCount: 5 });
    expect(wins[0].payout).toBe(15 * 10);
  });

  it("evaluates only the first 25 paylines", () => {
    const row = ["Lion", "Lion", "Lion", "Lion", "Lion"];
    const reels = rows(row, row, row, row); // every payline is Lion x5
    const wins = evaluateWins(reels, 1);
    // 25 active lines -> 25 wins (would be 30 if all paylines were active)
    expect(wins).toHaveLength(25);
    expect(Math.max(...wins.map((w) => w.lineId))).toBe(25);
    // per-line payout = multiplier x bet (Lion 5-of-a-kind = x50)
    expect(wins[0].payout).toBe(50 * 1);
  });

  it("lets a Wild substitute to complete a line", () => {
    const reels = rows(
      ["Lion", "Wild", "Lion", "Hippo", "Rhino"], // top row: Lion, Wild, Lion -> Lion x3
      ["Rhino", "Hippo", "Elephant", "Tigre", "Leopard"],
      ["Tigre", "Leopard", "Rhino", "Hippo", "Elephant"],
      ["Hippo", "Elephant", "Tigre", "Leopard", "Rhino"],
    );
    const wins = evaluateWins(reels, 20);
    const top = wins.find((w) => w.lineId === 1);
    expect(top).toMatchObject({ symbol: "Lion", matchCount: 3 });
    expect(top!.payout).toBe(10 * 20);
  });

  it("counts scatters and pays 3+ anywhere on the grid", () => {
    const reels = rows(
      ["Scatter", "Hippo", "Rhino", "Scatter", "Lion"],
      ["Rhino", "Hippo", "Scatter", "Tigre", "Leopard"],
      ["Tigre", "Leopard", "Rhino", "Hippo", "Elephant"],
      ["Hippo", "Elephant", "Tigre", "Leopard", "Rhino"],
    );
    const res = evaluateScatter(reels, 10);
    expect(res.count).toBe(3);
    expect(res.payout).toBe(2 * 10); // SCATTER_PAYOUT[3] = 2
  });

  it("does not pay for fewer than 3 scatters", () => {
    const reels = rows(
      ["Scatter", "Hippo", "Rhino", "Scatter", "Lion"],
      ["Rhino", "Hippo", "Elephant", "Tigre", "Leopard"],
      ["Tigre", "Leopard", "Rhino", "Hippo", "Elephant"],
      ["Hippo", "Elephant", "Tigre", "Leopard", "Rhino"],
    );
    const res = evaluateScatter(reels, 10);
    expect(res.count).toBe(2);
    expect(res.payout).toBe(0);
  });
});
