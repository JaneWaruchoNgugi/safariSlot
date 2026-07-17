import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { formatKsh } from "../game/betDisplay";

export interface BetRecord {
  id: number;
  bet: number;
  win: number;   // total payout for the spin (0 = loss)
  free: boolean; // free-spin round (no stake)
}

interface Props {
  open: boolean;
  items: BetRecord[];
  onClose: () => void;
}

export const BetHistory = ({ open, items, onClose }: Props) => {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div className="history-overlay" onClick={onClose}>
      <div className="history-modal" onClick={(e) => e.stopPropagation()}>
        <button className="history-close" onClick={onClose} aria-label="close">
          <X size={20} />
        </button>
        <h2 className="history-title">{t("history.title")}</h2>
        {items.length === 0 ? (
          <p className="history-empty">{t("history.empty")}</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>{t("history.bet")}</th>
                <th>{t("history.result")}</th>
                <th>{t("history.payout")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className={it.win > 0 ? "row-win" : "row-lose"}>
                  <td>{it.free ? t("history.free") : formatKsh(it.bet)}</td>
                  <td>{it.win > 0 ? t("history.win") : t("history.lose")}</td>
                  <td>{it.win > 0 ? `+${formatKsh(it.win)}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
