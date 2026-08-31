import { useState, useEffect } from "react";
import { Calendar, Clock, Mail, Phone, Truck, X } from "lucide-react";

/**
 * Einmalig einblendbarer Service-Hinweis für den Standort Bonn.
 * Erscheint als Bottom-Sheet auf Mobilgeräten bzw. als schließbare Karte
 * unten rechts auf Desktop. Wird über den Session-Storage geschlossen,
 * damit Kunden die Meldung sehen, den Artikel aber nicht verdecken.
 */
export function BonnServiceHinweis() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Initial mit leichter Verzögerung öffnen, damit die Animation sichtbar ist.
    const dismissed = sessionStorage.getItem("bonn-service-hinweis");
    if (dismissed !== "true") {
      const timer = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    try {
      sessionStorage.setItem("bonn-service-hinweis", "true");
    } catch {
      // sessionStorage kann in eingeschränkten Umgebungen fehlschlagen.
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hinweis zu Buchung und Übergabe in Bonn"
      className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-end sm:justify-end pointer-events-none"
    >
      <div
        className="w-full sm:w-[26rem] bg-background/95 backdrop-blur-sm border-t sm:border sm:rounded-2xl border-accent/30 shadow-2xl p-4 sm:p-5 pointer-events-auto transform transition-transform duration-300 ease-out translate-y-0"
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-9 h-9 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-sm sm:text-base font-bold text-headline">
                Buchung & Übergabe in Bonn
              </h2>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Hinweis schließen"
                className="shrink-0 -mr-1 -mt-1 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="mt-3 space-y-2 text-xs sm:text-sm text-foreground">
              <li className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                <span>Alle Artikel ganz normal über den Kalender buchbar.</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                <span>
                  Abholung/Rückgabe: <strong>Mo–Fr 06:00–09:00 Uhr</strong> oder{" "}
                  <strong>17:30–18:00 Uhr</strong>. Samstag regulär geöffnet.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                <span>Artikel „auf Anfrage“ werden erst nach Bestätigung bereitgestellt.</span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                <span>
                  Anhänger weiterhin <strong>24/7</strong> per E-Mail-Code-Schloss buchbar.
                </span>
              </li>
            </ul>
            <p className="mt-3 text-[11px] sm:text-xs text-muted-foreground">
              Fragen?{" "}
              <a
                href="tel:+4922850466061"
                className="font-medium text-primary hover:underline underline-offset-2"
              >
                <Phone className="inline h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 -mt-0.5" />
                0228 504 660 61
              </a>{" "}
              oder{" "}
              <a
                href="mailto:bonn@slt-rental.de"
                className="font-medium text-primary hover:underline underline-offset-2"
              >
                bonn@slt-rental.de
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BonnServiceHinweis;
