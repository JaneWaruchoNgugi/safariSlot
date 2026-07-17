import { useTranslation } from "react-i18next";
import { BONUS_NEEDED } from "../../game/useBonus";
interface Props { collected: number; }
export const SafariBonusPanel = ({ collected }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="plaque side-panel right">
      <div className="headline">{t("panels.safariBonus")}</div>
      <div className="mini-wheel"><span className="mini-wheel-hub" /></div>
      <div className="bonus-pips">
        {Array.from({ length: BONUS_NEEDED }, (_, i) => (
          <span key={i} className={`pip ${i < collected ? "lit" : ""}`} />
        ))}
      </div>
      <div className="sub">{t("panels.collect3")}</div>
    </div>
  );
};
