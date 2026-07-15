import "../assets/mainslot.css";
import "../assets/cabinet.css";
import { useEffect, useRef, useState } from "react";
import { useSafariFortuneSnd } from "../Hooks/UseSounds/useSafariFortuneSnd.ts";
import { PixiSlot } from "../pixi/PixiSlot.tsx";
import { CoinShower } from "./CoinShower.tsx";
import { JackpotBar } from "./cabinet/JackpotBar.tsx";
import { BalancePanel } from "./cabinet/BalancePanel.tsx";
import { BuySpinsPanel } from "./cabinet/BuySpinsPanel.tsx";
import { SafariBonusPanel } from "./cabinet/SafariBonusPanel.tsx";
import { ControlBar } from "./cabinet/ControlBar.tsx";
import { FreeSpinsBanner } from "./cabinet/FreeSpinsBanner.tsx";
import { BonusWheel } from "./cabinet/BonusWheel.tsx";
import { HowToPlay } from "./HowToPlay.tsx";
import { HelpCircle, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { pickLayout } from "../pixi/layout.ts";
import logoUrl from "../assets/img/scene/logo.png";
import savannaLandscape from "../assets/img/scene/savanna.png";
import savannaPortrait from "../assets/img/scene/savanna_portrait.png";
import sunburstUrl from "../assets/img/scene/sunburst.png";
import type { PaylineResult } from "../Hooks/mapWinToCanvas.ts";
import { spin as engineSpin, toPaylineResults } from "../game/engine.ts";
import { formatKsh } from "../game/betDisplay.ts";
import { useWallet } from "../game/useWallet.ts";
import { useFreeSpins, buyPrice, FREE_SPIN_MULTIPLIER, FREE_SPINS_AWARD } from "../game/useFreeSpins.ts";
import { useJackpots, type JackpotAward } from "../game/useJackpots.ts";
import { useBonus } from "../game/useBonus.ts";
import { BONUS_PRIZES, pickPrize, cashAmount } from "../game/bonusPrizes.ts";

// Spin + win-presentation timings, normal vs turbo (ms).
const TIMING = {
  normal: { spin: 2500, fade: 3500, hide: 3900 },
  turbo:  { spin: 1150, fade: 1400, hide: 1700 },
};
const BIG_WIN = 1000; // autoplay stops on a win at or above this

export const MainSlots = () => {
  const [bet, setBet] = useState<number>(5);
  const { balance, placeBet, addWin, reset } = useWallet();
  const [spinTrigger, setSpinTrigger] = useState<boolean>(false);
  const [amountWon, setAmountWon] = useState<number>(0);
  const [resultPopUp, setResultPopUp] = useState<boolean>(false);
  const [isFading, setIsFading] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const { playSafariSnd, playSafariLoop } = useSafariFortuneSnd(isMuted, true);
  const [serverReels, setServerReels] = useState<string[][]>([]);
  const [paylineResults, setPaylineResults] = useState<PaylineResult[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [featureSplash, setFeatureSplash] = useState<{ title: string; sub: string } | null>(null);
  const featureTimer = useRef<number | null>(null);
  const pendingWin = useRef<number>(0);
  const pendingScatter = useRef<number>(0);
  const pendingJackpot = useRef<JackpotAward | null>(null);
  const pendingBonus = useRef<number>(0);
  const pendingWild = useRef<boolean>(false);
  const { remaining: freeSpins, active: freeSpinsActive, grant, consume } = useFreeSpins();
  const { values: jackpots, onSpin: jackpotSpin } = useJackpots();
  const { collected: bonusCollected, add: addBonus } = useBonus();
  const [wheelOpen, setWheelOpen] = useState<boolean>(false);
  const [bonusPrizeIndex, setBonusPrizeIndex] = useState<number>(0);
  const [turbo, setTurbo] = useState<boolean>(false);
  const [autoRemaining, setAutoRemaining] = useState<number>(0);
  const [howToOpen, setHowToOpen] = useState<boolean>(false);
  const [shownWin, setShownWin] = useState<number>(0);
  const timing = turbo ? TIMING.turbo : TIMING.normal;
  const buyCost = buyPrice(bet);

  // Pick a landscape/portrait stage from the viewport, then scale it to fit.
  // pickLayout returns one of two stable constants, so the layout reference only
  // changes on an actual orientation switch (Pixi re-inits just then).
  const [layout, setLayout] = useState(() => pickLayout(window.innerWidth, window.innerHeight));
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => {
      const lay = pickLayout(window.innerWidth, window.innerHeight);
      setLayout(lay);
      setScale(Math.min(window.innerWidth / lay.stageW, window.innerHeight / lay.stageH));
    };
    fit();
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);
    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // A prominent centre-stage banner for feature wins (scatter free spins, wild).
  const showFeature = (title: string, sub: string) => {
    setFeatureSplash({ title, sub });
    if (featureTimer.current) clearTimeout(featureTimer.current);
    featureTimer.current = window.setTimeout(() => setFeatureSplash(null), 3200);
  };

  const handleSpin = () => {
    if (spinTrigger || resultPopUp || wheelOpen) return;

    // A free spin costs no balance and pays at a boosted rate; otherwise stake.
    const free = freeSpinsActive;
    if (free) {
      consume();
    } else if (!placeBet(bet)) {
      showToast("Insufficient balance — top up to keep playing.");
      return;
    }

    const result = engineSpin(bet);
    setServerReels(result.reels);
    setPaylineResults(toPaylineResults(result.wins));
    pendingWin.current = result.totalPayout * (free ? FREE_SPIN_MULTIPLIER : 1);
    pendingScatter.current = result.scatterCount;
    pendingBonus.current = result.bonusCount;
    pendingWild.current = result.wins.some((w) => w.hasWild);
    // Jackpots feed and roll on real wagers only (never on free spins).
    pendingJackpot.current = free ? null : jackpotSpin(bet);

    setSpinTrigger(true);
    playSafariLoop();

    setTimeout(() => {
      setSpinTrigger(false);
      playSafariSnd("ReelStop");
      const won = pendingWin.current;
      let displayWin = won;
      if (won > 0) addWin(won);

      // A hit jackpot credits the wallet and joins the celebration.
      const jackpot = pendingJackpot.current;
      if (jackpot) {
        addWin(jackpot.amount);
        displayWin += jackpot.amount;
        showToast(`🏆 ${jackpot.tier.toUpperCase()} JACKPOT! ${formatKsh(jackpot.amount)}`);
        playSafariSnd("ThatsMassiveSnd");
      }

      if (displayWin > 0) setAmountWon(displayWin);

      // Autoplay stops on a big win so the player notices it.
      if (displayWin >= BIG_WIN && autoRef.current > 0) {
        setAutoRemaining(0);
        showToast("💰 Big win — autoplay stopped.");
      }

      // 3+ Scatters (on a paid or free spin) award/retrigger a free-spins round —
      // announce it with a prominent splash so the player sees the trigger.
      if (pendingScatter.current >= 3) {
        grant();
        showFeature(`${FREE_SPINS_AWARD} FREE SPINS!`, `${pendingScatter.current} Scatters`);
        playSafariSnd("ThatsMassiveSnd");
      } else if (pendingWild.current) {
        // A Wild completed a paying line — call it out.
        showFeature("WILD WIN!", "Wild completed a line");
        playSafariSnd("NiceOneSnd");
      }

      // Collect landed Bonus symbols; the 3rd opens the Safari Bonus wheel.
      if (pendingBonus.current > 0) {
        const { triggered } = addBonus(pendingBonus.current);
        if (triggered) {
          setBonusPrizeIndex(pickPrize());
          setWheelOpen(true);
        }
      }
    }, timing.spin);
  };

  // Apply the wheel prize when the player collects, then close the wheel.
  const handleCollectBonus = (index: number) => {
    const prize = BONUS_PRIZES[index];
    playSafariSnd("BonusSnd");
    if (prize.type === "cash") {
      const amount = cashAmount(prize, bet);
      addWin(amount);
      setAmountWon(amount);
      showToast(`🎁 Bonus win! ${formatKsh(amount)}`);
    } else {
      grant(prize.value ?? 0);
      showToast(`🎁 Bonus: ${prize.value} free spins!`);
    }
    setWheelOpen(false);
  };

  // Buy a free-spins round: pay the stake-scaled price, then start the round.
  const handleBuyFreeSpins = () => {
    if (spinTrigger || freeSpinsActive) return;
    if (!placeBet(buyCost)) {
      showToast("Insufficient balance to buy free spins.");
      return;
    }
    grant();
    showToast("🎉 Free spins purchased!");
  };

  // Keep the latest handleSpin reachable from the auto-advance effect below
  // without re-subscribing the effect on every closure change.
  const handleSpinRef = useRef(handleSpin);
  handleSpinRef.current = handleSpin;

  // While a round is live and the machine is idle, roll the next free spin.
  useEffect(() => {
    if (!freeSpinsActive || spinTrigger || resultPopUp || wheelOpen) return;
    const t = setTimeout(() => handleSpinRef.current(), turbo ? 350 : 700);
    return () => clearTimeout(t);
  }, [freeSpinsActive, freeSpins, spinTrigger, resultPopUp, wheelOpen, turbo]);

  // Autoplay: fire spins while idle until the counter runs out or a stop hits.
  // Free spins run on their own auto-advance, so autoplay pauses during a round.
  const autoRef = useRef(autoRemaining);
  autoRef.current = autoRemaining;
  useEffect(() => {
    if (autoRemaining <= 0) return;
    if (spinTrigger || resultPopUp || wheelOpen || freeSpinsActive) return;
    if (balance < bet) {
      setAutoRemaining(0);
      showToast("Autoplay stopped — top up to keep playing.");
      return;
    }
    const t = setTimeout(() => {
      setAutoRemaining((n) => (n === Infinity ? n : n - 1));
      handleSpinRef.current();
    }, turbo ? 300 : 600);
    return () => clearTimeout(t);
  }, [autoRemaining, spinTrigger, resultPopUp, wheelOpen, freeSpinsActive, balance, bet, turbo]);

  // Count the win up from zero for a satisfying reveal.
  useEffect(() => {
    if (amountWon <= 0) return;
    let raf = 0;
    const start = performance.now();
    const dur = 750;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setShownWin(amountWon * (1 - Math.pow(1 - p, 3))); // easeOutCubic
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [amountWon]);

  useEffect(() => {
    if (amountWon > 0) {
      setResultPopUp(true);
      if (amountWon >= BIG_WIN) playSafariSnd("ThatsMassiveSnd");
      else if (amountWon > 500) playSafariSnd("NiceOneSnd");
      else playSafariSnd("AwinSnd");

      const fadeTimer = setTimeout(() => setIsFading(true), timing.fade);
      const hideTimer = setTimeout(() => {
        setResultPopUp(false);
        setIsFading(false);
        setAmountWon(0);
      }, timing.hide);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [amountWon, playSafariSnd, timing.fade, timing.hide]);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggleFullscreen = () => {
    const el = document.documentElement;
    if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.();
  };

  return (
    <div
      className="stage-fit"
      style={{
        backgroundImage: `url(${layout.portrait ? savannaPortrait : savannaLandscape})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
    <div
      className={`cabinet ${layout.portrait ? "portrait" : ""}`}
      style={{ width: layout.stageW, height: layout.stageH, transform: `translate(-50%, -50%) scale(${scale})` }}
    >
      <PixiSlot
        spinTrigger={spinTrigger}
        reels={serverReels}
        paylines={paylineResults}
        turbo={turbo}
        layout={layout}
      />

      <JackpotBar values={jackpots} />
      <img className="game-logo" src={logoUrl} alt="Safari Fortunes" />

      <div className="top-controls">
        <button className="icon-btn" onClick={() => setHowToOpen(true)} aria-label="how to play">
          <HelpCircle size={20} />
        </button>
        <button className="icon-btn" onClick={() => setIsMuted((m) => !m)} aria-label={isMuted ? "unmute" : "mute"}>
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <button className="icon-btn" onClick={toggleFullscreen} aria-label={isFullscreen ? "exit fullscreen" : "fullscreen"}>
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>
      <BalancePanel balance={balance} />
      <BuySpinsPanel
        price={buyCost}
        onBuy={handleBuyFreeSpins}
        disabled={spinTrigger || freeSpinsActive}
      />
      <SafariBonusPanel collected={bonusCollected} />

      <FreeSpinsBanner remaining={freeSpins} />

      <BonusWheel open={wheelOpen} prizeIndex={bonusPrizeIndex} onCollect={handleCollectBonus} />

      <HowToPlay open={howToOpen} onClose={() => setHowToOpen(false)} />

      {balance < bet && (
        <button
          className="topup-btn"
          style={{ position: "absolute", top: 150, left: 26, zIndex: 6 }}
          onClick={reset}
        >
          Top up
        </button>
      )}

      <ControlBar
        bet={bet}
        onBet={setBet}
        amountWon={amountWon}
        spinTrigger={spinTrigger}
        handleSpin={handleSpin}
        freeSpinsActive={freeSpinsActive}
        turbo={turbo}
        onToggleTurbo={() => setTurbo((t) => !t)}
        autoRemaining={autoRemaining}
        onStartAuto={setAutoRemaining}
        onStopAuto={() => setAutoRemaining(0)}
      />

      {resultPopUp && amountWon > 0 && (
        <CoinShower count={amountWon >= 1000 ? 160 : amountWon > 500 ? 100 : 60} />
      )}

      {resultPopUp && amountWon > 0 && (
        <div className={`win-overlay ${isFading ? "fade-out" : "pop-in"}`}>
          <img className="win-rays" src={sunburstUrl} alt="" />
          <div className="win-glow" />
          <div className="win-content">
            {(() => {
              const label = amountWon >= 1000 ? "MEGA WIN!" : amountWon > 500 ? "BIG WIN!" : "WIN!";
              return <div className="win-title" data-text={label}>{label}</div>;
            })()}
            <div className="win-plaque">
              <span className="win-amount">KSh {shownWin.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {featureSplash && (
        <div className="feature-splash">
          <div className="feature-splash-title">{featureSplash.title}</div>
          <div className="feature-splash-sub">{featureSplash.sub}</div>
        </div>
      )}

      {toastMsg && <div className="custom-toast">{toastMsg}</div>}
    </div>
    </div>
  );
};
