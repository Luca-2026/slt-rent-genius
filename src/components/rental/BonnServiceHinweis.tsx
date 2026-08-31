import { AlertTriangle, Clock } from "lucide-react";

/**
 * Deutlich sichtbarer Service-Hinweis für den Standort Bonn:
 * Eingeschränkte Abhol- und Rückgabezeiten, Anhänger weiterhin 24/7 buchbar.
 * Wird auf allen Bonner Kategorie- und Artikelseiten eingeblendet.
 */
export function BonnServiceHinweis() {
  return (
    <section
      aria-label="Wichtiger Hinweis zu Abholung und Rückgabe in Bonn"
      className="rounded-xl border-2 border-accent bg-accent/10 p-4 md:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base md:text-lg font-bold text-headline mb-1">
            Wichtiger Hinweis: Eingeschränkte Abhol- und Rückgabezeiten in Bonn
          </h2>
          <p className="text-sm md:text-base text-foreground leading-relaxed mb-2">
            An unserem Standort Bonn können Abholung und Rückgabe von Mietgeräten
            aktuell <strong>nur nach vorheriger Terminvereinbarung</strong> erfolgen.
            Bitte melde dich vor der Anfahrt telefonisch unter{" "}
            <a href="tel:+4922850466061" className="font-semibold text-primary underline underline-offset-2">
              0228 504 660 61
            </a>{" "}
            oder per E-Mail an{" "}
            <a href="mailto:bonn@slt-rental.de" className="font-semibold text-primary underline underline-offset-2">
              bonn@slt-rental.de
            </a>
            .
          </p>
          <p className="text-sm md:text-base text-foreground leading-relaxed flex items-start gap-2">
            <Clock className="h-4 w-4 mt-1 shrink-0 text-accent" />
            <span>
              <strong>Unverändert rund um die Uhr verfügbar:</strong> Unsere Anhänger
              sind in Bonn weiterhin <strong>24/7 an 365 Tagen im Jahr</strong> per
              E-Mail-Code-Schloss buchbar – Abholung und Rückgabe jederzeit ohne Termin.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

export default BonnServiceHinweis;
