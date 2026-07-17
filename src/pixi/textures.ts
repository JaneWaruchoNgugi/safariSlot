import { Assets, Texture } from "pixi.js";
import { symbolAssets } from "../Hooks/symbolsImages";
import { MEDALLION_ART } from "./medallionAssets";
import LandscapeBg from "../assets/img/scene/savanna.webp";
import PortraitBg from "../assets/img/scene/savanna_portrait.webp";
import ReelBg from "../assets/img/gamesprites/reel-bg.webp";
import FrameImg from "../assets/img/gamesprites/frame.webp";

// Draw into an offscreen 2D canvas and wrap it as a Pixi texture. This keeps
// generated art reliable (native 2D gradients) instead of Pixi's gradient API.
function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  draw(ctx);
  return Texture.from(canvas);
}

// Gold ring + colored radial backing medallion.
export function makeMedallion(size: number, backing: number): Texture {
  return canvasTexture(size, size, (ctx) => {
    const r = size / 2;
    const hex = "#" + backing.toString(16).padStart(6, "0");
    // colored radial backing
    const grad = ctx.createRadialGradient(r, r * 0.8, r * 0.2, r, r, r);
    grad.addColorStop(0, shade(hex, 40));
    grad.addColorStop(1, shade(hex, -30));
    ctx.beginPath();
    ctx.arc(r, r, r - 6, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    // gold outer ring
    ctx.lineWidth = 7;
    ctx.strokeStyle = "#d4af37";
    ctx.stroke();
    // bright inner highlight ring
    ctx.beginPath();
    ctx.arc(r, r, r - 11, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,233,168,0.85)";
    ctx.stroke();
  });
}

// Dark, semi-transparent reel backing so the medallions read against a rich
// interior instead of the scenery (sits behind the reels, inside the frame).
export function makeReelBacking(w: number, h: number): Texture {
  return canvasTexture(w, h, (ctx) => {
    const grad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, Math.max(w, h) * 0.72);
    grad.addColorStop(0, "rgba(28,18,8,0.86)");
    grad.addColorStop(1, "rgba(8,5,2,0.94)");
    roundRect(ctx, 6, 6, w - 12, h - 12, 20);
    ctx.fillStyle = grad;
    ctx.fill();
    // subtle inner top sheen
    const sheen = ctx.createLinearGradient(0, 0, 0, h * 0.5);
    sheen.addColorStop(0, "rgba(255,220,150,0.10)");
    sheen.addColorStop(1, "rgba(255,220,150,0)");
    roundRect(ctx, 6, 6, w - 12, h - 12, 20);
    ctx.fillStyle = sheen;
    ctx.fill();
  });
}

