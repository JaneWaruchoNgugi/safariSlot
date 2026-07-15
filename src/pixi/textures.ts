import { Assets, Texture } from "pixi.js";
import { symbolAssets } from "../Hooks/symbolsImages";

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

// Ornate wooden cabinet border (transparent center): a grained wood band with
// beveled gold edges and amber gem accents at the corners + top/bottom centre.
export function makeFrame(w: number, h: number): Texture {
  return canvasTexture(w, h, (ctx) => {
    const bw = 24;                 // band thickness (~ the reel frame margin)
    const rO = 26, rI = 15;

    // --- wood band ---
    const wood = ctx.createLinearGradient(0, 0, 0, h);
    wood.addColorStop(0, "#8a5a2a");
    wood.addColorStop(0.5, "#6a4420");
    wood.addColorStop(1, "#472d15");
    ctx.fillStyle = wood;
    roundRect(ctx, 3, 3, w - 6, h - 6, rO);
    ctx.fill();

    // wavy grain lines within the band
    ctx.save();
    roundRect(ctx, 3, 3, w - 6, h - 6, rO);
    ctx.clip();
    ctx.strokeStyle = "rgba(58,34,12,0.45)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 46; i++) {
      const y = (i / 46) * h + Math.sin(i * 1.7) * 3;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.34, y + 4, w * 0.66, y - 4, w, y + 2);
      ctx.stroke();
    }
    ctx.restore();

    // cut the transparent centre
    ctx.globalCompositeOperation = "destination-out";
    roundRect(ctx, bw, bw, w - bw * 2, h - bw * 2, rI);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    // beveled edges: outer + inner gold highlight, inner dark keyline
    ctx.strokeStyle = "rgba(255,214,150,0.75)";
    ctx.lineWidth = 2.5;
    roundRect(ctx, 5, 5, w - 10, h - 10, rO - 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(28,15,4,0.85)";
    ctx.lineWidth = 2;
    roundRect(ctx, bw, bw, w - bw * 2, h - bw * 2, rI);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,214,150,0.5)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, bw + 3, bw + 3, w - bw * 2 - 6, h - bw * 2 - 6, rI - 2);
    ctx.stroke();

    // amber gem diamonds
    const gem = (x: number, y: number, s: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      const g = ctx.createLinearGradient(-s, -s, s, s);
      g.addColorStop(0, "#ffe9a8");
      g.addColorStop(0.5, "#e0a83a");
      g.addColorStop(1, "#8a5a1e");
      ctx.fillStyle = g;
      ctx.fillRect(-s, -s, s * 2, s * 2);
      ctx.strokeStyle = "rgba(40,22,4,0.7)";
      ctx.lineWidth = 2;
      ctx.strokeRect(-s, -s, s * 2, s * 2);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillRect(-s * 0.55, -s * 0.55, s * 0.5, s * 0.5);
      ctx.restore();
    };
    const c = bw / 2 + 3;
    gem(c + 3, c + 3, 9); gem(w - c - 3, c + 3, 9);
    gem(c + 3, h - c - 3, 9); gem(w - c - 3, h - c - 3, 9);
    gem(w / 2, c - 1, 10); gem(w / 2, h - c + 1, 10);
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

// Load the existing animal PNGs as Pixi textures, keyed by symbol name.
export async function loadSymbolTextures(): Promise<Record<string, Texture>> {
  const out: Record<string, Texture> = {};
  for (const [name, url] of Object.entries(symbolAssets)) {
    out[name] = await Assets.load(url as string);
  }
  return out;
}

// Load complete-medallion art (a URL map) into Pixi textures.
export async function loadMedallionArt(art: Record<string, string>): Promise<Record<string, Texture>> {
  const out: Record<string, Texture> = {};
  for (const [name, url] of Object.entries(art)) {
    out[name] = await Assets.load(url);
  }
  return out;
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
