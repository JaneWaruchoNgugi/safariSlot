import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useJackpots,
  JACKPOT_SEEDS,
  JACKPOT_CONTRIB,
  STORAGE_KEY,
} from "./useJackpots";

// rng that never clears any award threshold (0.9 > every tier's odds).
const noAward = () => 0.9;
// rng that clears every threshold (0.0 < every tier's odds) — grand is checked
// first, so grand wins.
const alwaysAward = () => 0.0;

describe("useJackpots", () => {
  beforeEach(() => localStorage.clear());

  it("starts at the tier seeds when storage is empty", () => {
    const { result } = renderHook(() => useJackpots());
    expect(result.current.values).toEqual(JACKPOT_SEEDS);
  });

  it("reads persisted values", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ mini: 5100, minor: 20200, major: 100300, grand: 1000400 }),
    );
    const { result } = renderHook(() => useJackpots());
    expect(result.current.values.mini).toBe(5100);
    expect(result.current.values.grand).toBe(1000400);
  });

  it("grows every tier by its contribution and awards nothing on a cold roll", () => {
    const { result } = renderHook(() => useJackpots());
    let award = null;
    act(() => { award = result.current.onSpin(25, noAward); });
    expect(award).toBeNull();
    expect(result.current.values.mini).toBeCloseTo(JACKPOT_SEEDS.mini + 25 * JACKPOT_CONTRIB.mini);
    expect(result.current.values.grand).toBeCloseTo(JACKPOT_SEEDS.grand + 25 * JACKPOT_CONTRIB.grand);
  });

  it("awards grand on a hot roll and resets grand to its seed", () => {
    const { result } = renderHook(() => useJackpots());
    let award = null;
    act(() => { award = result.current.onSpin(25, alwaysAward); });
    expect(award).not.toBeNull();
    expect(award!.tier).toBe("grand");
    expect(award!.amount).toBe(Math.round(JACKPOT_SEEDS.grand + 25 * JACKPOT_CONTRIB.grand));
    // grand reset to seed; the other tiers keep their contribution
    expect(result.current.values.grand).toBe(JACKPOT_SEEDS.grand);
    expect(result.current.values.mini).toBeCloseTo(JACKPOT_SEEDS.mini + 25 * JACKPOT_CONTRIB.mini);
  });

  it("persists values to localStorage after a spin", () => {
    const { result } = renderHook(() => useJackpots());
    act(() => { result.current.onSpin(25, noAward); });
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.mini).toBeCloseTo(JACKPOT_SEEDS.mini + 25 * JACKPOT_CONTRIB.mini);
  });
});
