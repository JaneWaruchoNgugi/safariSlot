import { X, Target, Coins, PawPrint, Crown, Sunrise, Trophy, FerrisWheel, Zap } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div className="htp-overlay" onClick={onClose}>
      <div className="htp-modal" onClick={(e) => e.stopPropagation()}>
        <button className="htp-close" onClick={onClose} aria-label="close">
          <X size={20} />
        </button>
        <h1 className="htp-title">{t("howto.title")}</h1>
        <div className="htp-rule" />
        <p className="htp-lead">
          <Trans i18nKey="howto.lead" />
        </p>

        <div className="htp-body">
          <section className="htp-card">
            <h3><Target size={18} className="htp-ic" /> {t("howto.objective")}</h3>
            <p><Trans i18nKey="howto.objectiveBody" /></p>
          </section>

          <section className="htp-card">
            <h3><Coins size={18} className="htp-ic" /> {t("howto.betting")}</h3>
            <ul>
              <li><Trans i18nKey="howto.betting1" /></li>
              <li><Trans i18nKey="howto.betting2" /></li>
              <li><Trans i18nKey="howto.betting3" /></li>
            </ul>
          </section>

          <section className="htp-card">
            <h3><PawPrint size={18} className="htp-ic" /> {t("howto.paytable")} <span className="htp-note-inline">{t("howto.paytableNote")}</span></h3>
            <table className="htp-paytable">
              <thead>
                <tr><th>{t("howto.colSymbol")}</th><th>3×</th><th>4×</th><th>5×</th></tr>
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
            <h3><Crown size={18} className="htp-ic" /> {t("howto.wild")}</h3>
            <p><Trans i18nKey="howto.wildBody" /></p>
          </section>

          <section className="htp-card">
            <h3><Sunrise size={18} className="htp-ic" /> {t("howto.scatter")}</h3>
            <ul>
              <li><Trans i18nKey="howto.scatter1" /></li>
              <li><Trans i18nKey="howto.scatter2" /></li>
              <li><Trans i18nKey="howto.scatter3" /></li>
              <li><Trans i18nKey="howto.scatter4" /></li>
            </ul>
          </section>

          <section className="htp-card">
            <h3><Trophy size={18} className="htp-ic" /> {t("howto.jackpotsTitle")}</h3>
            <p>{t("howto.jackpotsBody")}</p>
            <div className="htp-jackpots">
              <span className="jp mini">{t("jackpots.mini")} · {formatKsh(JACKPOT_SEEDS.mini)}+</span>
              <span className="jp minor">{t("jackpots.minor")} · {formatKsh(JACKPOT_SEEDS.minor)}+</span>
              <span className="jp major">{t("jackpots.major")} · {formatKsh(JACKPOT_SEEDS.major)}+</span>
              <span className="jp grand">{t("jackpots.grand")} · {formatKsh(JACKPOT_SEEDS.grand)}+</span>
            </div>
          </section>

          <section className="htp-card">
            <h3><FerrisWheel size={18} className="htp-ic" /> {t("howto.bonusTitle")}</h3>
            <p><Trans i18nKey="howto.bonusBody" /></p>
          </section>

          <section className="htp-card">
            <h3><Zap size={18} className="htp-ic" /> {t("howto.turboTitle")}</h3>
            <ul>
              <li><Trans i18nKey="howto.turbo1" /></li>
              <li><Trans i18nKey="howto.turbo2" /></li>
              <li><Trans i18nKey="howto.turbo3" /></li>
            </ul>
          </section>

          <p className="htp-note">{t("howto.note")}</p>
        </div>
      </div>
    </div>
  );
};
