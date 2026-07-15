import { describe, it, expect } from "vitest";
import { transposeReels, cellCenter, COLS, ROWS } from "./reelLayout";

describe("reelLayout", () => {
  it("exposes a 5x4 grid", () => {
    expect(COLS).toBe(5);
    expect(ROWS).toBe(4);
  });

  it("transposes 4 rows x 5 cols (row-major) into 5 cols x 4 rows", () => {
    const reels = [
      ["a1", "b1", "c1", "d1", "e1"],
      ["a2", "b2", "c2", "d2", "e2"],
      ["a3", "b3", "c3", "d3", "e3"],
      ["a4", "b4", "c4", "d4", "e4"],
    ];
    const t = transposeReels(reels);
    expect(t).toHaveLength(5);
    expect(t[0]).toEqual(["a1", "a2", "a3", "a4"]);
    expect(t[4]).toEqual(["e1", "e2", "e3", "e4"]);
  });

  it("fills missing cells with empty string", () => {
    expect(transposeReels([])[0]).toEqual(["", "", "", ""]);
  });

  it("computes a cell center from origin/size/gap", () => {
    const p = cellCenter(0, 0, 100, 10, 5, 5);
    expect(p).toEqual({ x: 55, y: 55 });
    const p2 = cellCenter(1, 2, 100, 10, 0, 0);
    expect(p2).toEqual({ x: 160, y: 270 });
  });
});
