import { type FC, useEffect, useRef } from "react";
import { Application, Container, Sprite } from "pixi.js";
import type { PaylineResult } from "../Hooks/mapWinToCanvas";
import { Assets, Texture } from "pixi.js";
import LandscapeBg from "../assets/img/scene/savanna.png";
import PortraitBg from "../assets/img/scene/savanna_portrait.png";
import { makeFrame, makeReelBacking, makeMedallion, makeSpecialMedallion, loadSymbolTextures, loadMedallionArt } from "./textures";
import { SYMBOL_BACKING } from "./symbolColors";
import { MEDALLION_ART } from "./medallionAssets";
import { createReelsView, type ReelsView } from "./reels";
import { buildScene } from "./scene";
import { FRAME_MARGIN, type StageLayout } from "./layout";

interface PixiSlotProps {
  spinTrigger: boolean;
  reels: string[][];       // 4 rows x 5 cols, row-major
  paylines: PaylineResult[];
  turbo?: boolean;
  layout: StageLayout;
}

export const PixiSlot: FC<PixiSlotProps> = ({ spinTrigger, reels, paylines, turbo = false, layout }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const viewRef = useRef<ReelsView | null>(null);
  // latest turbo flag, read at spin/win time without re-firing the effects
  const turboRef = useRef(turbo);
  turboRef.current = turbo;
  // latest props for the async init to read once ready
  const reelsRef = useRef(reels);
  reelsRef.current = reels;

  useEffect(() => {
    const { stageW, stageH, reelW, reelH, originX, originY, portrait } = layout;
    const colW = reelW / 5;
    const rowH = reelH / 4;
    const med = Math.min(colW, rowH) * 0.92;

    let disposed = false;
    const app = new Application();
    (async () => {
      await app.init({
        width: stageW,
        height: stageH,
        backgroundAlpha: 0,
        antialias: true,
        preserveDrawingBuffer: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2) * 1.5,
        autoDensity: true,
      });
      if (disposed) { app.destroy(true, { children: true }); return; }
      hostRef.current?.appendChild(app.canvas);

      const bgTexture: Texture = await Assets.load(portrait ? PortraitBg : LandscapeBg);
      if (disposed) { app.destroy(true, { children: true }); return; }
      const scene = buildScene(app, stageW, stageH, bgTexture);

      const frameW = reelW + FRAME_MARGIN * 2;
      const frameH = reelH + FRAME_MARGIN * 2;
      const backing = new Sprite(makeReelBacking(frameW, frameH));
      backing.position.set(originX - FRAME_MARGIN, originY - FRAME_MARGIN);
      const frame = new Sprite(makeFrame(frameW, frameH));
      frame.position.set(originX - FRAME_MARGIN, originY - FRAME_MARGIN);

      const photos = await loadSymbolTextures();
      const art = await loadMedallionArt(MEDALLION_ART as Record<string, string>);
      const medallions: Record<string, Texture> = {};
      const overlays: Record<string, Texture | null> = {};
      for (const name of Object.keys(SYMBOL_BACKING) as (keyof typeof SYMBOL_BACKING)[]) {
        if (art[name]) {
          medallions[name] = art[name];   // complete medallion art
          overlays[name] = null;
        } else {
          medallions[name] = makeMedallion(Math.round(med), SYMBOL_BACKING[name]);
          overlays[name] = photos[name];  // circular photo on generated medallion
        }
      }
      // Wild + Scatter + Bonus: use art if provided, else generated placeholders.
      for (const [name, kind] of [["Wild", "wild"], ["Scatter", "scatter"], ["Bonus", "bonus"]] as const) {
        medallions[name] = art[name] ?? makeSpecialMedallion(kind);
        overlays[name] = null;
      }

      const view = createReelsView(app, { symbols: overlays, medallions }, {
        colW, rowH, med, originX, originY,
      });

      const world = new Container();
      world.addChild(scene.root, backing, view.root, frame);
      app.stage.addChild(world);

      appRef.current = app;
      viewRef.current = view;
      view.setReels(reelsRef.current);
    })();

    return () => {
      disposed = true;
      viewRef.current = null;
      if (appRef.current) { appRef.current.destroy(true, { children: true }); appRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  // update displayed symbols when reels change
  useEffect(() => {
    viewRef.current?.setReels(reels);
  }, [reels]);

  // spin when triggered
  useEffect(() => {
    if (spinTrigger) viewRef.current?.spin(() => {}, turboRef.current);
  }, [spinTrigger]);

  // win highlight after the spin settles
  useEffect(() => {
    if (!spinTrigger && paylines.length > 0) viewRef.current?.showWin(paylines, turboRef.current);
  }, [spinTrigger, paylines]);

  return <div ref={hostRef} className="pixi-slot" />;
};
