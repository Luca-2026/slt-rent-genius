import { Check, Clock, Info, Mail, Phone, Truck } from "lucide-react";

/**
 * Kompakter Service-Hinweis für den Standort Bonn:
 * Übergabezeiten für Mietgeräte, Anhänger 24/7 buchbar.
 * Wird auf allen Bonner Kategorie- und Artikelseiten eingeblendet.
 */
export function BonnServiceHinweis() {
  return (
    <section
      aria-label="Hinweis zu Buchung und Übergabe in Bonn"
      className="rounded-lg border border-accent/30 bg-accent/5 p-3 md:p-4"
    >
      <div className="flex items-start gap-2.5">
        <div className="shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-md bg-accent text-accent-foreground flex items-center justify-center">
          <Info className="h-4 w-4 md:h-5 md:w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm md:text-base font-bold text-headline mb-1.5">
            Buchung & Übergabe in Bonn
          </h2>
          <ul className="space-y-1 text-xs md:text-sm text-foreground">
            <li className="flex items-start gap-1.5">
              <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent" />
              <span>Alle Artikel ganz normal über Rentfair buchbar.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent" />
              <span>
                Abholung/Rückgabe: <strong>Mo–Fr 06:00–09:00 Uhr</strong> oder{" "}
                <strong>17:30–18:00 Uhr</strong>. Samstag regulär geöffnet.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <Mail className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent" />
              <span>Artikel „auf Anfrage“ werden erst nach Bestätigung bereitgestellt.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <Truck className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent" />
              <span>
                Anhänger weiterhin <strong>24/7</strong> per E-Mail-Code-Schloss buchbar.
              </span>
            </li>
          </ul>
          <p className="mt-1.5 text-[11px] md:text-xs text-muted-foreground">
            Fragen?{" "}
            <a href="tel:+4922850466061" className="font-medium text-primary hover:underline underline-offset-2">
              <Phone className="inline h-3 w-3 md:h-3.5 md:w-3.5 mr-0.5 -mt-0.5" />
              0228 504 660 61
            </a>{" "}
            oder{" "}
            <a href="mailto:bonn@slt-rental.de" className="font-medium text-primary hover:underline underline-offset-2">
              bonn@slt-rental.de
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

export default BonnServiceHinweis;
