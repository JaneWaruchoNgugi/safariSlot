import { ACTIVE_LINES } from "./paylines";

// Single source of truth for the line count (display + evaluator).
export const LINES = ACTIVE_LINES;

// Format a number as "KSh 1,234.00".
export function formatKsh(amount: number): string {
  return "KSh " + amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
