import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Eye, FileText, Pencil, Receipt, RefreshCw, Send, ClipboardCheck, CreditCard, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export interface Offer {
  id: string;
  offer_number: string;
  offer_date: string;
  valid_until: string | null;
  status: string;
  net_amount: number;
  vat_amount: number;
  gross_amount: number;
  delivery_cost: number;
  is_reverse_charge: boolean;
  notes: string | null;
  file_url: string | null;
  file_name: string | null;
  email_sent: boolean;
  b2b_profile_id: string;
  reservation_id: string | null;
  created_at: string;
}

export interface OfferItem {
  id: string;
  offer_id: string;
  product_name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  total_price: number;
  rental_start: string | null;
  rental_end: string | null;
}

interface B2BProfile {
  id: string;
  company_name: string;
  credit_limit: number;
}

interface Props {
  offers: Offer[];
  offerItems: OfferItem[];
  profiles: B2BProfile[];
  onEditOffer: (offer: Offer, items: OfferItem[]) => void;
  onResendOffer: (offer: Offer) => void;
  onViewOffer: (fileUrl: string, offerNumber: string) => void;
  onCreateInvoice: (offer: Offer) => void;
  onCreateProformaInvoice: (offer: Offer) => void;
  onCreateDeliveryNote: (offer: Offer) => void;
  onDelete: (offerId: string) => void;
  resendingId: string | null;
  onRefresh: () => void;
}

export function AdminOffersTab({
  offers,
  offerItems,
  profiles,
  onEditOffer,
  onResendOffer,
  onViewOffer,
  onCreateInvoice,
  onCreateProformaInvoice,
  onCreateDeliveryNote,
  onDelete,
  resendingId,
  onRefresh,
}: Props) {
  const [deleteConfirmOffer, setDeleteConfirmOffer] = useState<Offer | null>(null);
  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });
  const formatCurrency = (n: number) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const statusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge variant="outline" className="text-primary border-primary"><Send className="h-3 w-3 mr-1" />Gesendet</Badge>;
      case "accepted":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Angenommen</Badge>;
      case "expired":
        return <Badge variant="secondary">Abgelaufen</Badge>;
      case "revised":
        return <Badge variant="secondary" className="text-muted-foreground">Überarbeitet</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Alle Angebote</h2>
          <p className="text-sm text-muted-foreground">Angebote einsehen, bearbeiten und erneut versenden</p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Aktualisieren
        </Button>
      </div>

      {offers.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-medium text-foreground">Noch keine Angebote</p>
            <p className="text-sm text-muted-foreground mt-1">
              Angebote werden aus offenen Anfragen erstellt.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Angebotsnr.</TableHead>
                  <TableHead>Kunde</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Gültig bis</TableHead>
                  <TableHead className="text-right">Brutto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => {
                  const profile = profiles.find((p) => p.id === offer.b2b_profile_id);
                  const items = offerItems.filter((i) => i.offer_id === offer.id);
                  const isNoCreditLimit = !profile || profile.credit_limit === 0;
                  return (
                    <TableRow key={offer.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{offer.offer_number}</p>
                          {offer.is_reverse_charge && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">RC</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{profile?.company_name || "–"}</TableCell>
                      <TableCell className="text-sm">{formatDate(offer.offer_date)}</TableCell>
                      <TableCell className="text-sm">
                        {offer.valid_until ? formatDate(offer.valid_until) : "–"}
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm">
                        {formatCurrency(offer.gross_amount)}
                      </TableCell>
                      <TableCell>{statusBadge(offer.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {offer.file_url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onViewOffer(offer.file_url!, offer.offer_number)}
                              title="Angebot ansehen"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {offer.status === "accepted" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onCreateDeliveryNote(offer)}
                                title="Übergabeprotokoll erstellen"
                                className="text-green-600"
                              >
                                <ClipboardCheck className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onCreateInvoice(offer)}
                                title="Rechnung erstellen"
                                className="text-primary"
                              >
                                <Receipt className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {(offer.status === "sent" || offer.status === "accepted") && isNoCreditLimit && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onCreateProformaInvoice(offer)}
                              title="Proforma-Rechnung (Vorkasse)"
                              className="text-amber-600"
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEditOffer(offer, items)}
                            title="Angebot bearbeiten"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onResendOffer(offer)}
                            disabled={resendingId === offer.id}
                            title="Erneut senden"
                          >
                            {resendingId === offer.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => setDeleteConfirmOffer(offer)}
                            title="Angebot löschen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmOffer} onOpenChange={(open) => !open && setDeleteConfirmOffer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Angebot löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie das Angebot <strong>{deleteConfirmOffer?.offer_number}</strong> unwiderruflich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirmOffer) {
                  onDelete(deleteConfirmOffer.id);
                  setDeleteConfirmOffer(null);
                }
              }}
            >
              Endgültig löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
