import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith("en") ? "en" : "de";
  const otherLang = currentLang === "de" ? "en" : "de";

  return (
    <button
      onClick={() => i18n.changeLanguage(otherLang)}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium text-body"
      title={currentLang === "de" ? "Switch to English" : "Auf Deutsch wechseln"}
      aria-label={currentLang === "de" ? "Switch to English" : "Auf Deutsch wechseln"}
    >
      <Globe className="h-4 w-4 text-muted-foreground" />
      <span className="uppercase tracking-wide text-xs font-bold">{currentLang === "de" ? "EN" : "DE"}</span>
    </button>
  );
}