// Vertically-tileable "electric current" strip for the animated reel dividers.
// The bright core starts and ends at the horizontal centre so the texture tiles
// seamlessly in Y; scrolling tilePosition.y makes the current appear to flow.
export function makeEnergyStrip(w = 28, h = 128): Texture {
  return canvasTexture(w, h, (ctx) => {
    const cx = w / 2;
    // horizontal glow: transparent edges -> orange -> white-hot core
    const glow = ctx.createLinearGradient(0, 0, w, 0);
    glow.addColorStop(0.0, "rgba(255,110,0,0)");
    glow.addColorStop(0.32, "rgba(255,90,0,0.18)");
    glow.addColorStop(0.44, "rgba(255,175,60,0.75)");
    glow.addColorStop(0.5, "rgba(255,248,225,1)");
    glow.addColorStop(0.56, "rgba(255,175,60,0.75)");
    glow.addColorStop(0.68, "rgba(255,90,0,0.18)");
    glow.addColorStop(1.0, "rgba(255,110,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // crackling hot core line — slight jitter, returns to centre at both ends
    ctx.strokeStyle = "rgba(255,250,238,0.95)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(255,150,40,0.95)";
    ctx.shadowBlur = 9;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    const segs = 9;
    for (let i = 1; i <= segs; i++) {
      const y = (h / segs) * i;
      const dx = i === segs ? 0 : Math.sin(i * 2.7) * (w * 0.16);
      ctx.lineTo(cx + dx, y);
    }
    ctx.stroke();

    // scattered sparks
    ctx.shadowBlur = 5;
    for (let i = 0; i < 7; i++) {
      const y = (h / 7) * i + 5;
      const dx = Math.sin(i * 3.9) * (w * 0.22);
      ctx.fillStyle = "rgba(255,205,95,0.85)";
      ctx.beginPath();
      ctx.arc(cx + dx, y, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// Calm, static idle divider shown between the reels when they are at rest: a
// smooth dim gold bar with a faint warm core. Smooth vertical gradient so it can
// be stretched to the reel height without artefacts (no animation).
export function makeIdleDivider(w = 22, h = 128): Texture {
  return canvasTexture(w, h, (ctx) => {
    const cx = w / 2;
    // soft horizontal glow, much dimmer than the active strip
    const glow = ctx.createLinearGradient(0, 0, w, 0);
    glow.addColorStop(0.0, "rgba(120,80,20,0)");
    glow.addColorStop(0.4, "rgba(150,100,30,0.18)");
    glow.addColorStop(0.5, "rgba(220,170,90,0.5)");
    glow.addColorStop(0.6, "rgba(150,100,30,0.18)");
    glow.addColorStop(1.0, "rgba(120,80,20,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    // thin steady core line
    ctx.strokeStyle = "rgba(255,225,160,0.5)";
    ctx.lineWidth = 1.5;
    ctx.shadowColor = "rgba(255,180,90,0.45)";
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();
  });
}

// Ornate polished-gold cabinet border (transparent centre): a beveled metallic
// gold band with an engraved tribal sawtooth, mitred corner bosses, and faceted
// jewel accents at the corners + top/bottom centre.
export function makeFrame(w: number, h: number): Texture {
  return canvasTexture(w, h, (ctx) => {
    const bw = 26;                 // band thickness (~ the reel frame margin)
    const iw = w - bw * 2, ih = h - bw * 2; // inner opening size

    // ---- polished gold band: vertical metallic gradient (bright top rail) ----
    const gold = ctx.createLinearGradient(0, 0, 0, h);
    gold.addColorStop(0.00, "#fff3cf");
    gold.addColorStop(0.08, "#f4cf72");
    gold.addColorStop(0.30, "#d69a37");
    gold.addColorStop(0.55, "#a9761f");
    gold.addColorStop(0.82, "#7c4f16");
    gold.addColorStop(1.00, "#5a3a12");
    ctx.fillStyle = gold;
    ctx.fillRect(0, 0, w, h);

    // diagonal brushed sheen sweeping from the top-left corner
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
    const sheen = ctx.createLinearGradient(0, 0, w * 0.7, h * 0.7);
    sheen.addColorStop(0, "rgba(255,250,225,0.55)");
    sheen.addColorStop(0.25, "rgba(255,240,190,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h);

    // ---- engraved tribal sawtooth running along the inner edge ----
    // small triangles pointing inward on all four rails (Aztec chevron feel)
    ctx.fillStyle = "rgba(60,36,8,0.55)";
    const tooth = 11, td = 6;               // spacing + depth
    const ix = bw - 4, iy = bw - 4, ir = w - bw + 4, ib = h - bw + 4;
    for (let x = ix + tooth; x < ir - tooth; x += tooth) {
      ctx.beginPath(); ctx.moveTo(x, iy); ctx.lineTo(x + tooth / 2, iy + td); ctx.lineTo(x + tooth, iy); ctx.fill();       // top
      ctx.beginPath(); ctx.moveTo(x, ib); ctx.lineTo(x + tooth / 2, ib - td); ctx.lineTo(x + tooth, ib); ctx.fill();       // bottom
    }
    for (let y = iy + tooth; y < ib - tooth; y += tooth) {
      ctx.beginPath(); ctx.moveTo(ix, y); ctx.lineTo(ix + td, y + tooth / 2); ctx.lineTo(ix, y + tooth); ctx.fill();       // left
      ctx.beginPath(); ctx.moveTo(ir, y); ctx.lineTo(ir - td, y + tooth / 2); ctx.lineTo(ir, y + tooth); ctx.fill();       // right
    }
    ctx.restore();

    // ---- cut the transparent centre (square) ----
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillRect(bw, bw, iw, ih);
    ctx.globalCompositeOperation = "source-over";

    // ---- crisp multi-line bevel for sharp 3D depth ----
    const rect = (x: number, y: number, ww: number, hh: number) => {
      ctx.beginPath(); ctx.rect(x, y, ww, hh); ctx.stroke();
    };
    ctx.strokeStyle = "rgba(20,10,2,0.95)";     // hard outer outline
    ctx.lineWidth = 1;
    rect(0.5, 0.5, w - 1, h - 1);
    ctx.strokeStyle = "rgba(255,248,220,0.95)"; // outer bright rim
    ctx.lineWidth = 1.5;
    rect(3, 3, w - 6, h - 6);
    ctx.strokeStyle = "rgba(50,30,8,0.9)";      // outer dark groove
    ctx.lineWidth = 1;
    rect(7, 7, w - 14, h - 14);
    ctx.strokeStyle = "rgba(30,17,4,1)";        // inner opening shadow
    ctx.lineWidth = 2;
    rect(bw, bw, iw, ih);
    ctx.strokeStyle = "rgba(255,240,190,0.9)";  // inner opening bright lip
    ctx.lineWidth = 1.5;
    rect(bw + 2.5, bw + 2.5, iw - 5, ih - 5);

    // ---- gold corner bosses (a raised mount under each corner gem) ----
    const boss = (x: number, y: number, s: number) => {
      const g = ctx.createRadialGradient(x - s * 0.3, y - s * 0.3, 1, x, y, s);
      g.addColorStop(0, "#ffe9a8");
      g.addColorStop(0.6, "#c08a2c");
      g.addColorStop(1, "#6e4515");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(40,22,4,0.7)"; ctx.lineWidth = 1.5; ctx.stroke();
    };

    // ---- faceted jewel (rotated square cut with cross facets + sparkle) ----
    const jewel = (x: number, y: number, s: number, hex: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      const g = ctx.createLinearGradient(-s, -s, s, s);
      g.addColorStop(0, shade(hex, 90));
      g.addColorStop(0.5, hex);
      g.addColorStop(1, shade(hex, -70));
      ctx.fillStyle = g;
      ctx.fillRect(-s, -s, s * 2, s * 2);
      // cross facets
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-s, 0); ctx.lineTo(s, 0); ctx.moveTo(0, -s); ctx.lineTo(0, s);
      ctx.stroke();
      // dark bezel
      ctx.strokeStyle = "rgba(20,10,2,0.85)";
      ctx.lineWidth = 2;
      ctx.strokeRect(-s, -s, s * 2, s * 2);
      // corner sparkle
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillRect(-s * 0.6, -s * 0.6, s * 0.45, s * 0.45);
      ctx.restore();
    };

    const c = bw / 2 + 2;
    const cg = 11, mg = 12;
    // corner bosses + jewels (TL green, TR blue, BL red, BR blue)
    for (const [gx, gy, col] of [
      [c + 2, c + 2, "#2fae4e"], [w - c - 2, c + 2, "#2f7fd8"],
      [c + 2, h - c - 2, "#d23a2f"], [w - c - 2, h - c - 2, "#2f7fd8"],
    ] as [number, number, string][]) {
      boss(gx, gy, cg + 5);
      jewel(gx, gy, cg, col);
    }
    // top & bottom centre emeralds on bosses
    boss(w / 2, c, mg + 5); jewel(w / 2, c, mg, "#1fb26a");
    boss(w / 2, h - c, mg + 5); jewel(w / 2, h - c, mg, "#1fb26a");
  });
}


// Placeholder Wild/Scatter/Bonus medallion (used until illustrated art arrives).
export function makeSpecialMedallion(kind: "wild" | "scatter" | "bonus"): Texture {
  const size = 220;
  return canvasTexture(size, size, (ctx) => {
    const r = size / 2;
    const backing = kind === "wild" ? "#5a1414" : kind === "bonus" ? "#3a2708" : "#123018";
    const grad = ctx.createRadialGradient(r, r * 0.8, r * 0.2, r, r, r);
    grad.addColorStop(0, shade(backing, 30));
    grad.addColorStop(1, shade(backing, -20));
    ctx.beginPath();
    ctx.arc(r, r, r - 8, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 9;
    ctx.strokeStyle = "#d4af37";
    ctx.stroke();
    ctx.fillStyle = "#ffe9a8";
    ctx.textAlign = "center";
    if (kind === "wild") {
      // simple crown
      ctx.beginPath();
      ctx.moveTo(r - 44, r - 6);
      ctx.lineTo(r - 30, r - 34);
      ctx.lineTo(r - 12, r - 12);
      ctx.lineTo(r, r - 40);
      ctx.lineTo(r + 12, r - 12);
      ctx.lineTo(r + 30, r - 34);
      ctx.lineTo(r + 44, r - 6);
      ctx.closePath();
      ctx.fill();
      ctx.font = "bold 34px serif";
      ctx.fillText("WILD", r, r + 44);
    } else if (kind === "scatter") {
      // simple acacia tree
      ctx.fillRect(r - 4, r - 6, 8, 34);
      ctx.beginPath();
      ctx.ellipse(r, r - 12, 42, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "bold 26px serif";
      ctx.fillText("SCATTER", r, r + 52);
    } else {
      // simple treasure chest
      ctx.fillStyle = "#caa24a";
      ctx.fillRect(r - 34, r - 18, 68, 40);
      ctx.fillStyle = "#8a6a1e";
      ctx.fillRect(r - 34, r - 6, 68, 8);
      ctx.beginPath();
      ctx.moveTo(r - 34, r - 18);
      ctx.quadraticCurveTo(r, r - 44, r + 34, r - 18);
      ctx.fillStyle = "#caa24a";
      ctx.fill();
      ctx.font = "bold 26px serif";
      ctx.fillStyle = "#ffe9a8";
      ctx.fillText("BONUS", r, r + 52);
    }
  });
}

// Load a { name: url } map into Pixi textures. Assets.load takes the whole URL
// list at once so Pixi fetches/decodes them in parallel (a per-URL await loop
// would serialize them and stall the reels on mount).
async function loadUrlMap(map: Record<string, string>): Promise<Record<string, Texture>> {
  const entries = Object.entries(map);
  if (entries.length === 0) return {};
  const loaded = await Assets.load(entries.map(([, url]) => url));
  const out: Record<string, Texture> = {};
  for (const [name, url] of entries) out[name] = loaded[url];
  return out;
}

// Load the existing animal photos as Pixi textures, keyed by symbol name.
export function loadSymbolTextures(): Promise<Record<string, Texture>> {
  return loadUrlMap(symbolAssets);
}

// Load complete-medallion art (a URL map) into Pixi textures.
export function loadMedallionArt(art: Record<string, string>): Promise<Record<string, Texture>> {
  return loadUrlMap(art);
}

// Warm Pixi's own texture cache (fetch + decode WebP → texture source) while the
// loading screen is still up, so PixiSlot's Assets.load calls resolve instantly
// at mount and the reels paint immediately instead of streaming in one by one.
// Deduped: safe to call more than once.
let pixiPreload: Promise<unknown> | null = null;
export function preloadPixiAssets(): Promise<unknown> {
  if (!pixiPreload) {
    const urls = [
      ...Object.values(MEDALLION_ART),
      ...Object.values(symbolAssets),
      LandscapeBg,
      PortraitBg,
      ReelBg,
      FrameImg,
    ];
    pixiPreload = Assets.load(urls).catch(() => {});
  }
  return pixiPreload;
}

// ---- local drawing helpers ----
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) + amt);
  const g = clamp(((n >> 8) & 0xff) + amt);
  const b = clamp((n & 0xff) + amt);
  return `rgb(${r},${g},${b})`;
}
