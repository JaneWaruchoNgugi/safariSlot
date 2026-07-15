import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWallet, DEFAULT_BALANCE, STORAGE_KEY } from "./useWallet";

describe("useWallet", () => {
  beforeEach(() => localStorage.clear());

  it("starts at the default balance", () => {
    const { result } = renderHook(() => useWallet());
    expect(result.current.balance).toBe(DEFAULT_BALANCE);
  });

  it("placeBet deducts and returns true when funds suffice", () => {
    const { result } = renderHook(() => useWallet());
    let ok = false;
    act(() => { ok = result.current.placeBet(200); });
    expect(ok).toBe(true);
    expect(result.current.balance).toBe(DEFAULT_BALANCE - 200);
  });

  it("placeBet refuses and keeps balance when funds are short", () => {
    const { result } = renderHook(() => useWallet());
    let ok = true;
    act(() => { ok = result.current.placeBet(DEFAULT_BALANCE + 1); });
    expect(ok).toBe(false);
    expect(result.current.balance).toBe(DEFAULT_BALANCE);
  });

  it("addWin credits and persists to localStorage", () => {
    const { result } = renderHook(() => useWallet());
    act(() => { result.current.addWin(500); });
    expect(result.current.balance).toBe(DEFAULT_BALANCE + 500);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(String(DEFAULT_BALANCE + 500));
  });

  it("reset restores the default balance", () => {
    localStorage.setItem(STORAGE_KEY, "0");
    const { result } = renderHook(() => useWallet());
    act(() => { result.current.reset(); });
    expect(result.current.balance).toBe(DEFAULT_BALANCE);
  });
});
