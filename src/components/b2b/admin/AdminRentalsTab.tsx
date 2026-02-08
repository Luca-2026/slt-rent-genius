import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CalendarPlus, Package, Plus, RefreshCw } from "lucide-react";
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
  onRefresh: () => void;
}

export function AdminRentalsTab({
  reservations,
  profiles,
  onCreateReservation,
  onExtendReservation,
  onRefresh,
}: Props) {
  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });
  const formatCurrency = (n: number) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const statusLabel = (status: string) => {
    switch (status) {
      case "confirmed": return "Bestätigt";
      case "pending": return "Ausstehend";
      case "cancelled": return "Storniert";
      default: return status;
    }
  };

  const statusVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "confirmed": return "default";
      case "pending": return "secondary";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Alle Mietverträge</h2>
          <p className="text-sm text-muted-foreground">Mietverträge verwalten und verlängern</p>
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
            <p className="text-sm text-muted-foreground mt-1">Lege den ersten Mietvertrag an.</p>
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
                  <TableHead className="text-right">Preis</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((res) => {
                  const profile = profiles.find((p) => p.id === res.b2b_profile_id);
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
                        <Badge variant={statusVariant(res.status)}>
                          {statusLabel(res.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {res.discounted_price != null
                          ? formatCurrency(res.discounted_price)
                          : res.original_price != null
                          ? formatCurrency(res.original_price)
                          : "–"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onExtendReservation(res)}
                        >
                          <CalendarPlus className="h-3.5 w-3.5 mr-1" />
                          Verlängern
                        </Button>
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
