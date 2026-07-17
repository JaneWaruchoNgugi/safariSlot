import { Application, Container, Graphics, Sprite, Texture, TilingSprite } from "pixi.js";
import { COLS, ROWS, transposeReels } from "./reelLayout";
import { makeEnergyStrip, makeIdleDivider } from "./textures";
import type { PaylineResult } from "../Hooks/mapWinToCanvas";

export interface ReelAssets {
  // Photo overlay drawn on top of a generated medallion, or null when the
  // medallion is complete art that already includes the animal.
  symbols: Record<string, Texture | null>;
  medallions: Record<string, Texture>;
}

export interface ReelLayoutConfig {
  colW: number;   // column spacing (wider than tall, like the target)
  rowH: number;   // row spacing
  med: number;    // medallion diameter
  originX: number;
  originY: number;
}

export interface ReelsView {
  root: Container;
  setReels: (reels: string[][]) => void;
  spin: (onSettle: () => void, turbo?: boolean) => void;
  showWin: (paylines: PaylineResult[], turbo?: boolean) => void;
  clearWin: () => void;
}

const SYMBOL_NAMES = ["Leopard", "Tigre", "Hippo", "Lion", "Rhino", "Elephant"];
const WIN_MS = 4000;
const WIN_MS_TURBO = 1600;

interface StripCell {
  container: Container;
  medallion: Sprite;
  animal: Sprite;
}

interface Column {
  root: Container;
  cells: StripCell[]; // N cells top -> bottom
  symbols: string[];  // symbol name per strip cell
  scroll: number;     // px accumulator within a step
  spinning: boolean;
  stopAt: number;     // ms elapsed at which this reel stops
  speed: number;      // px/ms
  bounce: number;     // stop overshoot, eases to 0
}

function randSymbol(): string {
  return SYMBOL_NAMES[Math.floor(Math.random() * SYMBOL_NAMES.length)];
}

