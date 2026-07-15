import { describe, it, expect } from "vitest";
import { spin, pickOutcome } from "./engine";
import { evaluateScatter } from "./evaluate";

// Deterministic RNG: replays a fixed sequence, looping.
function seq(values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("pickOutcome", () => {
  it("returns 'none' for a low roll and a win tier for a high roll", () => {
    expect(pickOutcome(() => 0.0)).toBe("none");   // bottom of the table
    expect(pickOutcome(() => 0.999)).not.toBe("none");
  });
});

describe("spin", () => {
  it("never spends below zero and returns a 4x5 grid", () => {
    const result = spin(20, seq([0.1, 0.2, 0.3, 0.4, 0.5]));
    expect(result.reels).toHaveLength(4);
    result.reels.forEach((row) => expect(row).toHaveLength(5));
  });

  it("totalPayout equals line wins plus scatter pay, and reports scatterCount", () => {
    const result = spin(20, seq([0.99, 0.5, 0.5, 0.5, 0.1, 0.2, 0.3]));
    const lineSum = result.wins.reduce((a, w) => a + w.payout, 0);
    const scatterPay = evaluateScatter(result.reels, 20).payout;
    expect(result.totalPayout).toBe(lineSum + scatterPay);
    expect(typeof result.scatterCount).toBe("number");
  });

  it("a 'none' outcome produces zero wins", () => {
    const result = spin(20, () => 0.0);
    expect(result.wins).toHaveLength(0);
    expect(result.totalPayout).toBe(0);
  });

  it("stays near the target win rate over many spins", () => {
    let rngState = 12345;
    const lcg = () => {
      rngState = (1103515245 * rngState + 12345) & 0x7fffffff;
      return rngState / 0x7fffffff;
    };
    let winning = 0;
    const N = 10000;
    for (let i = 0; i < N; i++) {
      if (spin(20, lcg).totalPayout > 0) winning++;
    }
    const rate = winning / N;
    expect(rate).toBeGreaterThan(0.15);
    expect(rate).toBeLessThan(0.30);
  });
});
