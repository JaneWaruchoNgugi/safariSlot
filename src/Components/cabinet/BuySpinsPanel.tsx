import { useTranslation } from "react-i18next";
import { formatKsh } from "../../game/betDisplay";
interface Props { price: number; onBuy: () => void; disabled: boolean; }
export const BuySpinsPanel = ({ price, onBuy, disabled }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="plaque side-panel left buy-spins">
      <div className="headline">{t("panels.buy")}<br />{t("panels.freeSpins")}</div>
      <button className="cta" onClick={onBuy} disabled={disabled}>{formatKsh(price)}</button>
    </div>
  );
};
