import { describe, it, expect } from "vitest";
import { formatKsh, LINES } from "./betDisplay";

describe("betDisplay", () => {
  it("has 25 lines", () => { expect(LINES).toBe(25); });
  it("formats currency with two decimals", () => {
    expect(formatKsh(25)).toBe("KSh 25.00");
    expect(formatKsh(1000)).toBe("KSh 1,000.00");
  });
});
