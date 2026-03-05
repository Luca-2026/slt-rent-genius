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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  FileText, RefreshCw, Download, Send, ThumbsUp, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Offer {
  id: string;
  reservation_id: string | null;
  offer_number: string;
  offer_date: string;
  valid_until: string | null;
  status: string;
  gross_amount: number;
  net_amount: number;
  vat_amount: number;
  file_url: string | null;
  notes: string | null;
  created_at: string;
}

interface OfferItem {
  id: string;
  offer_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  total_price: number;
  rental_start: string | null;
  rental_end: string | null;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Send }> = {
  draft: { label: "Entwurf", variant: "secondary", icon: Clock },
  sent: { label: "Erhalten", variant: "default", icon: Send },
  accepted: { label: "Angenommen", variant: "default", icon: CheckCircle2 },
  rejected: { label: "Abgelehnt", variant: "destructive", icon: XCircle },
};

function B2BOffers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offerItems, setOfferItems] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [offerToAccept, setOfferToAccept] = useState<Offer | null>(null);
  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const [offersRes, itemsRes] = await Promise.all([
      supabase
        .from("b2b_offers")
        .select("id, reservation_id, offer_number, offer_date, valid_until, status, gross_amount, net_amount, vat_amount, file_url, notes, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("b2b_offer_items")
        .select("*"),
    ]);
    if (offersRes.data) setOffers(offersRes.data as Offer[]);
    if (itemsRes.data) setOfferItems(itemsRes.data as OfferItem[]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleAcceptOffer = async () => {
    if (!offerToAccept) return;
    setAcceptingOfferId(offerToAccept.id);
    try {
      const { error } = await supabase.functions.invoke("accept-offer", {
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
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } finally {
      setAcceptingOfferId(null);
    }
  };

  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });
  const formatCurrency = (n: number) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const getItemsForOffer = (offerId: string) =>
    offerItems.filter((i) => i.offer_id === offerId);

  const sentCount = offers.filter((o) => o.status === "sent").length;
  const acceptedCount = offers.filter((o) => o.status === "accepted").length;

  return (
    <B2BPortalLayout title="Meine Angebote" subtitle={`${offers.length} Angebote insgesamt`}>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{offers.length}</p>
              <p className="text-xs text-muted-foreground">Gesamt</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Send className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sentCount}</p>
              <p className="text-xs text-muted-foreground">Offen</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{acceptedCount}</p>
              <p className="text-xs text-muted-foreground">Angenommen</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Aktualisieren
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : offers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Keine Angebote vorhanden</h3>
            <p className="text-sm text-muted-foreground">
              Sie haben noch keine Angebote erhalten.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {offers.map((offer) => {
              const cfg = statusConfig[offer.status] || statusConfig.sent;
              const StatusIcon = cfg.icon;
              const items = getItemsForOffer(offer.id);
              return (
                <Card key={offer.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-primary">{offer.offer_number}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(offer.offer_date)}</p>
                      </div>
                      <Badge variant={cfg.variant} className="flex items-center gap-1 text-xs">
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </Badge>
                    </div>

                    {items.length > 0 && (
                      <div className="space-y-1 text-sm">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <span>{item.quantity}x {item.product_name}</span>
                            <span className="text-muted-foreground">{formatCurrency(item.total_price)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <p className="font-bold">{formatCurrency(offer.gross_amount)} brutto</p>
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
                            className="h-7 text-xs px-2 bg-accent text-accent-foreground hover:bg-accent/80"
                            onClick={() => {
                              setOfferToAccept(offer);
                              setConfirmDialogOpen(true);
                            }}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Annehmen
                          </Button>
                        )}
                      </div>
                    </div>
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
                  <TableHead>Angebotsnr.</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Positionen</TableHead>
                  <TableHead>Gültig bis</TableHead>
                  <TableHead>Betrag (brutto)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => {
                  const cfg = statusConfig[offer.status] || statusConfig.sent;
                  const StatusIcon = cfg.icon;
                  const items = getItemsForOffer(offer.id);
                  return (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium text-primary">{offer.offer_number}</TableCell>
                      <TableCell>{formatDate(offer.offer_date)}</TableCell>
                      <TableCell>
                        <div className="space-y-0.5 text-sm">
                          {items.slice(0, 3).map((item) => (
                            <p key={item.id}>{item.quantity}x {item.product_name}</p>
                          ))}
                          {items.length > 3 && (
                            <p className="text-muted-foreground">+{items.length - 3} weitere</p>
                          )}
                          {items.length === 0 && <span className="text-muted-foreground">—</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {offer.valid_until ? formatDate(offer.valid_until) : "—"}
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(offer.gross_amount)}</TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant} className="flex items-center gap-1 w-fit">
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
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
                              className="h-7 text-xs px-2 bg-accent text-accent-foreground hover:bg-accent/80"
                              onClick={() => {
                                setOfferToAccept(offer);
                                setConfirmDialogOpen(true);
                              }}
                            >
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              Annehmen
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

      {/* Confirm Dialog */}
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
                  className="bg-accent text-accent-foreground hover:bg-accent/80"
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

export default B2BOffers;
