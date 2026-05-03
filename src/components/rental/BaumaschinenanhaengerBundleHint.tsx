import { Link } from "react-router-dom";
import { Truck } from "lucide-react";

interface Props {
  locationId: string;
  className?: string;
  variant?: "banner" | "compact";
}

/**
 * Kompakter Hinweis: Bundle-Paket „Baumaschine + Baumaschinenanhänger" für Selbstabholer.
 * Verlinkt auf die Anhänger-Kategorie mit vorausgewähltem Filter `?type=baumaschine`.
 */
export function BaumaschinenanhaengerBundleHint({ locationId, className, variant = "banner" }: Props) {
  const trailerLink = `/mieten/${locationId}/anhaenger?type=baumaschine`;

  if (variant === "compact") {
    return (
      <div
        className={`flex items-start gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-xs ${className ?? ""}`}
      >
        <Truck className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
        <p className="text-foreground leading-snug">
          <strong>Selbstabholer-Tipp:</strong> Im Buchungsprozess kannst du einen passenden{" "}
          <Link to={trailerLink} className="font-semibold text-accent hover:underline">
            Baumaschinenanhänger (1.800 / 3.500 kg)
          </Link>{" "}
          zum vergünstigten Bundle-Preis dazubuchen.
        </p>
      </div>
    );
  }

  return (
    <section className={className}>
      <div className="section-container py-3">
        <div className="flex items-center gap-3 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 sm:px-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/20">
            <Truck className="h-4 w-4 text-accent" />
          </div>
          <p className="flex-1 text-sm text-foreground leading-snug">
            <strong>Selbstabholer-Tipp:</strong> Im Buchungsprozess kannst du einen passenden{" "}
            <Link to={trailerLink} className="font-semibold text-accent hover:underline">
              Baumaschinenanhänger (1.800 / 3.500 kg)
            </Link>{" "}
            zum vergünstigten Bundle-Preis dazubuchen.
          </p>
        </div>
      </div>
    </section>
  );
}
