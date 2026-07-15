import { describe, it, expect } from "vitest";
import { BONUS_PRIZES, pickPrize, cashAmount } from "./bonusPrizes";

describe("pickPrize", () => {
  it("returns an in-range index", () => {
    for (const r of [0, 0.25, 0.5, 0.75, 0.999]) {
      const i = pickPrize(() => r);
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(BONUS_PRIZES.length);
    }
  });

  it("a zero roll lands on the first segment; a near-one roll lands on the last", () => {
    expect(pickPrize(() => 0)).toBe(0);
    expect(pickPrize(() => 0.999999)).toBe(BONUS_PRIZES.length - 1);
  });
});

describe("cashAmount", () => {
  it("scales a cash prize by the total bet", () => {
    const cash = BONUS_PRIZES.find((p) => p.type === "cash")!;
    expect(cashAmount(cash, 25)).toBe((cash.mult ?? 0) * 25);
  });

  it("is zero for a free-spins prize", () => {
    const free = BONUS_PRIZES.find((p) => p.type === "free")!;
    expect(cashAmount(free, 25)).toBe(0);
  });
});
