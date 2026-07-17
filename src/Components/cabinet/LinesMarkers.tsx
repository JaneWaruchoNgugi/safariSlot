import { useTranslation } from "react-i18next";
import { LINES } from "../../game/betDisplay";

export const LinesMarkers = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="lines-marker left"><div className="n">{LINES}</div><div className="t">{t("common.lines")}</div></div>
      <div className="lines-marker right"><div className="n">{LINES}</div><div className="t">{t("common.lines")}</div></div>
    </>
  );
};
