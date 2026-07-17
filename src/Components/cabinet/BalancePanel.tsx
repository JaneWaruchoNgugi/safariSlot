import { useTranslation } from "react-i18next";
import { formatKsh } from "../../game/betDisplay";
interface Props { balance: number; }
export const BalancePanel = ({ balance }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="plaque balance-panel">
      <div className="label">{t("balance.title")}</div>
      <div className="value">{formatKsh(balance).replace(".00", "")}</div>
    </div>
  );
};
