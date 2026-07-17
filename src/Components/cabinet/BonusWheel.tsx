import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BONUS_PRIZES } from "../../game/bonusPrizes";
import rimUrl from "../../assets/img/scene/wheel-rim.webp";
import centerUrl from "../../assets/img/scene/wheel-center.webp";

interface Props {
  open: boolean;
  prizeIndex: number;
  onCollect: (index: number) => void;
}

const N = BONUS_PRIZES.length;
const SEG = 360 / N;          // degrees per wedge
const SPINS = 5;              // full turns before settling
const DURATION = 4000;        // spin length (ms)
const SIZE = 340;             // canvas size in CSS px (matches .wheel-wrap)
const LABEL_R = 88;           // label distance from the hub (px)
const DEG = Math.PI / 180;

// Preload the frame + hub art once; the canvas draws them each frame.
const rimImg = new Image(); rimImg.src = rimUrl;
const centerImg = new Image(); centerImg.src = centerUrl;

// cubic-bezier(.16,.84,.3,1) — same easing the CSS version used, solved in JS.
function makeBezier(x1: number, y1: number, x2: number, y2: number) {
  const A = (a: number, b: number) => 1 - 3 * b + 3 * a;
  const B = (a: number, b: number) => 3 * b - 6 * a;
  const C = (a: number) => 3 * a;
  const calc = (t: number, a: number, b: number) => ((A(a, b) * t + B(a, b)) * t + C(a)) * t;
  const slope = (t: number, a: number, b: number) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a);
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = calc(t, x1, x2) - x;
      if (Math.abs(err) < 1e-5) break;
      const d = slope(t, x1, x2);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    return calc(t, y1, y2);
  };
}
const ease = makeBezier(0.16, 0.84, 0.3, 1);

