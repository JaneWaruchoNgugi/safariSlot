import type { SymbolName } from "../Types/types";

// Medallion backing color per symbol (0xRRGGBB), approximating the mockup.
export const SYMBOL_BACKING: Record<SymbolName, number> = {
  Lion: 0x7a1f1f,     // deep red
  Tigre: 0x1f3a7a,    // royal blue
  Hippo: 0x1f3a7a,    // royal blue
  Leopard: 0x1f5a2a,  // green
  Elephant: 0x1f5a2a, // green
  Rhino: 0x4a1f6a,    // purple
};
