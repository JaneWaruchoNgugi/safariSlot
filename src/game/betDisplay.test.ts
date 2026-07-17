import { describe, it, expect } from "vitest";
import "../i18n";
import { formatKsh, LINES } from "./betDisplay";

describe("betDisplay", () => {
  it("has 25 lines", () => { expect(LINES).toBe(25); });
  it("formats currency with two decimals", () => {
    expect(formatKsh(25)).toBe("KSh 25.00");
    expect(formatKsh(1000)).toBe("KSh 1,000.00");
  });
});

describe("formatKsh", () => {
  it("formats with KSh prefix and 2 decimals", () => {
    expect(formatKsh(1234)).toBe("KSh 1,234.00");
    expect(formatKsh(5)).toBe("KSh 5.00");
  });
});
