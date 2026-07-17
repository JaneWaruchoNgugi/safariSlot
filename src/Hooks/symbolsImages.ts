// The cc0/ photo assets were removed; every symbol now renders from full
// medallion art (see pixi/medallionAssets.ts + PixiSlot.tsx), so the circular
// photo overlay fallback is never used. Kept empty to satisfy the import in
// pixi/textures.ts (loadSymbolTextures) without depending on deleted files.
export const symbolAssets: Record<string, string> = {};

// ✅ Fix: convert object keys into an array first
// const allSymbols = Object.keys(symbolAssets);

export function generateRandomReels(): string[][] {
    const symbols = Object.keys(symbolAssets); // <- get keys as array
    return Array.from({ length: reelsCount }, () =>
        Array.from({ length: symbolsPerReel }, () =>
            symbols[Math.floor(Math.random() * symbols.length)]
        )
    );
}

export const reelsCount = 5;     // columns
export const symbolsPerReel = 4; // rows

export const lineColors = ["#00FFFF", "#bf00ff"];
export const animalGroups = {
    high: ["Lion", "Tiger"],
    medium: ["Leopard", "Elephant"],
    low: ["Hippo", "Rhino"],
};

// Index 0 → for 8–9 matches
// Index 1 → for 10–11 matches
// Index 2 → for 12 or more matches
// export const symbols: Record<string, [number,number,number]> = {
//     "Leopard": [0.25, 0.75, 2],
//     "Tigre": [0.4, 0.9, 4],
//     "Hippo": [0.5, 1, 5],
//     "Lion": [10, 25, 50],
//     "Rhino": [0.8, 1.2, 8],
//     "Elephant":[2, 5, 15]
// };
