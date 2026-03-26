import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import de from "./locales/de.json";
import en from "./locales/en.json";

const hasWindow = typeof window !== "undefined";

const canUseLocalStorage = () => {
  if (!hasWindow) return false;

  try {
    const testKey = "__i18n_storage_probe__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const getPreferredLanguage = () => {
  if (!hasWindow) return undefined;

  try {
    const value = window.localStorage.getItem("i18nextLng");
    return value === "de" || value === "en" ? value : undefined;
  } catch {
    return undefined;
  }
};

const storageAvailable = canUseLocalStorage();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: de },
      en: { translation: en },
    },
    lng: getPreferredLanguage() || "de",
    fallbackLng: "de",
    interpolation: {
      escapeValue: false,
    },
    detection: storageAvailable
      ? {
          order: ["localStorage", "navigator", "htmlTag"],
          caches: ["localStorage"],
          lookupLocalStorage: "i18nextLng",
        }
      : {
          order: ["navigator", "htmlTag"],
          caches: [],
        },
  });

export default i18n;
