import React, { useEffect, useMemo, useState } from "react";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Package, Calendar, MapPin,
  ChevronDown, ChevronRight, Layers,
} from "lucide-react";
import {
  AcceptOfferDialog,
  ReturnDeviceDialog,
  DeleteReservationDialog,
} from "@/components/b2b/reservations/MyReservationDialogs";
import { format } from "date-fns";
import { de } from "date-fns/locale";

// Phase A2 Schritt 1 — types + grouping helpers
import {
  statusConfig,
  locationLabels,
  groupReservations,
  type Reservation,
  type Offer,
} from "@/components/b2b/reservations/reservationUtils";
// Phase A2 Schritt 3 — row + mobile card + offer actions
import {
  ReservationRow,
  ReservationMobileCard,
  OfferActions,
} from "@/components/b2b/reservations/MyReservationRow";
// Phase A2 Schritt 4 — stats grid + filter toolbar
import {
  MyReservationsStats,
  MyReservationsFilterBar,
} from "@/components/b2b/reservations/MyReservationsHeader";


export default function MyReservations() {
  const { user } = useAuth();
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);

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
        .neq("status", "draft")
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
    if (!offerToAccept || !signatureData) return;
    setAcceptingOfferId(offerToAccept.id);
    try {
      const { error } = await supabase.functions.invoke("accept-offer", {
        body: { offer_id: offerToAccept.id, signature_data: signatureData },
      });
      if (error) throw error;

      toast({
        title: "Angebot bestätigt!",
        description: `Angebot ${offerToAccept.offer_number} wurde erfolgreich unterschrieben und bestätigt.`,
      });
      setConfirmDialogOpen(false);
      setOfferToAccept(null);
      setSignatureData(null);
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
      const { error } = await supabase.functions.invoke("notify-device-return", {
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

  const handleDeleteReservation = async () => {
    if (!reservationToDelete) return;
    setDeletingId(reservationToDelete.id);
    try {
      const { error } = await supabase
        .from("b2b_reservations")
        .delete()
        .eq("id", reservationToDelete.id);
      if (error) throw error;
      toast({ title: "Anfrage gelöscht", description: "Die Mietanfrage wurde erfolgreich gelöscht." });
      setDeleteDialogOpen(false);
      setReservationToDelete(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Fehler", description: error.message || "Anfrage konnte nicht gelöscht werden.", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = statusFilter === "all"
    ? reservations
    : reservations.filter((r) => r.status === statusFilter);

  const groups = useMemo(() => groupReservations(filtered), [filtered]);

  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });

  const pendingCount = reservations.filter((r) => r.status === "pending").length;
  const offerCount = reservations.filter((r) => r.status === "offer_sent").length;
  const confirmedCount = reservations.filter((r) => r.status === "confirmed").length;
  const completedCount = reservations.filter((r) => r.status === "completed").length;
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

  // Stable handlers passed to extracted row/card components.
  const handleRequestAcceptOffer = (offer: Offer) => {
    setOfferToAccept(offer);
    setSignatureData(null);
    setConfirmDialogOpen(true);
  };
  const handleRequestReturn = (reservation: Reservation) => {
    setReservationToReturn(reservation);
    setReturnDialogOpen(true);
  };
  const handleRequestDelete = (reservation: Reservation) => {
    setReservationToDelete(reservation);
    setDeleteDialogOpen(true);
  };

  return (
    <B2BPortalLayout title="Mietvorgänge" subtitle={`${totalCount} Mietvorgänge insgesamt`}>
      {/* Phase A2 Schritt 4: Stats extracted */}
      <MyReservationsStats
        totalCount={totalCount}
        pendingCount={pendingCount}
        offerCount={offerCount}
        confirmedCount={confirmedCount}
        completedCount={completedCount}
      />

      {/* Phase A2 Schritt 4: Filter toolbar extracted */}
      <MyReservationsFilterBar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onRefresh={fetchData}
        loading={loading}
      />

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
                const r = group.reservations[0];
                return (
                  <Card key={group.key}>
                    <CardContent className="p-4">
                      <ReservationMobileCard
                        reservation={r}
                        offer={getOfferForReservation(r.id)}
                        acceptingOfferId={acceptingOfferId}
                        returningId={returningId}
                        deletingId={deletingId}
                        onAcceptOffer={handleRequestAcceptOffer}
                        onReturnDevice={handleRequestReturn}
                        onDeleteReservation={handleRequestDelete}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Erstellt: {formatDate(group.createdAt)}
                      </p>
                    </CardContent>
                  </Card>
                );
              }

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
                        {group.reservations.map((r) => (
                          <ReservationMobileCard
                            key={r.id}
                            reservation={r}
                            offer={getOfferForReservation(r.id)}
                            acceptingOfferId={acceptingOfferId}
                            returningId={returningId}
                            deletingId={deletingId}
                            onAcceptOffer={handleRequestAcceptOffer}
                            onReturnDevice={handleRequestReturn}
                            onDeleteReservation={handleRequestDelete}
                          />
                        ))}
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
                    const r = group.reservations[0];
                    return (
                      <ReservationRow
                        key={r.id}
                        reservation={r}
                        offer={getOfferForReservation(r.id)}
                        acceptingOfferId={acceptingOfferId}
                        returningId={returningId}
                        deletingId={deletingId}
                        onAcceptOffer={handleRequestAcceptOffer}
                        onReturnDevice={handleRequestReturn}
                        onDeleteReservation={handleRequestDelete}
                      />
                    );
                  }

                  const isExpanded = expandedGroups.has(group.key);
                  const cfg = statusConfig[group.status] || statusConfig.pending;
                  const StatusIcon = cfg.icon;
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
                          {groupOffer ? (
                            <OfferActions
                              offer={groupOffer}
                              acceptingOfferId={acceptingOfferId}
                              onAcceptOffer={handleRequestAcceptOffer}
                            />
                          ) : (
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
                        group.reservations.map((r) => (
                          <ReservationRow
                            key={r.id}
                            reservation={r}
                            offer={getOfferForReservation(r.id)}
                            isSubRow
                            acceptingOfferId={acceptingOfferId}
                            returningId={returningId}
                            deletingId={deletingId}
                            onAcceptOffer={handleRequestAcceptOffer}
                            onReturnDevice={handleRequestReturn}
                            onDeleteReservation={handleRequestDelete}
                          />
                        ))
                      }
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

      {/* Phase A2: dialogs extracted to MyReservationDialogs.tsx — identical behavior */}
      <AcceptOfferDialog
        open={confirmDialogOpen}
        onOpenChange={(open) => {
          setConfirmDialogOpen(open);
          if (!open) setOfferToAccept(null);
        }}
        offer={offerToAccept}
        signatureData={signatureData}
        onSignatureChange={setSignatureData}
        onAccept={handleAcceptOffer}
        acceptingOfferId={acceptingOfferId}
      />

      <ReturnDeviceDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        reservation={reservationToReturn}
        onConfirm={handleReturnDevice}
        returningId={returningId}
      />

      <DeleteReservationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        reservation={reservationToDelete}
        onConfirm={handleDeleteReservation}
        deletingId={deletingId}
      />

    </B2BPortalLayout>
  );
}
