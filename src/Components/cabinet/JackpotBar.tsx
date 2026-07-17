import { useTranslation } from "react-i18next";
import { formatKsh } from "../../game/betDisplay";
import type { JackpotValues } from "../../game/useJackpots";

const TIERS = ["mini", "minor", "major", "grand"] as const;

interface Props { values: JackpotValues; }

export const JackpotBar = ({ values }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="jackpot-bar">
      {TIERS.map((k) => (
        <div key={k} className={`plaque jackpot ${k}`}>
          <div className="tier">{t(`jackpots.${k}`)}</div>
          <div className="value">{formatKsh(Math.round(values[k])).replace(".00", "")}</div>
        </div>
      ))}
    </div>
  );
};
