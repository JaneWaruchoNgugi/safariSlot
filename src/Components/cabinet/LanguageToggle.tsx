import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { setLang, type Lang } from "../../i18n";

export const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const next: Lang = i18n.language === "sw" ? "en" : "sw";
  return (
    <button
      className="lang-toggle icon-btn"
      aria-label="language"
      onClick={() => setLang(next)}
      title="Language"
    >
      <Globe size={18} />
      <span className="lang-code">{i18n.language === "sw" ? "SW" : "EN"}</span>
    </button>
  );
};
