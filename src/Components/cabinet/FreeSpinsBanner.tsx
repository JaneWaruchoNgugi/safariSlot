import { useTranslation } from "react-i18next";

interface Props { remaining: number; }

// Top-center overlay shown while a free-spins round is live.
export const FreeSpinsBanner = ({ remaining }: Props) => {
  const { t } = useTranslation();
  if (remaining <= 0) return null;
  return (
    <div className="free-spins-banner">
      <span className="fs-label">{t("panels.freeSpins")}</span>
      <span className="fs-count">× {remaining}</span>
    </div>
  );
};
