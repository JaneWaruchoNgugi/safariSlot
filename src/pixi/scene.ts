import { Application, Container, Sprite, Texture } from "pixi.js";

export interface Scene {
  root: Container;
  destroy: () => void;
}

// The painted scene background, scaled to cover the stage.
export function buildScene(_app: Application, width: number, height: number, bg: Texture): Scene {
  const root = new Container();
  const sprite = new Sprite(bg);
  const scale = Math.max(width / bg.width, height / bg.height);
  sprite.scale.set(scale);
  sprite.anchor.set(0.5);
  sprite.position.set(width / 2, height / 2);
  root.addChild(sprite);
  return { root, destroy: () => {} };
}
