import { Application, Container, Sprite, Texture } from "pixi.js";

export interface Scene {
  root: Container;
  destroy: () => void;
}

// The scene backdrop is now the DOM jungle image behind the transparent canvas, so
// Pixi no longer paints its own background — this returns an empty layer.
// (params kept for the caller's signature.)
export function buildScene(_app: Application, _width: number, _height: number, _bg: Texture): Scene {
  void Sprite;
  const root = new Container();
  return { root, destroy: () => {} };
}
