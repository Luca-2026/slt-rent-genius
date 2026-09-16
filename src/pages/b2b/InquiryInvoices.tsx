import { useCallback, useEffect, useMemo, useState } from "react";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ExternalLink, RefreshCw, Search, Send, CheckCircle2, Ban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatEuro } from "@/components/b2b/inquiries/offerMath";

interface InvoiceRow {
  id: string;
  invoice_number: string | null;
  invoice_kind: string;
  inquiry_type: string;
  parent_invoice_id: string | null;
  offer_number: string | null;
  company_name: string | null;
  customer_name: string | null;
  customer_email: string;
  location: string | null;
  invoice_date: string | null;
  due_date: string | null;
  service_period_start: string | null;
  service_period_end: string | null;
  gross_amount: number;
  net_amount: number;
  status: string;
  file_url: string | null;
  email_sent: boolean;
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Entwurf",
  open: "Offen",
  overdue: "Überfällig",
  paid: "Bezahlt",
  cancelled: "Storniert",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  open: "default",
  overdue: "destructive",
  paid: "secondary",
  cancelled: "outline",
};

const dateDE = (value: string | null) => (value ? new Date(value).toLocaleDateString("de-DE") : "—");

/** Übersicht aller Rechnungen, die aus Miet- und Verkaufsanfragen entstanden sind. */
export default function InquiryInvoices() {
  const { toast } = useToast();
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("inquiry_invoices")
      .select(
        "id, invoice_number, invoice_kind, inquiry_type, parent_invoice_id, offer_number, company_name, customer_name, customer_email, location, invoice_date, due_date, service_period_start, service_period_end, gross_amount, net_amount, status, file_url, email_sent, created_at",
      )
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast({ title: "Rechnungen konnten nicht geladen werden", description: error.message, variant: "destructive" });
      return;
    }
    setRows((data ?? []) as InvoiceRow[]);
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (!q) return true;
      return [row.invoice_number, row.offer_number, row.company_name, row.customer_name, row.customer_email, row.location]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [rows, search, statusFilter]);

  const openSum = useMemo(
    () => filtered.filter((r) => r.status === "open" || r.status === "overdue")
      .reduce((sum, r) => sum + Number(r.gross_amount), 0),
    [filtered],
  );

  const setStatus = async (row: InvoiceRow, status: "paid" | "cancelled") => {
    setBusyId(row.id);
    const patch: Record<string, unknown> = { status };
    if (status === "paid") patch.paid_at = new Date().toISOString();
    if (status === "cancelled") patch.cancelled_at = new Date().toISOString();
    const { error } = await supabase.from("inquiry_invoices").update(patch).eq("id", row.id);
    setBusyId(null);
    if (error) {
      toast({ title: "Änderung nicht möglich", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: status === "paid" ? "Als bezahlt markiert" : "Rechnung storniert" });
    load();
  };

  const resend = async (row: InvoiceRow) => {
    setBusyId(row.id);
    const { data, error } = await supabase.functions.invoke("send-inquiry-invoice", {
      body: { resend_invoice_id: row.id },
    });
    setBusyId(null);
    if (error || (data as any)?.error) {
      toast({
        title: "Versand fehlgeschlagen",
        description: (data as any)?.error ?? error?.message ?? "Unbekannter Fehler",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Rechnung erneut versendet", description: row.customer_email });
    load();
  };

  return (
    <B2BPortalLayout
      title="Rechnungen"
      subtitle="Rechnungen und Nachträge aus Miet- und Verkaufsanfragen"
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechnungsnummer, Kunde oder E-Mail suchen"
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-1" /> Aktualisieren
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {filtered.length} Rechnungen · offener Betrag {formatEuro(openSum)}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Rechnungen werden geladen …</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Noch keine Rechnungen. Rechnungen entstehen in der Miet- oder Verkaufsanfrage über „Rechnung erstellen“.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((row) => (
              <Card key={row.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{row.invoice_number ?? "Entwurf"}</span>
                    {row.offer_number && (
                      <span className="ml-2 text-xs text-muted-foreground">zu Angebot {row.offer_number}</span>
                    )}
                    {row.invoice_kind === "supplement" && <Badge variant="outline">Nachtrag</Badge>}
                    <Badge variant={STATUS_VARIANT[row.status] ?? "outline"}>
                      {STATUS_LABEL[row.status] ?? row.status}
                    </Badge>
                    <Badge variant="outline">
                      {row.inquiry_type === "rental" ? "Mietanfrage" : "Verkaufsanfrage"}
                    </Badge>
                    <span className="ml-auto font-semibold">{formatEuro(Number(row.gross_amount))}</span>
                  </div>
                  <div className="text-sm">
                    {row.company_name || row.customer_name || row.customer_email}
                    <span className="text-muted-foreground"> · {row.customer_email}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Rechnungsdatum {dateDE(row.invoice_date)} · fällig {dateDE(row.due_date)}
                    {row.service_period_start
                      ? ` · Leistungszeitraum ${dateDE(row.service_period_start)}${row.service_period_end ? ` – ${dateDE(row.service_period_end)}` : ""}`
                      : ""}
                    {row.email_sent ? " · per E-Mail versendet" : " · noch nicht versendet"}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {row.file_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={row.file_url} target="_blank" rel="noreferrer">
                          PDF öffnen <ExternalLink className="h-3.5 w-3.5 ml-1" />
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" disabled={busyId === row.id} onClick={() => resend(row)}>
                      <Send className="h-3.5 w-3.5 mr-1" /> Erneut senden
                    </Button>
                    {row.status !== "paid" && row.status !== "cancelled" && (
                      <Button size="sm" variant="outline" disabled={busyId === row.id} onClick={() => setStatus(row, "paid")}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Als bezahlt markieren
                      </Button>
                    )}
                    {row.status !== "cancelled" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" disabled={busyId === row.id}>
                            <Ban className="h-3.5 w-3.5 mr-1" /> Stornieren
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Rechnung stornieren?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Die Rechnung {row.invoice_number} bleibt als Beleg erhalten und wird als storniert
                              gekennzeichnet. Eine Löschung ist aus steuerrechtlichen Gründen nicht möglich.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction onClick={() => setStatus(row, "cancelled")}>
                              Stornieren
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </B2BPortalLayout>
  );
}
