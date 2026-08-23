import { Card, CardContent } from "@/components/ui/card";
import { PhoneCall } from "lucide-react";

const BONN_B2B_PHONE = "+49 228 52263327";
const BONN_B2B_PHONE_HREF = "tel:+4922852263327";

interface BonnPriorityHotlineProps {
  /** assigned_location des B2B-Profils */
  location?: string | null;
  className?: string;
}

/**
 * Direkte B2B-Rufnummer Standort Bonn – ohne KI-Assistenz.
 * Wird ausschließlich im geschützten B2B-Portal für Geschäftskunden
 * mit Standort Bonn angezeigt.
 */
export function BonnPriorityHotline({ location, className }: BonnPriorityHotlineProps) {
  if ((location ?? "").toLowerCase() !== "bonn") return null;

  return (
    <Card className={`border-primary/40 bg-primary/5 ${className ?? ""}`}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <PhoneCall className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Direktleitung für Geschäftskunden · Standort Bonn
            </p>
            <a
              href={BONN_B2B_PHONE_HREF}
              className="block text-2xl sm:text-3xl font-bold text-foreground hover:text-primary transition-colors break-words"
            >
              {BONN_B2B_PHONE}
            </a>
            <p className="text-sm text-muted-foreground mt-1">
              Persönliche Beratung ohne KI-Assistenz – für Rückfragen und Angebotsberatung.
              Deine Anliegen werden hier priorisiert bearbeitet.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
