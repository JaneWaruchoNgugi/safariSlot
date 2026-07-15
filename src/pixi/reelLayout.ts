export const COLS = 5;
export const ROWS = 4;

// Transpose 4 rows x 5 cols (row-major) -> 5 cols x 4 rows (column-major),
// the layout the reel view iterates. Missing cells become "".
export function transposeReels(reels: string[][]): string[][] {
  return Array.from({ length: COLS }, (_, c) =>
    Array.from({ length: ROWS }, (_, r) => reels[r]?.[c] ?? "")
  );
}

// Center point of cell (col,row) given cell size, gap, and grid origin.
export function cellCenter(
  col: number, row: number, cell: number, gap: number, originX: number, originY: number
): { x: number; y: number } {
  return {
    x: originX + col * (cell + gap) + cell / 2,
    y: originY + row * (cell + gap) + cell / 2,
  };
}
