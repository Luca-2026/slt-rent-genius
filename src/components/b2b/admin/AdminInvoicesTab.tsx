import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Eye, Receipt, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  gross_amount: number;
  net_amount: number;
  vat_amount: number;
  is_reverse_charge: boolean;
  status: string;
  file_url: string | null;
  email_sent: boolean;
  customer_company: string | null;
  b2b_profile_id: string;
  reservation_id: string | null;
  created_at: string;
}

interface Props {
  invoices: Invoice[];
  onStatusChange: (invoiceId: string, status: string) => void;
  onViewInvoice: (fileUrl: string, invoiceNumber: string) => void;
  onRefresh: () => void;
}

export function AdminInvoicesTab({
  invoices,
  onStatusChange,
  onViewInvoice,
  onRefresh,
}: Props) {
  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });
  const formatCurrency = (n: number) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const statusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-primary/10 text-primary border-primary/20";
      case "overdue": return "bg-destructive/10 text-destructive border-destructive/20";
      case "cancelled": return "bg-muted text-muted-foreground";
      default: return "bg-accent/10 text-accent border-accent/20";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Alle Rechnungen</h2>
          <p className="text-sm text-muted-foreground">Rechnungsstatus verwalten und PDFs einsehen</p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Aktualisieren
        </Button>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Receipt className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-medium text-foreground">Noch keine Rechnungen</p>
            <p className="text-sm text-muted-foreground mt-1">
              Rechnungen werden aus Anfragen erstellt.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rechnungsnr.</TableHead>
                  <TableHead>Kunde</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Fällig</TableHead>
                  <TableHead className="text-right">Brutto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{inv.invoice_number}</p>
                        {inv.is_reverse_charge && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">RC</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{inv.customer_company || "–"}</TableCell>
                    <TableCell className="text-sm">{formatDate(inv.invoice_date)}</TableCell>
                    <TableCell className="text-sm">
                      {inv.due_date ? formatDate(inv.due_date) : "–"}
                    </TableCell>
                    <TableCell className="text-right font-medium text-sm">
                      {formatCurrency(inv.gross_amount)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={inv.status}
                        onValueChange={(v) => onStatusChange(inv.id, v)}
                      >
                        <SelectTrigger className={`w-[130px] h-8 text-xs border ${statusColor(inv.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Offen</SelectItem>
                          <SelectItem value="paid">Bezahlt</SelectItem>
                          <SelectItem value="overdue">Überfällig</SelectItem>
                          <SelectItem value="cancelled">Storniert</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      {inv.file_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onViewInvoice(inv.file_url!, inv.invoice_number)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline text-xs">PDF</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
