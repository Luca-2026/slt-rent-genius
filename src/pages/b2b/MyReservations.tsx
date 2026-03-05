import React, { useEffect, useMemo, useState } from "react";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { openInvoiceInNewWindow } from "@/utils/invoiceViewer";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Package, Calendar, MapPin, Clock, CheckCircle2, XCircle,
  FileText, Filter, RefreshCw, Download, Send, ThumbsUp, LogOut,
  ChevronDown, ChevronRight, Layers, Trash2, Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Reservation {
  id: string;
  product_id: string;
  product_name: string | null;
  category_slug: string | null;
  location: string;
  start_date: string;
  end_date: string | null;
  quantity: number;
  status: string;
  notes: string | null;
  original_price: number | null;
  discounted_price: number | null;
  created_at: string;
  rental_group_id?: string | null;
}

interface Offer {
  id: string;
  reservation_id: string | null;
  offer_number: string;
  offer_date: string;
  valid_until: string | null;
  status: string;
  gross_amount: number;
  file_url: string | null;
}

interface ReservationGroup {
  key: string;
  reservations: Reservation[];
  location: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  status: string;
  isBatch: boolean;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  pending: { label: "Ausstehend", variant: "secondary", icon: Clock },
  offer_sent: { label: "Angebot erhalten", variant: "outline", icon: Send },
  confirmed: { label: "Bestätigt", variant: "default", icon: CheckCircle2 },
  cancelled: { label: "Storniert", variant: "destructive", icon: XCircle },
  completed: { label: "Abgeschlossen", variant: "outline", icon: CheckCircle2 },
};

const locationLabels: Record<string, string> = {
  krefeld: "Krefeld",
  bonn: "Bonn",
};

/**
 * Group reservations by rental_group_id when available,
 * falling back to timestamp-based grouping for legacy data.
 */
