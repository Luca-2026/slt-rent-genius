import { useEffect, useState } from "react";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { openInvoiceInNewWindow } from "@/utils/invoiceViewer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Receipt, Calendar, Download, Search, Filter, RefreshCw, 
  FileText, CheckCircle2, Clock, AlertCircle, ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  amount: number;
  net_amount: number;
  vat_rate: number;
  vat_amount: number;
  gross_amount: number;
  is_reverse_charge: boolean;
  status: string;
  file_url: string | null;
  file_name: string | null;
  notes: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  open: { label: "Offen", variant: "secondary", icon: Clock },
  paid: { label: "Bezahlt", variant: "default", icon: CheckCircle2 },
  overdue: { label: "Überfällig", variant: "destructive", icon: AlertCircle },
  cancelled: { label: "Storniert", variant: "outline", icon: AlertCircle },
};

export default function B2BInvoices() {
  const { user, b2bProfile } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchInvoices = async () => {
    if (!user) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from("b2b_invoices")
      .select("id, invoice_number, invoice_date, due_date, amount, net_amount, vat_rate, vat_amount, gross_amount, is_reverse_charge, status, file_url, file_name, notes, created_at")
      .order("invoice_date", { ascending: false });

    if (!error && data) {
      setInvoices(data as Invoice[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchInvoices();
  }, [user]);

  const filtered = invoices
    .filter((inv) => statusFilter === "all" || inv.status === statusFilter)
    .filter((inv) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.notes?.toLowerCase().includes(q)
      );
    });

  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const totalOpen = invoices.filter((i) => i.status === "open").reduce((s, i) => s + i.gross_amount, 0);
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.gross_amount, 0);

  return (
    <B2BPortalLayout title="Rechnungen" subtitle={`${invoices.length} Rechnungen`}>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{invoices.length}</p>
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
              <p className="text-2xl font-bold">{invoices.filter((i) => i.status === "open").length}</p>
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
              <p className="text-lg font-bold">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-muted-foreground">Bezahlt</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-lg font-bold">{formatCurrency(totalOpen)}</p>
              <p className="text-xs text-muted-foreground">Ausstehend</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechnungsnr. suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="open">Offen</SelectItem>
              <SelectItem value="paid">Bezahlt</SelectItem>
              <SelectItem value="overdue">Überfällig</SelectItem>
              <SelectItem value="cancelled">Storniert</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={fetchInvoices} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Aktualisieren
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Keine Rechnungen gefunden</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "Passe deine Filter an, um Rechnungen anzuzeigen."
                : "Du hast noch keine Rechnungen."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((inv) => {
              const cfg = statusConfig[inv.status] || statusConfig.open;
              const StatusIcon = cfg.icon;
              return (
                <Card key={inv.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{inv.invoice_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(inv.invoice_date)}
                        </p>
                      </div>
                      <Badge variant={cfg.variant} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold">{formatCurrency(inv.gross_amount)}</p>
                        {inv.is_reverse_charge && (
                          <p className="text-xs text-primary">Reverse-Charge</p>
                        )}
                      </div>
                      {inv.file_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openInvoiceInNewWindow(inv.file_url!, inv.invoice_number)}
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />
                          PDF
                        </Button>
                      )}
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
                  <TableHead>Rechnungsnr.</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Fällig</TableHead>
                  <TableHead className="text-right">Netto</TableHead>
                  <TableHead className="text-right">USt.</TableHead>
                  <TableHead className="text-right">Brutto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Download</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv) => {
                  const cfg = statusConfig[inv.status] || statusConfig.open;
                  const StatusIcon = cfg.icon;
                  return (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{inv.invoice_number}</p>
                          {inv.is_reverse_charge && (
                            <p className="text-xs text-primary">Reverse-Charge</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(inv.invoice_date)}</TableCell>
                      <TableCell>{inv.due_date ? formatDate(inv.due_date) : "–"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(inv.net_amount)}</TableCell>
                      <TableCell className="text-right">
                        {inv.vat_amount > 0 ? formatCurrency(inv.vat_amount) : "0,00 €"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(inv.gross_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant} className="flex items-center gap-1 w-fit">
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {inv.file_url ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openInvoiceInNewWindow(inv.file_url!, inv.invoice_number)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">–</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </B2BPortalLayout>
  );
}
