import { useMemo, type CSSProperties } from "react";
import { createPortal } from "react-dom";

interface CoinShowerProps {
  /** How many coins to rain — scale this with the win tier. */
  count: number;
}

interface Coin {
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
}

/**
 * A short burst of falling coins rendered as a full-screen overlay. It is meant
 * to be conditionally mounted for the duration of a win celebration; each mount
 * generates a fresh randomized set of coins.
 */
export const CoinShower = ({ count }: CoinShowerProps) => {
  const coins = useMemo<Coin[]>(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.7,
        duration: 1.5 + Math.random() * 1.6,
        size: 16 + Math.random() * 22,
        drift: (Math.random() - 0.5) * 120,
      })),
    [count]
  );

  // Rendered through a portal to <body> so the overlay is positioned against the
  // real viewport. Mounting it inside the scaled/clipped .cabinet made its
  // `position: fixed` resolve against that transformed box, so the coins never
  // cleared the bottom on mobile and froze in a band mid-screen.
  return createPortal(
    <div className="coin-shower" aria-hidden="true">
      {coins.map((c, i) => (
        <span
          key={i}
          className="coin-piece"
          style={
            {
              left: `${c.left}%`,
              width: `${c.size}px`,
              height: `${c.size}px`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              "--drift": `${c.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>,
    document.body
  );
};