function groupReservations(reservations: Reservation[]): ReservationGroup[] {
  if (reservations.length === 0) return [];

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

  const groups: ReservationGroup[] = [];

  // Groups with explicit rental_group_id
  for (const [, items] of grouped) {
    groups.push(buildGroup(items));
  }

  // Legacy: timestamp-based grouping for ungrouped items
  if (ungrouped.length > 0) {
    const sorted = [...ungrouped].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    let currentGroup: Reservation[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const prev = currentGroup[currentGroup.length - 1];
      const curr = sorted[i];
      const timeDiff = Math.abs(
        new Date(curr.created_at).getTime() - new Date(prev.created_at).getTime()
      );

      if (timeDiff <= 10000 && curr.location === prev.location) {
        currentGroup.push(curr);
      } else {
        groups.push(buildGroup(currentGroup));
        currentGroup = [curr];
      }
    }
    groups.push(buildGroup(currentGroup));
  }

  // Sort groups by newest first
  return groups.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function buildGroup(items: Reservation[]): ReservationGroup {
  const first = items[0];
  // Determine the "worst" status for display
  const statusPriority = ["pending", "offer_sent", "confirmed", "completed", "cancelled"];
  const groupStatus = items.reduce((worst, r) => {
    const wi = statusPriority.indexOf(worst);
    const ri = statusPriority.indexOf(r.status);
    return ri < wi ? r.status : worst;
  }, items[0].status);

  return {
    key: `${first.created_at}-${first.location}`,
    reservations: items,
    location: first.location,
    startDate: first.start_date,
    endDate: first.end_date,
    createdAt: first.created_at,
    status: groupStatus,
    isBatch: items.length > 1,
  };
}

export default function MyReservations() {
  const { user, b2bProfile } = useAuth();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [offerToAccept, setOfferToAccept] = useState<Offer | null>(null);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [reservationToReturn, setReservationToReturn] = useState<Reservation | null>(null);
  const [returningId, setReturningId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const [resResult, offersResult] = await Promise.all([
      supabase
        .from("b2b_reservations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("b2b_offers")
        .select("id, reservation_id, offer_number, offer_date, valid_until, status, gross_amount, file_url")
        .order("created_at", { ascending: false }),
    ]);

    if (!resResult.error && resResult.data) {
      setReservations(resResult.data);
    }
    if (!offersResult.error && offersResult.data) {
      setOffers(offersResult.data as Offer[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleAcceptOffer = async () => {
    if (!offerToAccept) return;
    setAcceptingOfferId(offerToAccept.id);
    try {
      const { data, error } = await supabase.functions.invoke("accept-offer", {
        body: { offer_id: offerToAccept.id },
      });
      if (error) throw error;

      toast({
        title: "Angebot bestätigt!",
        description: `Angebot ${offerToAccept.offer_number} wurde erfolgreich bestätigt.`,
      });
      setConfirmDialogOpen(false);
      setOfferToAccept(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Angebot konnte nicht bestätigt werden.",
        variant: "destructive",
      });
    } finally {
      setAcceptingOfferId(null);
    }
  };

  const handleReturnDevice = async () => {
    if (!reservationToReturn) return;
    setReturningId(reservationToReturn.id);
    try {
      const { data, error } = await supabase.functions.invoke("notify-device-return", {
        body: { reservation_id: reservationToReturn.id },
      });
      if (error) throw error;

      toast({
        title: "Gerät freigemeldet!",
        description: "Der Mietvorgang wurde beendet. Unser Team wurde benachrichtigt.",
      });
      setReturnDialogOpen(false);
      setReservationToReturn(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Freimeldung konnte nicht durchgeführt werden.",
        variant: "destructive",
      });
    } finally {
      setReturningId(null);
    }
  };

  const filtered = statusFilter === "all"
    ? reservations
    : reservations.filter((r) => r.status === statusFilter);

  const groups = useMemo(() => groupReservations(filtered), [filtered]);

  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });
  const formatCurrency = (n: number) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const pendingCount = reservations.filter((r) => r.status === "pending").length;
  const offerCount = reservations.filter((r) => r.status === "offer_sent").length;
  const confirmedCount = reservations.filter((r) => r.status === "confirmed").length;
  const totalCount = reservations.length;

  const getOfferForReservation = (reservationId: string) =>
    offers.find((o) => o.reservation_id === reservationId);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const renderOfferActions = (offer: Offer) => (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-primary">{offer.offer_number}</p>
      <p className="text-xs text-muted-foreground">
        {formatCurrency(offer.gross_amount)} brutto
        {offer.valid_until && ` · bis ${formatDate(offer.valid_until)}`}
      </p>
      <div className="flex items-center gap-1.5">
        {offer.file_url && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => openInvoiceInNewWindow(offer.file_url!, offer.offer_number)}
            className="h-7 text-xs px-2"
          >
            <Download className="h-3 w-3 mr-1" />
            PDF
          </Button>
        )}
        {offer.status === "sent" && (
          <Button
            size="sm"
            className="h-7 text-xs px-2 bg-accent text-accent-foreground hover:bg-cta-orange-hover"
            onClick={() => {
              setOfferToAccept(offer);
              setConfirmDialogOpen(true);
            }}
            disabled={acceptingOfferId === offer.id}
          >
            {acceptingOfferId === offer.id ? (
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <ThumbsUp className="h-3 w-3 mr-1" />
            )}
            Bestätigen
          </Button>
        )}
        {offer.status === "accepted" && (
          <Badge variant="default" className="text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Bestätigt
          </Badge>
        )}
      </div>
    </div>
  );

  const renderReservationRow = (r: Reservation, isSubRow = false) => {
    const cfg = statusConfig[r.status] || statusConfig.pending;
    const StatusIcon = cfg.icon;
    const offer = getOfferForReservation(r.id);

    return (
      <TableRow key={r.id} className={isSubRow ? "bg-muted/30" : ""}>
        <TableCell className={isSubRow ? "pl-10" : ""}>
          <div>
            <p className="font-medium">{r.product_name || r.product_id}</p>
            {r.category_slug && (
              <p className="text-xs text-muted-foreground">{r.category_slug}</p>
            )}
          </div>
        </TableCell>
        <TableCell>{locationLabels[r.location] || r.location}</TableCell>
        <TableCell>
          <div className="text-sm">
            <p>{formatDate(r.start_date)}</p>
            {r.end_date && (
              <p className="text-muted-foreground">bis {formatDate(r.end_date)}</p>
            )}
          </div>
        </TableCell>
        <TableCell className="text-center">{r.quantity}</TableCell>
        <TableCell>
          <Badge variant={cfg.variant} className="flex items-center gap-1 w-fit">
            <StatusIcon className="h-3 w-3" />
            {cfg.label}
          </Badge>
        </TableCell>
        <TableCell>
          {offer ? renderOfferActions(offer) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {formatDate(r.created_at)}
        </TableCell>
        <TableCell className="text-right">
          {r.status === "confirmed" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setReservationToReturn(r);
                setReturnDialogOpen(true);
              }}
              disabled={returningId === r.id}
            >
              {returningId === r.id ? (
                <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5 mr-1" />
              )}
              Freimelden
            </Button>
          )}
        </TableCell>
      </TableRow>
    );
  };

  const renderMobileCard = (r: Reservation) => {
    const cfg = statusConfig[r.status] || statusConfig.pending;
    const StatusIcon = cfg.icon;
    const offer = getOfferForReservation(r.id);

    return (
      <div key={r.id} className="space-y-2 py-2 border-b border-border last:border-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-sm">{r.product_name || r.product_id}</p>
            <p className="text-xs text-muted-foreground">{r.category_slug}</p>
          </div>
          <Badge variant={cfg.variant} className="flex items-center gap-1 text-xs">
            <StatusIcon className="h-3 w-3" />
            {cfg.label}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {locationLabels[r.location] || r.location}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(r.start_date)}
            {r.end_date && ` – ${formatDate(r.end_date)}`}
          </div>
        </div>
        {offer && (
          <div className="bg-primary/5 rounded-lg p-2">
            {renderOfferActions(offer)}
          </div>
        )}
        {r.status === "confirmed" && (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => {
              setReservationToReturn(r);
              setReturnDialogOpen(true);
            }}
            disabled={returningId === r.id}
          >
            {returningId === r.id ? (
              <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Wird freigemeldet...</>
            ) : (
              <><LogOut className="h-3.5 w-3.5 mr-1.5" />Gerät freimelden</>
            )}
          </Button>
        )}
      </div>
    );
  };

  return (
    <B2BPortalLayout title="Mietvorgänge" subtitle={`${totalCount} Mietvorgänge insgesamt`}>
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCount}</p>
              <p className="text-xs text-muted-foreground">Gesamt</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Ausstehend</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Send className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{offerCount}</p>
              <p className="text-xs text-muted-foreground">Angebote</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{confirmedCount}</p>
              <p className="text-xs text-muted-foreground">Bestätigt</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {reservations.filter((r) => r.status === "completed").length}
              </p>
              <p className="text-xs text-muted-foreground">Abgeschlossen</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="pending">Ausstehend</SelectItem>
              <SelectItem value="offer_sent">Angebot erhalten</SelectItem>
              <SelectItem value="confirmed">Bestätigt</SelectItem>
              <SelectItem value="completed">Abgeschlossen</SelectItem>
              <SelectItem value="cancelled">Storniert</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Aktualisieren
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Keine Mietvorgänge gefunden</h3>
            <p className="text-sm text-muted-foreground">
              {statusFilter !== "all"
                ? "Ändere den Filter, um weitere Mietvorgänge anzuzeigen."
                : "Du hast noch keine Anfragen gestellt. Stöbere im Produktkatalog."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {groups.map((group) => {
              const cfg = statusConfig[group.status] || statusConfig.pending;
              const StatusIcon = cfg.icon;
              const isExpanded = expandedGroups.has(group.key);

              if (!group.isBatch) {
                // Single reservation - render directly
                return (
                  <Card key={group.key}>
                    <CardContent className="p-4">
                      {renderMobileCard(group.reservations[0])}
                      <p className="text-xs text-muted-foreground mt-2">
                        Erstellt: {formatDate(group.createdAt)}
                      </p>
                    </CardContent>
                  </Card>
                );
              }

              // Batch reservation (Sammelanfrage)
              return (
                <Card key={group.key}>
                  <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(group.key)}>
                    <CollapsibleTrigger asChild>
                      <CardContent className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <Layers className="h-4 w-4 text-primary" />
                                <p className="font-semibold">
                                  Sammelanfrage ({group.reservations.length} Artikel)
                                </p>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {locationLabels[group.location] || group.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(group.startDate)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge variant={cfg.variant} className="flex items-center gap-1 text-xs shrink-0">
                            <StatusIcon className="h-3 w-3" />
                            {cfg.label}
                          </Badge>
                        </div>
                      </CardContent>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4 space-y-1">
                        {group.reservations.map((r) => renderMobileCard(r))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>

          {/* Desktop table */}
          <Card className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produkt</TableHead>
                  <TableHead>Standort</TableHead>
                  <TableHead>Zeitraum</TableHead>
                  <TableHead className="text-center">Menge</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Angebot</TableHead>
                  <TableHead>Erstellt</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => {
                  if (!group.isBatch) {
                    return renderReservationRow(group.reservations[0]);
                  }

                  const isExpanded = expandedGroups.has(group.key);
                  const cfg = statusConfig[group.status] || statusConfig.pending;
                  const StatusIcon = cfg.icon;
                  // Check if any reservation in group has an offer
                  const groupOffer = group.reservations
                    .map((r) => getOfferForReservation(r.id))
                    .find(Boolean);

                  return (
                    <React.Fragment key={group.key}>
                      {/* Group header row */}
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50 bg-muted/20"
                        onClick={() => toggleGroup(group.key)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div className="flex items-center gap-1.5">
                              <Layers className="h-4 w-4 text-primary" />
                              <span className="font-semibold">
                                Sammelanfrage ({group.reservations.length} Artikel)
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{locationLabels[group.location] || group.location}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{formatDate(group.startDate)}</p>
                            {group.endDate && (
                              <p className="text-muted-foreground">bis {formatDate(group.endDate)}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {group.reservations.reduce((sum, r) => sum + r.quantity, 0)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={cfg.variant} className="flex items-center gap-1 w-fit">
                            <StatusIcon className="h-3 w-3" />
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {groupOffer ? renderOfferActions(groupOffer) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(group.createdAt)}
                        </TableCell>
                        <TableCell />
                      </TableRow>

                      {/* Expanded sub-rows */}
                      {isExpanded &&
                        group.reservations.map((r) => renderReservationRow(r, true))
                      }
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

      {/* Confirm Offer Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-primary" />
              Angebot bestätigen
            </DialogTitle>
            <DialogDescription>
              Möchten Sie dieses Angebot verbindlich annehmen?
            </DialogDescription>
          </DialogHeader>
          {offerToAccept && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-primary">{offerToAccept.offer_number}</p>
                    <p className="text-lg font-bold">{formatCurrency(offerToAccept.gross_amount)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Angebotsdatum: {formatDate(offerToAccept.offer_date)}
                    {offerToAccept.valid_until && ` · Gültig bis: ${formatDate(offerToAccept.valid_until)}`}
                  </p>
                </CardContent>
              </Card>

              <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                <p>Mit der Bestätigung nehmen Sie das Angebot verbindlich an. Unser Team wird sich in Kürze bei Ihnen melden.</p>
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                  onClick={handleAcceptOffer}
                  disabled={acceptingOfferId === offerToAccept.id}
                >
                  {acceptingOfferId === offerToAccept.id ? (
                    <><RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />Wird bestätigt...</>
                  ) : (
                    <><ThumbsUp className="h-4 w-4 mr-1.5" />Angebot verbindlich annehmen</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Return Device Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-primary" />
              Gerät freimelden
            </DialogTitle>
            <DialogDescription>
              Möchten Sie dieses Mietgerät als zurückgegeben melden?
            </DialogDescription>
          </DialogHeader>
          {reservationToReturn && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-2">
                  <p className="font-semibold">{reservationToReturn.product_name || reservationToReturn.product_id}</p>
                  <p className="text-sm text-muted-foreground">
                    Standort: {locationLabels[reservationToReturn.location] || reservationToReturn.location}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Zeitraum: {formatDate(reservationToReturn.start_date)}
                    {reservationToReturn.end_date ? ` – ${formatDate(reservationToReturn.end_date)}` : ""}
                  </p>
                </CardContent>
              </Card>

              <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                <p>Mit der Freimeldung wird der Mietvorgang beendet und unser Team über die Rückgabe informiert.</p>
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                  onClick={handleReturnDevice}
                  disabled={returningId === reservationToReturn.id}
                >
                  {returningId === reservationToReturn.id ? (
                    <><RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />Wird freigemeldet...</>
                  ) : (
                    <><LogOut className="h-4 w-4 mr-1.5" />Gerät freimelden</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </B2BPortalLayout>
  );
}
