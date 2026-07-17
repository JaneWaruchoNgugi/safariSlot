import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import sw from "./sw.json";

export const SUPPORTED = ["en", "sw"] as const;
export type Lang = (typeof SUPPORTED)[number];

const saved = (typeof localStorage !== "undefined" && localStorage.getItem("lang")) as Lang | null;

const initial: Lang = saved && SUPPORTED.includes(saved) ? saved : "en";

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, sw: { translation: sw } },
  lng: initial,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Reflect the active language on <html lang> so CSS (e.g. :lang(sw)) can adapt.
function reflectLang(lng: string) {
  if (typeof document !== "undefined") document.documentElement.lang = lng;
}
reflectLang(initial);

export function setLang(lng: Lang) {
  i18n.changeLanguage(lng);
  reflectLang(lng);
  try { localStorage.setItem("lang", lng); } catch { /* ignore */ }
}

export default i18n;
