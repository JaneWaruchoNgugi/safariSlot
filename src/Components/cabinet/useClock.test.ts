import { describe, it, expect } from "vitest";
import { formatClock } from "./useClock";

describe("formatClock", () => {
  it("formats HH:MM zero-padded", () => {
    expect(formatClock(new Date(2026, 0, 1, 9, 5))).toBe("09:05");
    expect(formatClock(new Date(2026, 0, 1, 15, 30))).toBe("15:30");
  });
});
