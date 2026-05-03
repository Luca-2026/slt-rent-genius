import { Link } from "react-router-dom";
import { Truck, Tag, ArrowRight } from "lucide-react";

interface Props {
  locationId: string;
  className?: string;
  variant?: "banner" | "compact";
}

/**
 * Hinweis-Banner: Bundle-Paket „Baumaschine + Baumaschinenanhänger" für Selbstabholer.
 * Wird auf Kategorie-Seiten Arbeitsbühnen / Erdbewegung sowie auf den jeweiligen
 * Produktdetail-Seiten angezeigt.
 */
export function BaumaschinenanhaengerBundleHint({ locationId, className, variant = "banner" }: Props) {
  const trailerLink = `/mieten/${locationId}/anhaenger`;

  if (variant === "compact") {
    return (
      <Link
        to={trailerLink}
        className={`group flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/10 p-4 transition hover:border-accent hover:bg-accent/15 ${className ?? ""}`}
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent/20">
          <Truck className="h-5 w-5 text-accent" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-headline">
            Bundle-Tipp für Selbstabholer: Baumaschinenanhänger günstig dazubuchen
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Im Buchungsprozess kannst du einen passenden 1.800 kg oder 3.500 kg Baumaschinenanhänger als Bundle-Paket zu einem deutlich vergünstigten Tagespreis hinzufügen – ideal, wenn du dein Mietgerät selbst abholst.
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent group-hover:underline">
            Zu den Anhängern <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <section className={`bg-accent/10 border-y border-accent/30 ${className ?? ""}`}>
      <div className="section-container py-5">
        <div className="flex flex-col gap-4 rounded-xl border border-accent/40 bg-card p-4 sm:p-5 md:flex-row md:items-center md:gap-5">
          <div className="flex flex-shrink-0 items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
              <Truck className="h-6 w-6 text-accent" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent md:hidden">
              <Tag className="h-3 w-3" /> Bundle-Paket
            </span>
          </div>
          <div className="flex-1">
            <div className="mb-1 hidden items-center gap-2 md:flex">
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                <Tag className="h-3 w-3" /> Bundle-Paket für Selbstabholer
              </span>
            </div>
            <p className="text-base font-semibold text-headline">
              Baumaschinenanhänger günstig dazubuchen
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Du holst dein Mietgerät selbst ab? Dann kannst du im Buchungsprozess einen passenden{" "}
              <strong className="text-foreground">1.800 kg oder 3.500 kg Baumaschinenanhänger</strong> zum
              vergünstigten Bundle-Preis hinzufügen – inklusive Auf- und Abladen vor Ort. Spart dir Anhänger-Suche, Zeit und Geld.
            </p>
          </div>
          <Link
            to={trailerLink}
            className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90"
          >
            Anhänger ansehen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
