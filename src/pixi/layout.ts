// Stage + reel layout presets. The reels view and the DOM chrome both key off
// the same numbers so landscape and portrait stay in sync.
export interface StageLayout {
  stageW: number;
  stageH: number;
  reelW: number;
  reelH: number;
  originX: number;
  originY: number;
  portrait: boolean;
}

export const LANDSCAPE: StageLayout = {
  stageW: 1280, stageH: 720,
  // Near-square cells (colW≈rowH) so the round medallions fill each cell. Sized
  // to fit between the header and the control bar (top at stage y≈583).
  reelW: 580, reelH: 445,       // lifted + slightly shorter so a gap clears the bar
  originX: 350, originY: 74,    // centred horizontally; header band for the logo
  portrait: false,
};

// Phone-shaped stage (9:16-ish). Reels fill the width; chrome stacks above/below.
export const PORTRAIT: StageLayout = {
  stageW: 720, stageH: 1280,
  // Sized so the ornate frame (frameW ≈ reelW×1.265) fits fully inside the 720
  // stage width with margin, and cells stay square. Centred horizontally.
  reelW: 560, reelH: 448,
  originX: 80, originY: 178,
  portrait: true,
};

export const FRAME_MARGIN = 26;

// Choose a layout from the viewport aspect ratio.
export function pickLayout(w: number, h: number): StageLayout {
  return h > w * 1.05 ? PORTRAIT : LANDSCAPE;
}
