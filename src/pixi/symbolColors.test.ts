import { describe, it, expect } from "vitest";
import { SYMBOL_BACKING } from "./symbolColors";

describe("SYMBOL_BACKING", () => {
  it("has a numeric color for every symbol", () => {
    for (const name of ["Leopard", "Tigre", "Hippo", "Lion", "Rhino", "Elephant"]) {
      expect(typeof SYMBOL_BACKING[name as keyof typeof SYMBOL_BACKING]).toBe("number");
    }
  });

  it("uses the premium red backing for Lion", () => {
    expect(SYMBOL_BACKING.Lion).toBe(0x7a1f1f);
  });
});
