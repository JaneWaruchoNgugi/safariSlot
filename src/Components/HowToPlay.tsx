import { X, Target, Coins, PawPrint, Crown, Sunrise, Trophy, FerrisWheel, Zap } from "lucide-react";
import { PAYTABLE } from "../game/symbols";
import { formatKsh } from "../game/betDisplay";
import { JACKPOT_SEEDS } from "../game/useJackpots";

interface Props {
  open: boolean;
  onClose: () => void;
}

// Highest-paying first, with an emoji for each animal.
const PAY_ROWS: { name: keyof typeof PAYTABLE; icon: string }[] = [
  { name: "Lion", icon: "🦁" },
  { name: "Elephant", icon: "🐘" },
  { name: "Rhino", icon: "🦏" },
  { name: "Hippo", icon: "🦛" },
  { name: "Tigre", icon: "🐅" },
  { name: "Leopard", icon: "🐆" },
];

// Everything a player needs to understand Safari Fortunes.
export const HowToPlay = ({ open, onClose }: Props) => {
  if (!open) return null;
  return (
    <div className="htp-overlay" onClick={onClose}>
      <div className="htp-modal" onClick={(e) => e.stopPropagation()}>
        <button className="htp-close" onClick={onClose} aria-label="close">
          <X size={20} />
        </button>
        <h1 className="htp-title">HOW TO PLAY</h1>
        <div className="htp-rule" />
        <p className="htp-lead">
          Safari Fortunes is a <b>5×4</b>, <b>25-payline</b> slot. Match symbols
          from the leftmost reel along a payline to win.
        </p>

        <div className="htp-body">
          <section className="htp-card">
            <h3><Target size={18} className="htp-ic" /> Objective</h3>
            <p>Land <b>3 or more</b> matching animals on one of the 25 paylines
              (left to right). Each win pays the symbol’s value × your bet, and
              every winning line is highlighted on the reels.</p>
          </section>

          <section className="htp-card">
            <h3><Coins size={18} className="htp-ic" /> Betting</h3>
            <ul>
              <li>Use − / + to set your <b>Bet</b> (minimum <b>KSh 5</b>).</li>
              <li>Your bet is the total stake per spin, played across all <b>25 lines</b>.</li>
              <li>Bigger bets scale every payout, jackpot contribution and the buy price.</li>
            </ul>
          </section>

          <section className="htp-card">
            <h3><PawPrint size={18} className="htp-ic" /> Paytable <span className="htp-note-inline">(× bet)</span></h3>
            <table className="htp-paytable">
              <thead>
                <tr><th>Symbol</th><th>3×</th><th>4×</th><th>5×</th></tr>
              </thead>
              <tbody>
                {PAY_ROWS.map(({ name, icon }) => (
                  <tr key={name}>
                    <td className="sym">{icon} {name}</td>
                    <td>{PAYTABLE[name][0]}×</td>
                    <td>{PAYTABLE[name][1]}×</td>
                    <td>{PAYTABLE[name][2]}×</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="htp-card">
            <h3><Crown size={18} className="htp-ic" /> Wild</h3>
            <p>The <b>WILD</b> medallion substitutes for any animal to complete a
              winning line. It cannot replace the Scatter or Bonus symbols.</p>
          </section>

          <section className="htp-card">
            <h3><Sunrise size={18} className="htp-ic" /> Scatter &amp; Free Spins</h3>
            <ul>
              <li>Land <b>3+ Scatter</b> symbols anywhere to win a scatter pays and
                trigger <b>10 Free Spins</b>.</li>
              <li>Free spins cost no balance and every win pays <b>double (×2)</b>.</li>
              <li>More scatters during the round <b>re-trigger</b> extra spins.</li>
              <li>Impatient? <b>Buy Free Spins</b> starts a round instantly for the
                shown price.</li>
            </ul>
          </section>

          <section className="htp-card">
            <h3><Trophy size={18} className="htp-ic" /> Progressive Jackpots</h3>
            <p>Four jackpots grow as everyone plays and can drop at random — the
              amount is paid straight to your balance.</p>
            <div className="htp-jackpots">
              <span className="jp mini">MINI · {formatKsh(JACKPOT_SEEDS.mini)}+</span>
              <span className="jp minor">MINOR · {formatKsh(JACKPOT_SEEDS.minor)}+</span>
              <span className="jp major">MAJOR · {formatKsh(JACKPOT_SEEDS.major)}+</span>
              <span className="jp grand">GRAND · {formatKsh(JACKPOT_SEEDS.grand)}+</span>
            </div>
          </section>

          <section className="htp-card">
            <h3><FerrisWheel size={18} className="htp-ic" /> Safari Bonus</h3>
            <p>Collect <b>3 Bonus</b> symbols (tracked on the Safari Bonus panel) to
              spin the prize wheel and win a <b>cash prize</b> (up to 50× your bet)
              or <b>extra free spins</b>.</p>
          </section>

          <section className="htp-card">
            <h3><Zap size={18} className="htp-ic" /> Turbo &amp; Auto</h3>
            <ul>
              <li><b>Turbo</b> speeds up the reel spin and win animations.</li>
              <li><b>Auto</b> spins automatically (10 / 25 / 50 / ∞) and stops on a
                big win, low balance, or when you tap it again.</li>
              <li><b>Hold SPIN</b> to start continuous autoplay.</li>
            </ul>
          </section>

          <p className="htp-note">Play for fun and bet responsibly. All outcomes are
            determined by a random number generator.</p>
        </div>
      </div>
    </div>
  );
};
