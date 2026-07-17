import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import { setLang, type Lang } from "../i18n";
import bgUrl from "../assets/img/gamesprites/desktop-bg.webp";
import logoUrl from "../assets/img/new/safarifortunes-logo.webp";

interface Props { onChosen: () => void; }

const OPTIONS: { lng: Lang; labelKey: string; flag: string }[] = [
  { lng: "en", labelKey: "language.english", flag: "🇬🇧" },
  { lng: "sw", labelKey: "language.swahili", flag: "🇰🇪" },
];

export const LanguageSelect = ({ onChosen }: Props) => {
  const { t } = useTranslation();
  const pick = (lng: Lang) => { setLang(lng); onChosen(); };
  return (
    <div className="lang-overlay">
      <div className="lang-bg" style={{ backgroundImage: `url(${bgUrl})` }} />
      <div className="lang-scrim" />
      <div className="lang-inner">
        <img className="lang-logo" src={logoUrl} alt="Safari Fortunes" />
        <div className="lang-modal">
          <h2 className="lang-welcome">{t("language.welcome")}</h2>
          <div className="lang-divider" />
          <p className="lang-subtitle">{t("language.choose")}</p>
          <div className="lang-options">
            {OPTIONS.map((o) => (
              <button key={o.lng} className="lang-btn" onClick={() => pick(o.lng)}>
                <span className="lang-flag">{o.flag}</span>
                <span className="lang-name">{t(o.labelKey)}</span>
                <ChevronRight className="lang-arrow" size={26} />
              </button>
            ))}
          </div>
          <div className="lang-pawrule"><span>🐾</span></div>
          <p className="lang-footer">{t("language.footer")}</p>
        </div>
      </div>
    </div>
  );
};
