import { ACTIVE_LINES } from "./paylines";
import i18n from "../i18n";

// Single source of truth for the line count (display + evaluator).
export const LINES = ACTIVE_LINES;

// Format a number as "KSh 1,234.00". Currency token comes from the language pack
// (defaults to "KSh"); numeric grouping is identical across en/sw (Kenya).
export function formatKsh(amount: number): string {
  const currency = i18n.t("common.currency", { defaultValue: "KSh" });
  return currency + " " + amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
