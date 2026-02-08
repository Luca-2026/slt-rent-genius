import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { openInvoiceInNewWindow } from "@/utils/invoiceViewer";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CalendarPlus, Check, ClipboardCheck, Eye, Package, Plus, Receipt, RefreshCw, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
}

interface Offer {
  id: string;
  reservation_id: string | null;
}

interface DocumentInfo {
  id: string;
  file_url: string | null;
  number: string;
  reservation_id: string | null;
  offer_id?: string | null;
}

interface Props {
  reservations: Reservation[];
  profiles: B2BProfile[];
  invoices: { id: string; file_url: string | null; invoice_number: string; reservation_id: string | null }[];
  offers: Offer[];
  onCreateReservation: () => void;
  onExtendReservation: (reservation: Reservation) => void;
  onGenerateInvoice: (reservation: Reservation) => void;
  onCreateReturnProtocol: (reservation: Reservation) => void;
  onDelete: (reservationId: string) => void;
  hasInvoice: (reservationId: string) => boolean;
  hasReturnProtocol: (reservationId: string) => boolean;
  onRefresh: () => void;
}

export function AdminRentalsTab({
  reservations,
  profiles,
  invoices,
  offers,
  onCreateReservation,
  onExtendReservation,
  onGenerateInvoice,
  onCreateReturnProtocol,
  onDelete,
  hasInvoice,
  hasReturnProtocol,
  onRefresh,
}: Props) {
  const { toast } = useToast();
  const [deleteConfirmRes, setDeleteConfirmRes] = useState<Reservation | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState<DocumentInfo[]>([]);
  const [returnProtocols, setReturnProtocols] = useState<DocumentInfo[]>([]);

  useEffect(() => {
    const fetchDocs = async () => {
      const [dnRes, rpRes] = await Promise.all([
        supabase.from("b2b_delivery_notes").select("id, file_url, delivery_note_number, reservation_id, offer_id"),
        supabase.from("b2b_return_protocols").select("id, file_url, return_protocol_number, reservation_id"),
      ]);
      if (dnRes.data) setDeliveryNotes(dnRes.data.map((d: any) => ({
        id: d.id,
        file_url: d.file_url,
        number: d.delivery_note_number,
        reservation_id: d.reservation_id,
        offer_id: d.offer_id,
      })));
      if (rpRes.data) setReturnProtocols(rpRes.data.map((r: any) => ({
        id: r.id,
        file_url: r.file_url,
        number: r.return_protocol_number,
        reservation_id: r.reservation_id,
      })));
    };
    fetchDocs();
  }, [reservations]);

  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });
  const formatCurrency = (n: number) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isActive = (res: Reservation) => {
    if (res.status === "pending") return true;
    if (!res.end_date) return true;
    const endDate = new Date(res.end_date + "T23:59:59");
    return endDate >= today;
  };

  const handleConfirm = async (resId: string) => {
    setConfirmingId(resId);
    const { error } = await supabase
      .from("b2b_reservations")
      .update({ status: "confirmed" })
      .eq("id", resId);

    if (error) {
      toast({ title: "Fehler", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Bestätigt", description: "Mietvorgang wurde manuell bestätigt." });
      onRefresh();
    }
    setConfirmingId(null);
  };

  const getDocsForReservation = (resId: string) => {
    const inv = invoices.find((i) => i.reservation_id === resId);
    const offerIdsForRes = offers
      .filter((o) => o.reservation_id === resId)
      .map((o) => o.id);
    const dn = deliveryNotes.find(
      (d) => d.reservation_id === resId || (d.offer_id && offerIdsForRes.includes(d.offer_id))
    );
    const rp = returnProtocols.find((r) => r.reservation_id === resId);
    return { invoice: inv, deliveryNote: dn, returnProtocol: rp };
  };

  const getStatusBadge = (res: Reservation) => {
    if (res.status === "pending") {
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50">
          Offen
        </Badge>
      );
    }
    if (res.status === "completed") {
      return <Badge variant="secondary">Beendet</Badge>;
    }
    const active = isActive(res);
    if (active) {
      return (
        <Badge className="bg-primary/10 text-primary border-primary/20">
          Aktiv
        </Badge>
      );
    }
    return <Badge variant="secondary">Beendet</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Alle Mietvorgänge</h2>
          <p className="text-sm text-muted-foreground">Mietvorgänge verwalten, bestätigen und verlängern</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onCreateReservation}
            className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Mietvorgang anlegen
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-medium text-foreground">Noch keine Mietvorgänge</p>
            <p className="text-sm text-muted-foreground mt-1">Mietvorgänge erscheinen hier, sobald sie angelegt oder ein Angebot bestätigt wurde.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produkt</TableHead>
                  <TableHead>Kunde</TableHead>
                  <TableHead>Standort</TableHead>
                  <TableHead>Zeitraum</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dokumente</TableHead>
                  <TableHead className="text-right">Preis</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((res) => {
                  const profile = profiles.find((p) => p.id === res.b2b_profile_id);
                  const invoiced = hasInvoice(res.id);
                  const returned = hasReturnProtocol(res.id);
                  const docs = getDocsForReservation(res.id);
                  const isPending = res.status === "pending";
                  const active = isActive(res);

                  return (
                    <TableRow key={res.id} className={isPending ? "bg-amber-50/30" : undefined}>
                      <TableCell>
                        <p className="font-medium text-sm">{res.product_name || res.product_id}</p>
                        <p className="text-xs text-muted-foreground">Menge: {res.quantity}</p>
                      </TableCell>
                      <TableCell className="text-sm">{profile?.company_name || "–"}</TableCell>
                      <TableCell className="text-sm capitalize">{res.location}</TableCell>
                      <TableCell className="text-sm">
                        {formatDate(res.start_date)}
                        {res.end_date ? ` – ${formatDate(res.end_date)}` : ""}
                      </TableCell>
                      <TableCell>{getStatusBadge(res)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {docs.deliveryNote?.file_url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs justify-start"
                              onClick={() => openInvoiceInNewWindow(docs.deliveryNote!.file_url!)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Übergabe
                            </Button>
                          )}
                          {docs.returnProtocol?.file_url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs justify-start"
                              onClick={() => openInvoiceInNewWindow(docs.returnProtocol!.file_url!)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Rückgabe
                            </Button>
                          )}
                          {docs.invoice?.file_url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs justify-start"
                              onClick={() => openInvoiceInNewWindow(docs.invoice!.file_url!)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Rechnung
                            </Button>
                          )}
                          {!docs.deliveryNote?.file_url && !docs.returnProtocol?.file_url && !docs.invoice?.file_url && (
                            <span className="text-xs text-muted-foreground">–</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {res.discounted_price != null
                          ? formatCurrency(res.discounted_price)
                          : res.original_price != null
                          ? formatCurrency(res.original_price)
                          : "–"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isPending && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleConfirm(res.id)}
                              disabled={confirmingId === res.id}
                              className="text-green-700 border-green-300 hover:bg-green-50"
                              title="Mietvorgang manuell bestätigen"
                            >
                              <Check className="h-3.5 w-3.5 mr-1" />
                              <span className="text-xs">Bestätigen</span>
                            </Button>
                          )}
                          {!returned && active && !isPending && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onCreateReturnProtocol(res)}
                              title="Rückgabeprotokoll erstellen"
                              className="text-green-700"
                            >
                              <ClipboardCheck className="h-3.5 w-3.5 mr-1" />
                              <span className="hidden sm:inline text-xs">Rückgabe</span>
                            </Button>
                          )}
                          {!invoiced && !isPending && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onGenerateInvoice(res)}
                              title="Rechnung erstellen"
                              className="text-primary"
                            >
                              <Receipt className="h-3.5 w-3.5 mr-1" />
                              <span className="hidden sm:inline text-xs">Rechnung</span>
                            </Button>
                          )}
                          {!isPending && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onExtendReservation(res)}
                            >
                              <CalendarPlus className="h-3.5 w-3.5 mr-1" />
                              Verlängern
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => setDeleteConfirmRes(res)}
                            title="Mietvorgang löschen"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
      <AlertDialog open={!!deleteConfirmRes} onOpenChange={(open) => !open && setDeleteConfirmRes(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mietvorgang löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Mietvorgang <strong>{deleteConfirmRes?.product_name || deleteConfirmRes?.product_id}</strong> unwiderruflich löschen? Zugehörige Dokumente bleiben erhalten, aber die Verknüpfung geht verloren.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirmRes) {
                  onDelete(deleteConfirmRes.id);
                  setDeleteConfirmRes(null);
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
