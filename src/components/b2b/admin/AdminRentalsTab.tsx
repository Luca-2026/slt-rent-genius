import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CalendarPlus, ClipboardCheck, Package, Plus, Receipt, RefreshCw } from "lucide-react";
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

interface Props {
  reservations: Reservation[];
  profiles: B2BProfile[];
  onCreateReservation: () => void;
  onExtendReservation: (reservation: Reservation) => void;
  onGenerateInvoice: (reservation: Reservation) => void;
  onCreateReturnProtocol: (reservation: Reservation) => void;
  hasInvoice: (reservationId: string) => boolean;
  hasReturnProtocol: (reservationId: string) => boolean;
  onRefresh: () => void;
}

export function AdminRentalsTab({
  reservations,
  profiles,
  onCreateReservation,
  onExtendReservation,
  onGenerateInvoice,
  onCreateReturnProtocol,
  hasInvoice,
  hasReturnProtocol,
  onRefresh,
}: Props) {
  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });
  const formatCurrency = (n: number) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isActive = (res: Reservation) => {
    if (!res.end_date) return true;
    const endDate = new Date(res.end_date + "T23:59:59");
    return endDate >= today;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Alle Mietverträge</h2>
          <p className="text-sm text-muted-foreground">Bestätigte Mietverträge verwalten und verlängern</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onCreateReservation}
            className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Neu anlegen
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
            <p className="font-medium text-foreground">Noch keine Mietverträge</p>
            <p className="text-sm text-muted-foreground mt-1">Mietverträge erscheinen hier, sobald ein Angebot bestätigt wurde.</p>
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
                   <TableHead>Mietstatus</TableHead>
                   <TableHead>Rückgabe</TableHead>
                   <TableHead>Rechnung</TableHead>
                   <TableHead className="text-right">Preis</TableHead>
                   <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {reservations.map((res) => {
                   const profile = profiles.find((p) => p.id === res.b2b_profile_id);
                   const active = isActive(res);
                   const invoiced = hasInvoice(res.id);
                   const returned = hasReturnProtocol(res.id);
                  return (
                    <TableRow key={res.id}>
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
                      <TableCell>
                        {active ? (
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            Aktiv
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Beendet
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {returned ? (
                          <Badge variant="outline" className="text-green-600 border-green-300">
                            <ClipboardCheck className="h-3 w-3 mr-1" />
                            Dokumentiert
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-muted-foreground">
                            Ausstehend
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {invoiced ? (
                          <Badge variant="outline" className="text-primary border-primary/30">
                            <Receipt className="h-3 w-3 mr-1" />
                            Erstellt
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-muted-foreground">
                            Ausstehend
                          </Badge>
                        )}
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
                          {!returned && active && (
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
                          {!invoiced && (
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onExtendReservation(res)}
                          >
                            <CalendarPlus className="h-3.5 w-3.5 mr-1" />
                            Verlängern
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
    </div>
  );
}
