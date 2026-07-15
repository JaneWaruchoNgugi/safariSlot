import { BONUS_NEEDED } from "../../game/useBonus";

interface Props { collected: number; }

// Phase 6: shows progress toward the Safari Bonus wheel (collect 3 bonus symbols).
export const SafariBonusPanel = ({ collected }: Props) => (
  <div className="plaque side-panel right">
    <div className="headline">SAFARI<br />BONUS</div>
    <div className="mini-wheel"><span className="mini-wheel-hub" /></div>
    <div className="bonus-pips">
      {Array.from({ length: BONUS_NEEDED }, (_, i) => (
        <span key={i} className={`pip ${i < collected ? "lit" : ""}`} />
      ))}
    </div>
    <div className="sub">COLLECT 3 TO WIN</div>
  </div>
);
