import { describe, it, expect } from "vitest";
import en from "./en.json";
import sw from "./sw.json";

// flatten nested keys to dotted paths
function keys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" ? keys(v as Record<string, unknown>, `${prefix}${k}.`) : [`${prefix}${k}`]
  );
}

describe("i18n resources", () => {
  it("en and sw have identical key sets", () => {
    expect(keys(sw as never).sort()).toEqual(keys(en as never).sort());
  });
});
