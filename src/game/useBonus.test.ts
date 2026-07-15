import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBonus, BONUS_NEEDED, STORAGE_KEY } from "./useBonus";

describe("useBonus", () => {
  beforeEach(() => localStorage.clear());

  it("starts empty", () => {
    const { result } = renderHook(() => useBonus());
    expect(result.current.collected).toBe(0);
  });

  it("add(1) increments without triggering below the threshold", () => {
    const { result } = renderHook(() => useBonus());
    let out;
    act(() => { out = result.current.add(1); });
    expect(out).toEqual({ triggered: false });
    expect(result.current.collected).toBe(1);
  });

  it("triggers on the third bonus and resets", () => {
    const { result } = renderHook(() => useBonus());
    act(() => { result.current.add(1); });
    act(() => { result.current.add(1); });
    let out;
    act(() => { out = result.current.add(1); });
    expect(out).toEqual({ triggered: true });
    expect(result.current.collected).toBe(0);
  });

  it("carries the remainder past the threshold", () => {
    const { result } = renderHook(() => useBonus());
    act(() => { result.current.add(2); });
    let out;
    act(() => { out = result.current.add(2); }); // 2 + 2 = 4 -> trigger, carry 1
    expect(out).toEqual({ triggered: true });
    expect(result.current.collected).toBe(4 - BONUS_NEEDED);
  });

  it("persists collected to localStorage", () => {
    const { result } = renderHook(() => useBonus());
    act(() => { result.current.add(1); });
    expect(localStorage.getItem(STORAGE_KEY)).toBe("1");
  });
});
