import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, RefreshCw, FileText, Send, Pencil, Trash2, Package } from "lucide-react";
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
  rental_group_id?: string | null;
}

interface B2BProfile {
  id: string;
  company_name: string;
  credit_limit: number;
}

interface Offer {
  id: string;
  offer_number: string;
  reservation_id: string | null;
  b2b_profile_id: string;
  delivery_cost: number;
  notes: string | null;
  status: string;
}

interface OfferItem {
  id: string;
  offer_id: string;
  product_name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  discount_percent: number;
}

interface Props {
  reservations: Reservation[];
  profiles: B2BProfile[];
  offers: Offer[];
  offerItems: OfferItem[];
  onCreateOffer: (reservation: Reservation) => void;
  onEditOffer: (offer: Offer, items: OfferItem[]) => void;
  onResendOffer: (offer: Offer) => void;
  onDeleteReservation?: (reservation: Reservation) => void;
  onRefresh: () => void;
  resendingId: string | null;
  deletingId?: string | null;
}

interface GroupedEntry {
  key: string;
  reservations: Reservation[];
  primary: Reservation;
  isGroup: boolean;
}

export function AdminReservationsTab({
  reservations,
  profiles,
  offers,
  offerItems,
  onCreateOffer,
  onEditOffer,
  onResendOffer,
  onDeleteReservation,
  onRefresh,
  resendingId,
  deletingId,
}: Props) {
  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });
  const formatCurrency = (n: number) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  // Group reservations by rental_group_id
  const groupedEntries: GroupedEntry[] = (() => {
    const grouped = new Map<string, Reservation[]>();
    const ungrouped: Reservation[] = [];

    for (const res of reservations) {
      if (res.rental_group_id) {
        const existing = grouped.get(res.rental_group_id) || [];
        existing.push(res);
        grouped.set(res.rental_group_id, existing);
      } else {
        ungrouped.push(res);
      }
    }

    const entries: GroupedEntry[] = [];

    for (const [key, group] of grouped) {
      entries.push({
        key,
        reservations: group,
        primary: group[0],
        isGroup: group.length > 1,
      });
    }

    for (const res of ungrouped) {
      entries.push({
        key: res.id,
        reservations: [res],
        primary: res,
        isGroup: false,
      });
    }

    // Sort by created_at descending
    entries.sort((a, b) => new Date(b.primary.created_at).getTime() - new Date(a.primary.created_at).getTime());

    return entries;
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Offene Angebote</h2>
          <p className="text-sm text-muted-foreground">Angebote einsehen und verwalten</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {groupedEntries.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle2 className="h-10 w-10 mx-auto text-primary/30 mb-3" />
            <p className="font-medium text-foreground">Alles erledigt!</p>
            <p className="text-sm text-muted-foreground mt-1">Keine offenen Angebote vorhanden.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {groupedEntries.map((entry) => {
            const { primary, reservations: groupRes, isGroup } = entry;
            const profile = profiles.find((p) => p.id === primary.b2b_profile_id);
            const isNewOrNoCreditLimit = !profile || (profile as any).credit_limit === 0;
            
            // Check if any reservation in the group already has an offer
            const existingOffer = offers.find((o) => 
              groupRes.some((r) => o.reservation_id === r.id)
            );
            const existingOfferItemsList = existingOffer
              ? offerItems.filter((i) => i.offer_id === existingOffer.id)
              : [];
            const hasOffer = groupRes.some((r) => r.status === "offer_sent") && existingOffer;

            return (
              <Card key={entry.key} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Header with badge */}
                      <div className="flex items-center gap-2 mb-2">
                        {isGroup && (
                          <Badge variant="outline" className="shrink-0 text-xs">
                            <Package className="h-3 w-3 mr-1" />
                            {groupRes.length} Artikel
                          </Badge>
                        )}
                        {hasOffer ? (
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

                      {/* Customer & Location */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span>
                          <span className="text-xs text-muted-foreground/70">Kunde:</span>{" "}
                          <span className="font-medium text-foreground">{profile?.company_name || "—"}</span>
                        </span>
                        <span>
                          <span className="text-xs text-muted-foreground/70">Standort:</span>{" "}
                          <span className="capitalize">{primary.location}</span>
                        </span>
                      </div>

                      {/* Items list */}
                      <div className="space-y-1.5">
                        {groupRes.map((res) => (
                          <div key={res.id} className={`text-sm ${isGroup ? "pl-3 border-l-2 border-muted" : ""}`}>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground truncate">
                                {res.product_name || res.product_id}
                              </span>
                              <span className="text-muted-foreground text-xs">×{res.quantity}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(res.start_date)}
                              {res.end_date ? ` – ${formatDate(res.end_date)}` : ""}
                              {res.original_price != null && (
                                <>
                                  {" · "}
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
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {hasOffer && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Angebot: <span className="font-medium text-foreground">{existingOffer.offer_number}</span>
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 shrink-0 w-full md:w-auto">
                      {hasOffer ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditOffer(existingOffer, existingOfferItemsList)}
                            className="h-10 sm:h-9 flex-1 md:flex-none"
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Angebot ändern
                          </Button>
                          <Button
                            size="sm"
                            className="bg-accent text-accent-foreground hover:bg-cta-orange-hover h-10 sm:h-9 flex-1 md:flex-none"
                            onClick={() => onResendOffer(existingOffer)}
                            disabled={resendingId === existingOffer.id}
                          >
                            <Send className="h-3.5 w-3.5 mr-1" />
                            {resendingId === existingOffer.id ? "Wird gesendet..." : "Erneut senden"}
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-accent text-accent-foreground hover:bg-cta-orange-hover h-10 sm:h-9 flex-1 md:flex-none"
                          onClick={() => onCreateOffer(primary)}
                        >
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          Angebot erstellen
                        </Button>
                      )}
                      {onDeleteReservation && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            // Delete all reservations in the group
                            groupRes.forEach((r) => onDeleteReservation(r));
                          }}
                          disabled={groupRes.some((r) => deletingId === r.id)}
                          className="h-10 sm:h-9"
                        >
                          {groupRes.some((r) => deletingId === r.id) ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
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