export const BonusWheel = ({ open, prizeIndex, onCollect }: Props) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    if (!open) { setLanded(false); return; }
    setLanded(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Size the backing store to the ACTUAL on-screen size. The cabinet applies a
    // CSS transform: scale, so getBoundingClientRect reflects the real rendered
    // size; a fixed 340px backing would blur once the cabinet is scaled up.
    const sizeBacking = () => {
      const rect = canvas.getBoundingClientRect();
      const cssW = rect.width || SIZE;
      const res = Math.min(Math.round(cssW * (window.devicePixelRatio || 1)), 2048);
      canvas.width = res;
      canvas.height = res;
      const k = res / SIZE;
      ctx.setTransform(k, 0, 0, k, 0, 0); // draw in 340-px coords, fill backing crisply
    };
    sizeBacking();

    const cx = SIZE / 2, cy = SIZE / 2;
    const rDisc = SIZE * 0.42;    // colored disc radius (fills up under the ring)
    const hub = SIZE * 0.31;      // paw-hub diameter
    // Land the chosen wedge's centre under the top pointer.
    const target = SPINS * 360 + (360 - (prizeIndex * SEG + SEG / 2));

    // point on the disc at a clockwise-from-top angle (deg), radius r
    const px = (deg: number, r: number) => cx + Math.cos((deg - 90) * DEG) * r;
    const py = (deg: number, r: number) => cy + Math.sin((deg - 90) * DEG) * r;

    const drawLabel = (text: string, size: number, x: number, yb: number, shadow: boolean) => {
      ctx.font = `800 ${size}px "Cinzel","Trebuchet MS",serif`;
      ctx.lineWidth = size > 20 ? 3 : 2.2;
      ctx.strokeStyle = "#4d2e0d";
      ctx.shadowColor = shadow ? "rgba(0,0,0,.6)" : "transparent";
      ctx.shadowBlur = shadow ? 3 : 0;
      ctx.shadowOffsetY = shadow ? 2 : 0;
      ctx.strokeText(text, x, yb);
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.fillStyle = "#f7ecc9";
      ctx.fillText(text, x, yb);
    };

    const draw = (rot: number) => {
      ctx.clearRect(0, 0, SIZE, SIZE);

      // ---- rotating disc (wedges + shadow grooves + shading) ----
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, rDisc, 0, Math.PI * 2); ctx.clip();

      BONUS_PRIZES.forEach((p, i) => {
        const s = (i * SEG + rot - 90) * DEG;
        const e = ((i + 1) * SEG + rot - 90) * DEG;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, rDisc, s, e);
        ctx.closePath();
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      // soft shadow grooves at each wedge boundary (separation, no hard border)
      ctx.save();
      ctx.strokeStyle = "rgba(0,0,0,.5)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(0,0,0,.55)";
      ctx.shadowBlur = 7;
      for (let i = 0; i < N; i++) {
        const b = (i * SEG + rot - 90) * DEG;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(b) * rDisc, cy + Math.sin(b) * rDisc);
        ctx.stroke();
      }
      ctx.restore();

      // fixed dome highlight (light from top) + edge vignette = 3D
      const dome = ctx.createRadialGradient(cx, cy - rDisc * 0.22, rDisc * 0.1, cx, cy, rDisc);
      dome.addColorStop(0, "rgba(255,255,255,.20)");
      dome.addColorStop(0.45, "rgba(255,255,255,0)");
      dome.addColorStop(0.82, "rgba(0,0,0,0)");
      dome.addColorStop(1, "rgba(0,0,0,.22)");
      ctx.fillStyle = dome;
      ctx.beginPath(); ctx.arc(cx, cy, rDisc, 0, Math.PI * 2); ctx.fill();

      // gentle darkening toward the hub
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, rDisc * 0.5);
      core.addColorStop(0, "rgba(0,0,0,.30)");
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(cx, cy, rDisc, 0, Math.PI * 2); ctx.fill();

      ctx.restore(); // end disc clip

      // ---- labels: orbit with their wedge but stay upright ----
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.lineJoin = "round";
      BONUS_PRIZES.forEach((p, i) => {
        const th = i * SEG + SEG / 2 + rot;
        const x = px(th, LABEL_R), y = py(th, LABEL_R);
        const isFree = p.type === "free";
        const main = isFree ? `+${p.value}` : `${p.mult}`;
        const suffix = isFree ? "FS" : "x";
        ctx.font = `800 25px "Cinzel","Trebuchet MS",serif`;
        const mw = ctx.measureText(main).width;
        ctx.font = `800 14px "Cinzel","Trebuchet MS",serif`;
        const sw = ctx.measureText(suffix).width;
        const gap = 2;
        const sx = x - (mw + gap + sw) / 2;
        const yb = y + 8; // nudge baseline so the group reads vertically centered
        drawLabel(main, 25, sx, yb, true);
        drawLabel(suffix, 14, sx + mw + gap, yb, true);
      });

      // ---- gold rim frame (clip off the square corner glow) ----
      if (rimImg.complete && rimImg.naturalWidth) {
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, SIZE / 2, 0, Math.PI * 2); ctx.clip();
        ctx.drawImage(rimImg, 0, 0, SIZE, SIZE);
        ctx.restore();
      }

      // ---- paw hub (clip the asset's square glow to a circle) ----
      if (centerImg.complete && centerImg.naturalWidth) {
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, hub / 2, 0, Math.PI * 2); ctx.clip();
        const cs = hub * 1.32; // scale so the medallion fills the circle
        ctx.drawImage(centerImg, cx - cs / 2, cy - cs / 2, cs, cs);
        ctx.restore();
      }
    };

    let raf = 0, startT = 0, stopped = false, curRot = 0;
    const frame = (now: number) => {
      if (!startT) startT = now;
      const p = Math.min(1, (now - startT) / DURATION);
      curRot = target * ease(p);
      draw(curRot);
      if (p < 1 && !stopped) raf = requestAnimationFrame(frame);
      else setLanded(true);
    };
    raf = requestAnimationFrame(frame);

    // Redraw if art/fonts load late, or the viewport (cabinet scale) changes.
    const redraw = () => draw(curRot || target);
    const onResize = () => { sizeBacking(); draw(curRot || target); };
    rimImg.addEventListener("load", redraw);
    centerImg.addEventListener("load", redraw);
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(redraw).catch(() => {});

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      rimImg.removeEventListener("load", redraw);
      centerImg.removeEventListener("load", redraw);
      window.removeEventListener("resize", onResize);
    };
  }, [open, prizeIndex]);

  if (!open) return null;
  const prize = BONUS_PRIZES[prizeIndex];

  return (
    <div className="bonus-overlay">
      <div className="bonus-modal">
        <h2 className="bonus-title">{t("bonus.title")}</h2>

        <div className="wheel-wrap">
          <canvas ref={canvasRef} className="wheel-canvas" style={{ width: SIZE, height: SIZE }} />
        </div>

        {landed ? (
          <>
            <div className="bonus-result">{t("bonus.youWon")} <b>{prize.label}</b>!</div>
            <button className="bonus-collect" onClick={() => onCollect(prizeIndex)}>
              {t("bonus.collect")}
            </button>
          </>
        ) : (
          <div className="bonus-spinning">{t("bonus.spinning")}</div>
        )}
      </div>
    </div>
  );
};
