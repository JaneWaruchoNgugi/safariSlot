import { type Dispatch, type SetStateAction, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Zap, RotateCw, History } from "lucide-react";
import { formatKsh } from "../../game/betDisplay";

interface Props {
  bet: number;
  onBet: Dispatch<SetStateAction<number>>;
  amountWon: number;
  balance: number;
  spinTrigger: boolean;
  handleSpin: () => void;
  freeSpinsActive?: boolean;
  turbo?: boolean;
  onToggleTurbo?: () => void;
  autoRemaining?: number;
  onStartAuto?: (n: number) => void;
  onStopAuto?: () => void;
  onOpenHistory?: () => void;
}

// Total-bet steps. Minimum stake is KSh 5 (no going lower).
const BET_STEPS = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 500, 1000, 1500];
const AUTO_OPTIONS: [string, number][] = [["10", 10], ["25", 25], ["50", 50], ["∞", Infinity]];
// Quick bet shortcuts.
const BET_SHORTCUTS = [5, 20, 50, 100, 500];

export const ControlBar = ({
  bet, onBet, amountWon, balance, spinTrigger, handleSpin,
  freeSpinsActive = false, turbo = false, onToggleTurbo,
  autoRemaining = 0, onStartAuto, onStopAuto, onOpenHistory,
}: Props) => {
  const { t } = useTranslation();
  const [autoMenu, setAutoMenu] = useState(false);
  // Bet is locked while spinning or during a free-spins round.
  const betLocked = spinTrigger || freeSpinsActive;
  const autoActive = autoRemaining > 0;

  const stepBet = (dir: number) => {
    const i = BET_STEPS.indexOf(bet);
    const next = i === -1 ? BET_STEPS[0] : BET_STEPS[Math.min(BET_STEPS.length - 1, Math.max(0, i + dir))];
    if (!betLocked) onBet(next);
  };
  const setBet = (val: number) => { if (!betLocked) onBet(val); };

  // Press-and-hold the SPIN button to start continuous autoplay.
  const holdTimer = useRef<number | null>(null);
  const didHold = useRef(false);
  const startHold = () => {
    didHold.current = false;
    holdTimer.current = window.setTimeout(() => {
      didHold.current = true;
      if (!autoActive) onStartAuto?.(Infinity);
    }, 550);
  };
  const endHold = () => {
    if (holdTimer.current !== null) { clearTimeout(holdTimer.current); holdTimer.current = null; }
  };
  const onSpinClick = () => {
    if (didHold.current) { didHold.current = false; return; } // hold already started autoplay
    handleSpin();
  };

  const clickAuto = () => {
    if (autoActive) { onStopAuto?.(); return; }
    setAutoMenu((m) => !m);
  };
  const chooseAuto = (n: number) => {
    setAutoMenu(false);
    onStartAuto?.(n);
  };

  return (
    <div className="control-bar">
      {/* TURBO — left round button */}
      <button
        className={`chip-btn turbo-btn ${turbo ? "on" : ""}`}
        aria-label="turbo"
        aria-pressed={turbo}
        onClick={onToggleTurbo}
      >
        <Zap size={16} />
        <span>{t("controls.turbo")}</span>
      </button>

      {/* BET card */}
      <div className="bet-row">
        <div className="bet-block">
          <div className="label">{t("controls.bet")}</div>
          <div className="bet-stepper">
            <button onClick={() => stepBet(-1)} disabled={betLocked}>−</button>
            <div className="val">{bet.toFixed(2)}</div>
            <button onClick={() => stepBet(1)} disabled={betLocked}>+</button>
          </div>
        </div>

        {/* BET LEVEL chip shortcuts */}
        <div className="bet-shortcuts-wrap">
          <span className="bet-level-label">{t("controls.betLevel")}</span>
          <div className="bet-shortcuts">
            {BET_SHORTCUTS.map((v) => (
              <button
                key={v}
                className={bet === v ? "on" : ""}
                disabled={betLocked}
                onClick={() => setBet(v)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Bet history — gold-ring button, opens the history modal */}
        <button className="history-btn" aria-label="bet history" onClick={onOpenHistory}>
          <History size={20} />
        </button>
      </div>

      {/* SPIN */}
      <button
        className={`spin-btn ${spinTrigger ? "spinning" : ""}`}
        onClick={onSpinClick}
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onPointerCancel={endHold}
        aria-label="spin"
      >
        <span className="spin-core">
          <span className="spin-label">{spinTrigger ? "…" : t("controls.spin")}</span>
          <small className="spin-sub">{t("controls.auto")}</small>
        </span>
      </button>

      {/* WIN readout */}
      <div className="plaque win-box">
        <div className="label">{t("controls.win")}</div>
        <div className="value">{formatKsh(amountWon)}</div>
      </div>

      {/* BALANCE readout — only shown inside the bar on desktop; hidden on mobile via CSS */}
      <div className="plaque balance-box">
        <div className="label">{t("balance.title")}</div>
        <div className="value">{formatKsh(balance).replace(".00", "")}</div>
      </div>

      {/* AUTO — right round button */}
      <div className="auto-wrap">
        <button className={`chip-btn auto-btn ${autoActive ? "on" : ""}`} aria-label="auto" onClick={clickAuto}>
          <RotateCw size={16} />
          <span>{autoActive ? (autoRemaining === Infinity ? "∞" : autoRemaining) : t("controls.auto")}</span>
        </button>
        {autoMenu && !autoActive && (
          <div className="auto-menu">
            {AUTO_OPTIONS.map(([label, n]) => (
              <button key={label} onClick={() => chooseAuto(n)}>{label}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
