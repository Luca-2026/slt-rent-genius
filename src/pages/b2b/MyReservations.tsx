import { useEffect, useState } from "react";
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
  Package, Calendar, MapPin, Clock, CheckCircle2, XCircle,
  FileText, Filter, RefreshCw, Download, Send, ThumbsUp,
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
        description: `Angebot ${offerToAccept.offer_number} wurde erfolgreich bestätigt. Wir melden uns in Kürze bei Ihnen.`,
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

  const filtered = statusFilter === "all"
    ? reservations
    : reservations.filter((r) => r.status === statusFilter);

  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });

  const formatCurrency = (n: number) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const pendingCount = reservations.filter((r) => r.status === "pending").length;
  const offerCount = reservations.filter((r) => r.status === "offer_sent").length;
  const confirmedCount = reservations.filter((r) => r.status === "confirmed").length;
  const totalCount = reservations.length;

  const getOfferForReservation = (reservationId: string) =>
    offers.find((o) => o.reservation_id === reservationId);

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

  return (
    <B2BPortalLayout title="Meine Anfragen" subtitle={`${totalCount} Anfragen insgesamt`}>
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Keine Anfragen gefunden</h3>
            <p className="text-sm text-muted-foreground">
              {statusFilter !== "all"
                ? "Ändere den Filter, um weitere Anfragen anzuzeigen."
                : "Du hast noch keine Anfragen gestellt. Stöbere im Produktkatalog."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((r) => {
              const cfg = statusConfig[r.status] || statusConfig.pending;
              const StatusIcon = cfg.icon;
              const offer = getOfferForReservation(r.id);
              return (
                <Card key={r.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{r.product_name || r.product_id}</p>
                        <p className="text-xs text-muted-foreground">{r.category_slug}</p>
                      </div>
                      <Badge variant={cfg.variant} className="flex items-center gap-1">
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
                      </div>
                    </div>
                    {offer && (
                      <div className="bg-primary/5 rounded-lg p-3">
                        {renderOfferActions(offer)}
                      </div>
                    )}
                    {r.notes && (
                      <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                        {r.notes}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Erstellt: {formatDate(r.created_at)}
                    </p>
                  </CardContent>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const cfg = statusConfig[r.status] || statusConfig.pending;
                  const StatusIcon = cfg.icon;
                  const offer = getOfferForReservation(r.id);
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
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
                    </TableRow>
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
                <p>Mit der Bestätigung nehmen Sie das Angebot verbindlich an. Unser Team wird sich in Kürze bei Ihnen melden, um die Details zu klären.</p>
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
    </B2BPortalLayout>
  );
}
