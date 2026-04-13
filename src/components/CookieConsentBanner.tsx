import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Cookie, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const STORAGE_KEY = "slt_cookie_consent";

export type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

const defaultConsent: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  timestamp: "",
};

export function getConsentState(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

function saveConsent(state: ConsentState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, timestamp: new Date().toISOString() }));
  window.dispatchEvent(new CustomEvent("cookie-consent-changed", { detail: state }));
}

export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent("open-cookie-settings"));
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const loadExisting = useCallback(() => {
    const existing = getConsentState();
    if (existing) {
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    }
  }, []);

  useEffect(() => {
    const existing = getConsentState();
    if (!existing) {
      setVisible(true);
    }

    const handler = () => {
      loadExisting();
      setShowDetails(true);
      setVisible(true);
    };
    window.addEventListener("open-cookie-settings", handler);
    return () => window.removeEventListener("open-cookie-settings", handler);
  }, [loadExisting]);

  const accept = () => {
    saveConsent({ necessary: true, analytics: true, marketing: true, timestamp: "" });
    setVisible(false);
    setShowDetails(false);
  };

  const reject = () => {
    saveConsent({ necessary: true, analytics: false, marketing: false, timestamp: "" });
    setVisible(false);
    setShowDetails(false);
  };

  const saveSelection = () => {
    saveConsent({ necessary: true, analytics, marketing, timestamp: "" });
    setVisible(false);
    setShowDetails(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center pointer-events-none">
      {/* Backdrop when details open */}
      {showDetails && (
        <div
          className="absolute inset-0 bg-foreground/40 pointer-events-auto"
          onClick={() => { setShowDetails(false); if (!getConsentState()) setVisible(true); }}
        />
      )}

      <div className="pointer-events-auto w-full max-w-2xl mx-4 mb-4 bg-card border border-border rounded-xl shadow-2xl p-5 sm:p-6 relative animate-in slide-in-from-bottom-4 duration-300">
        {/* Close button only when re-opening settings */}
        {getConsentState() && (
          <button
            onClick={() => { setVisible(false); setShowDetails(false); }}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            aria-label="Schließen"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-start gap-3 mb-4">
          <Cookie className="h-6 w-6 text-accent shrink-0 mt-0.5" />
          <div>
            <h2 className="text-base font-semibold text-foreground">Cookie-Einstellungen</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten.
              Weitere Informationen finden Sie in unserer{" "}
              <Link to="/datenschutz" className="text-primary underline hover:text-primary/80">
                Datenschutzerklärung
              </Link>.
            </p>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-3 mb-5 border border-border rounded-lg p-4 bg-muted/30">
            {/* Necessary – always on */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-foreground">Notwendig</span>
                <p className="text-xs text-muted-foreground">
                  Essenziell für die Grundfunktionen der Website.
                </p>
              </div>
              <Switch checked disabled className="opacity-70" />
            </div>

            <div className="border-t border-border" />

            {/* Analytics */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-foreground">Analyse</span>
                <p className="text-xs text-muted-foreground">
                  Helfen uns zu verstehen, wie Besucher die Website nutzen.
                </p>
              </div>
              <Switch checked={analytics} onCheckedChange={setAnalytics} />
            </div>

            <div className="border-t border-border" />

            {/* Marketing */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-foreground">Marketing</span>
                <p className="text-xs text-muted-foreground">
                  Ermöglichen personalisierte Werbung und Remarketing.
                </p>
              </div>
              <Switch checked={marketing} onCheckedChange={setMarketing} />
            </div>
          </div>
        )}

        {/* Buttons – Reject and Accept are equally styled */}
        <div className="flex flex-col sm:flex-row gap-2">
          {!showDetails ? (
            <>
              <Button variant="outline" onClick={reject} className="flex-1 text-sm">
                Ablehnen
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowDetails(true)}
                className="flex-1 text-sm gap-1.5"
              >
                <Settings className="h-4 w-4" />
                Einstellungen
              </Button>
              <Button onClick={accept} className="flex-1 text-sm">
                Akzeptieren
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={reject} className="flex-1 text-sm">
                Alle ablehnen
              </Button>
              <Button variant="outline" onClick={saveSelection} className="flex-1 text-sm">
                Auswahl speichern
              </Button>
              <Button onClick={accept} className="flex-1 text-sm">
                Alle akzeptieren
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
