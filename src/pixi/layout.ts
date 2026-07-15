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
  reelW: 864, reelH: 414,       // shorter so the frame clears the control bar
  originX: 208, originY: 116,   // header band above the reels for the logo
  portrait: false,
};

// Phone-shaped stage (9:16-ish). Reels fill the width; chrome stacks above/below.
export const PORTRAIT: StageLayout = {
  stageW: 720, stageH: 1280,
  reelW: 660, reelH: 560,
  originX: 30, originY: 300,
  portrait: true,
};

export const FRAME_MARGIN = 26;

// Choose a layout from the viewport aspect ratio.
export function pickLayout(w: number, h: number): StageLayout {
  return h > w * 1.05 ? PORTRAIT : LANDSCAPE;
}
