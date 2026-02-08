import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Plus, RefreshCw, FileText, Send } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Reservation {
  id: string;
  product_name: string | null;
  product_id: string;
  location: string;
  start_date: string;
  end_date: string | null;
  quantity: number;
  status: string;
  original_price: number | null;
  discounted_price: number | null;
  b2b_profile_id: string;
  notes: string | null;
  created_at: string;
}

interface B2BProfile {
  id: string;
  company_name: string;
  credit_limit: number;
}

interface Props {
  reservations: Reservation[];
  profiles: B2BProfile[];
  onCreateReservation: () => void;
  onCreateOffer: (reservation: Reservation) => void;
  onRefresh: () => void;
}

export function AdminReservationsTab({
  reservations,
  profiles,
  onCreateReservation,
  onCreateOffer,
  onRefresh,
}: Props) {
  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });
  const formatCurrency = (n: number) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Offene Anfragen</h2>
          <p className="text-sm text-muted-foreground">Anfragen bearbeiten und Angebote erstellen</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onCreateReservation}
            className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Neue Anfrage
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle2 className="h-10 w-10 mx-auto text-primary/30 mb-3" />
            <p className="font-medium text-foreground">Alles erledigt!</p>
            <p className="text-sm text-muted-foreground mt-1">Keine offenen Anfragen vorhanden.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reservations.map((res) => {
            const profile = profiles.find((p) => p.id === res.b2b_profile_id);
            const isNewOrNoCreditLimit = !profile || (profile as any).credit_limit === 0;

            return (
              <Card key={res.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-1.5">
                         <p className="font-semibold text-foreground truncate">
                           {res.product_name || res.product_id}
                         </p>
                         {res.status === "offer_sent" ? (
                           <Badge variant="outline" className="shrink-0 text-primary border-primary">
                             <Send className="h-3 w-3 mr-1" />
                             Angebot gesendet
                           </Badge>
                         ) : (
                           <Badge variant="secondary" className="shrink-0">
                             <Clock className="h-3 w-3 mr-1" />
                             Ausstehend
                           </Badge>
                         )}
                         {isNewOrNoCreditLimit && (
                           <Badge variant="outline" className="shrink-0 text-amber-600 border-amber-300 text-xs">
                             Kein Kreditlimit
                           </Badge>
                         )}
                       </div>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                         <span>
                           <span className="text-xs text-muted-foreground/70">Kunde:</span>{" "}
                           <span className="font-medium text-foreground">{profile?.company_name || "—"}</span>
                         </span>
                         <span>
                           <span className="text-xs text-muted-foreground/70">Standort:</span>{" "}
                           <span className="capitalize">{res.location}</span>
                         </span>
                         <span>
                           <span className="text-xs text-muted-foreground/70">Zeitraum:</span>{" "}
                           {formatDate(res.start_date)}
                           {res.end_date ? ` – ${formatDate(res.end_date)}` : ""}
                         </span>
                         <span>
                           <span className="text-xs text-muted-foreground/70">Menge:</span> {res.quantity}
                         </span>
                       </div>
                       {res.original_price != null && (
                         <p className="text-sm mt-1">
                           <span className="text-muted-foreground/70 text-xs">Preis:</span>{" "}
                           {formatCurrency(res.original_price)}
                           {res.discounted_price != null &&
                             res.discounted_price !== res.original_price && (
                               <>
                                 {" → "}
                                 <span className="text-accent font-medium">
                                   {formatCurrency(res.discounted_price)}
                                 </span>
                               </>
                             )}
                         </p>
                       )}
                     </div>
                     <div className="flex gap-2 shrink-0">
                       <Button
                         size="sm"
                         className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                         onClick={() => onCreateOffer(res)}
                       >
                         <FileText className="h-3.5 w-3.5 mr-1" />
                         Angebot erstellen
                       </Button>
                     </div>
                   </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