export function createReelsView(
  app: Application,
  assets: ReelAssets,
  layout: ReelLayoutConfig
): ReelsView {
  const { colW, rowH, med, originX, originY } = layout;
  const step = rowH;              // scroll wraps by one row
  const BUFFER = 1;               // one hidden row above the window
  const N = ROWS + BUFFER + 1;    // 6: 1 above, 4 visible, 1 below
  const winHeight = ROWS * rowH;

  // Absolute center of a visible cell (col, row 0..ROWS-1) in root coords.
  const centerX = (c: number) => originX + c * colW + colW / 2;
  const centerY = (r: number) => originY + r * rowH + rowH / 2;

  const root = new Container();
  const overlay = new Graphics(); // payline (unmasked, drawn over reels)
  const columns: Column[] = [];
  let current: string[][] = transposeReels([]); // [col][row] final symbols
  let winTicker: ((t: { deltaMS: number }) => void) | null = null;
  let spinTicker: ((t: { deltaMS: number }) => void) | null = null;

  for (let c = 0; c < COLS; c++) {
    const colRoot = new Container();
    colRoot.position.set(originX + c * colW, originY);

    const mask = new Graphics().rect(0, 0, colW, winHeight).fill(0xffffff);
    colRoot.addChild(mask);
    colRoot.mask = mask;

    const cells: StripCell[] = [];
    for (let i = 0; i < N; i++) {
      const cc = new Container();
      cc.position.set(colW / 2, (i - BUFFER) * rowH + rowH / 2);
      const medallion = new Sprite();
      medallion.anchor.set(0.5);
      medallion.width = med;
      medallion.height = med;
      const animal = new Sprite();
      animal.anchor.set(0.5);
      animal.width = med * 0.86;
      animal.height = med * 0.86;
      cc.addChild(medallion, animal);
      colRoot.addChild(cc);
      cells.push({ container: cc, medallion, animal });
    }

    root.addChild(colRoot);
    columns.push({ root: colRoot, cells, symbols: new Array(N).fill(""), scroll: 0, spinning: false, stopAt: 0, speed: 0, bounce: 0 });
  }

  // --- reel dividers between the columns ---
  // Each internal seam gets two layers: a calm static "idle" divider shown when
  // the reels are at rest, and an animated "electric current" strip that fades in
  // and flows while any reel is spinning. They cross-fade on spin start/stop.
  const energyTex = makeEnergyStrip();
  const idleTex = makeIdleDivider();
  const dividerW = Math.max(12, colW * 0.13);
  const active: TilingSprite[] = [];
  const idle: Sprite[] = [];
  const IDLE_LEVEL = 0.55;          // resting brightness of the idle divider
  for (let c = 1; c < COLS; c++) {
    const x = originX + c * colW - dividerW / 2;
    const idleBar = new Sprite(idleTex);
    idleBar.x = x;
    idleBar.y = originY;
    idleBar.width = dividerW;
    idleBar.height = winHeight;
    idleBar.blendMode = "add";
    idleBar.alpha = IDLE_LEVEL;
    root.addChild(idleBar);
    idle.push(idleBar);

    const d = new TilingSprite({ texture: energyTex, width: dividerW, height: winHeight });
    d.x = x;
    d.y = originY;
    d.tileScale.set(dividerW / energyTex.width, 1); // glow spans the divider width
    d.blendMode = "add";                            // additive glow
    d.alpha = 0;
    d.visible = false;
    root.addChild(d);
    active.push(d);
  }
  let activeAlpha = 0;
  const dividerTicker = (t: { deltaMS: number }) => {
    const target = columns.some((col) => col.spinning) ? 1 : 0;
    activeAlpha += (target - activeAlpha) * Math.min(1, t.deltaMS / 110);
    const visible = activeAlpha > 0.01;
    for (const d of active) {
      d.visible = visible;
      d.alpha = activeAlpha;
      if (visible) d.tilePosition.y += t.deltaMS * 0.9; // downward flow speed
    }
    // idle dims out as the active current takes over, and returns at rest
    for (const b of idle) b.alpha = IDLE_LEVEL * (1 - activeAlpha);
  };
  app.ticker.add(dividerTicker);

  root.addChild(overlay);

  function paintCell(sc: StripCell, name: string) {
    if (!name || !assets.medallions[name]) {
      sc.medallion.texture = Texture.EMPTY;
      sc.animal.texture = Texture.EMPTY;
      return;
    }
    sc.medallion.texture = assets.medallions[name];
    const overlay = assets.symbols[name];
    sc.animal.texture = overlay ?? Texture.EMPTY;
    sc.animal.visible = overlay != null;
  }

  function layoutColumn(col: Column) {
    for (let i = 0; i < N; i++) {
      col.cells[i].container.position.set(colW / 2, (i - BUFFER) * rowH + rowH / 2 + col.scroll + col.bounce);
      paintCell(col.cells[i], col.symbols[i]);
    }
  }

  // Load the final symbols into the visible slots, random into buffers.
  function placeFinals(col: Column, colIndex: number) {
    for (let i = 0; i < N; i++) {
      const row = i - BUFFER;
      col.symbols[i] = row >= 0 && row < ROWS ? current[colIndex][row] : randSymbol();
    }
  }

  function setReels(reels: string[][]) {
    const grid = reels.length ? reels : randomGrid();
    current = transposeReels(grid);
    for (let c = 0; c < COLS; c++) {
      const col = columns[c];
      placeFinals(col, c);
      col.scroll = 0;
      col.bounce = 0;
      col.spinning = false;
      layoutColumn(col);
    }
  }

  function resetWinVisuals() {
    overlay.clear();
    for (let c = 0; c < COLS; c++) {
      for (let i = 0; i < N; i++) {
        columns[c].cells[i].container.alpha = 1;
        columns[c].cells[i].container.scale.set(1);
      }
    }
  }

  function clearWin() {
    if (winTicker) { app.ticker.remove(winTicker); winTicker = null; }
    resetWinVisuals();
  }

  function stopTickers() {
    if (spinTicker) { app.ticker.remove(spinTicker); spinTicker = null; }
    if (winTicker) { app.ticker.remove(winTicker); winTicker = null; }
  }

  function spin(onSettle: () => void, turbo = false) {
    stopTickers();
    resetWinVisuals();
    let elapsed = 0;
    // Turbo: faster reels and a tighter stop stagger (last reel ~1.0s vs ~2.46s).
    const speed = turbo ? 3.6 : 2.4;         // px/ms
    const base = turbo ? 640 : 1500;         // first reel stop
    const stagger = turbo ? 120 : 240;       // gap between reels
    for (let c = 0; c < COLS; c++) {
      const col = columns[c];
      col.spinning = true;
      col.speed = speed;
      col.stopAt = base + c * stagger;
      col.bounce = 0;
      col.scroll = 0;
    }
    const lastStop = base + (COLS - 1) * stagger;

    spinTicker = (t) => {
      elapsed += t.deltaMS;
      let active = false;
      for (let c = 0; c < COLS; c++) {
        const col = columns[c];
        if (col.spinning) {
          active = true;
          col.scroll += col.speed * t.deltaMS;
          while (col.scroll >= step) {
            col.scroll -= step;
            col.symbols.unshift(randSymbol()); // new symbol enters at top
            col.symbols.pop();
          }
          if (elapsed >= col.stopAt) {
            col.spinning = false;
            col.scroll = 0;
            placeFinals(col, c);
            col.bounce = -14; // overshoot, eases back for a slot-like stop
          }
        } else if (col.bounce !== 0) {
          active = true;
          col.bounce += (0 - col.bounce) * 0.25;
          if (Math.abs(col.bounce) < 0.5) col.bounce = 0;
        }
        layoutColumn(col);
      }
      if (elapsed >= lastStop && !active) {
        if (spinTicker) { app.ticker.remove(spinTicker); spinTicker = null; }
        onSettle();
      }
    };
    app.ticker.add(spinTicker);
  }

  function showWin(paylines: PaylineResult[], turbo = false) {
    if (winTicker) { app.ticker.remove(winTicker); winTicker = null; }
    const winMs = turbo ? WIN_MS_TURBO : WIN_MS;
    const winning = new Set<string>();
    for (const p of paylines) {
      for (const [col, row] of p.positions) {
        if (current[col]?.[row] === p.symbol) winning.add(`${col},${row}`);
      }
    }
    if (winning.size === 0) return;

    let elapsed = 0;
    winTicker = (t) => {
      elapsed += t.deltaMS;
      const pulse = 1.14 + 0.12 * Math.sin((elapsed / 1000) * 6);
      const flick = 0.7 + 0.3 * Math.sin(elapsed / 70);
      for (let c = 0; c < COLS; c++) {
        for (let row = 0; row < ROWS; row++) {
          const sc = columns[c].cells[BUFFER + row];
          const win = winning.has(`${c},${row}`);
          sc.container.alpha = win ? 1 : 0.3;
          sc.container.scale.set(win ? pulse : 1);
        }
      }
      // fiery payline: wide orange glow -> gold -> bright flickering core
      overlay.clear();
      for (const p of paylines) {
        const pts = p.positions
          .filter(([col, row]) => current[col]?.[row] === p.symbol)
          .map(([col, row]) => ({ x: centerX(col), y: centerY(row) }));
        if (pts.length < 2) continue;
        const trace = () => pts.forEach((pt, i) => (i === 0 ? overlay.moveTo(pt.x, pt.y) : overlay.lineTo(pt.x, pt.y)));
        trace(); overlay.stroke({ width: 18, color: 0xff5a00, alpha: 0.28 * flick });
        trace(); overlay.stroke({ width: 10, color: 0xffb020, alpha: 0.55 * flick });
        trace(); overlay.stroke({ width: 4, color: 0xffeeb0, alpha: 0.95 });
      }
      if (elapsed >= winMs) {
        app.ticker.remove(winTicker!);
        winTicker = null;
        resetWinVisuals();
      }
    };
    app.ticker.add(winTicker);
  }

  return { root, setReels, spin, showWin, clearWin };
}

// A random 4 rows x 5 cols (row-major) grid for the idle/no-data state.
function randomGrid(): string[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => randSymbol())
  );
}
