import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useFreeSpins,
  buyPrice,
  FREE_SPINS_AWARD,
  BUY_COST_MULTIPLIER,
} from "./useFreeSpins";

describe("buyPrice", () => {
  it("scales the buy cost off the total bet", () => {
    expect(buyPrice(25)).toBe(25 * BUY_COST_MULTIPLIER); // 2000 at default bet
    expect(buyPrice(50)).toBe(50 * BUY_COST_MULTIPLIER);
  });
});

describe("useFreeSpins", () => {
  it("starts inactive with zero spins", () => {
    const { result } = renderHook(() => useFreeSpins());
    expect(result.current.remaining).toBe(0);
    expect(result.current.active).toBe(false);
  });

  it("grant() awards the default round and activates", () => {
    const { result } = renderHook(() => useFreeSpins());
    act(() => result.current.grant());
    expect(result.current.remaining).toBe(FREE_SPINS_AWARD);
    expect(result.current.active).toBe(true);
  });

  it("grant() stacks on retrigger", () => {
    const { result } = renderHook(() => useFreeSpins());
    act(() => result.current.grant());
    act(() => result.current.grant(5));
    expect(result.current.remaining).toBe(FREE_SPINS_AWARD + 5);
  });

  it("consume() decrements and never drops below zero", () => {
    const { result } = renderHook(() => useFreeSpins());
    act(() => result.current.grant(2));
    act(() => result.current.consume());
    expect(result.current.remaining).toBe(1);
    act(() => result.current.consume());
    act(() => result.current.consume());
    expect(result.current.remaining).toBe(0);
    expect(result.current.active).toBe(false);
  });
});
