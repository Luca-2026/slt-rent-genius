import { useCallback, useEffect, useMemo, useState } from "react";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, RefreshCw, Search, Send, CheckCircle2, Ban, Banknote } from "lucide-react";
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
  paid_amount: number | null;
  payments: PaymentEntry[] | null;
  credited_amount: number | null;
  credit_reason: string | null;
  created_at: string;
}

/** Erfasste (Teil-)Zahlung zu einer Rechnung. */
interface PaymentEntry {
  date?: string;
  amount: number;
  label?: string;
  reference?: string;
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
  /** Dialog zum Erfassen einer eingegangenen (Teil-)Zahlung. */
  const [payFor, setPayFor] = useState<InvoiceRow | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payLabel, setPayLabel] = useState("Banküberweisung");
  const [payReference, setPayReference] = useState("");
  /** Dialog für eine Rechnungskorrektur (Gutschrift). */
  const [creditFor, setCreditFor] = useState<InvoiceRow | null>(null);
  const [creditMode, setCreditMode] = useState<"full" | "partial">("full");
  const [creditReason, setCreditReason] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditLabel, setCreditLabel] = useState("Gutschrift");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("inquiry_invoices")
      .select(
        "id, invoice_number, invoice_kind, inquiry_type, parent_invoice_id, offer_number, company_name, customer_name, customer_email, location, invoice_date, due_date, service_period_start, service_period_end, gross_amount, net_amount, status, file_url, email_sent, paid_amount, payments, credited_amount, credit_reason, created_at",
      )
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast({ title: "Rechnungen konnten nicht geladen werden", description: error.message, variant: "destructive" });
      return;
    }
    setRows((data ?? []) as unknown as InvoiceRow[]);
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

  /** Noch offener Restbetrag einer Rechnung (brutto abzüglich erfasster Zahlungen). */
  const balanceOf = (row: InvoiceRow) =>
    Math.round((Number(row.gross_amount) - Number(row.paid_amount ?? 0) - Number(row.credited_amount ?? 0)) * 100) / 100;

  const openSum = useMemo(
    () => filtered.filter((r) => r.status === "open" || r.status === "overdue")
      .reduce((sum, r) => sum + Math.max(0, balanceOf(r)), 0),
    [filtered],
  );

  /** Zahlungseingang atomar erfassen, damit parallele Buchungen nicht überschrieben werden. */
  const savePayment = async () => {
    if (!payFor) return;
    const amount = Math.round((Number(payAmount.replace(",", ".")) || 0) * 100) / 100;
    if (amount <= 0) {
      toast({ title: "Betrag fehlt", description: "Bitte einen Betrag größer 0 € eintragen.", variant: "destructive" });
      return;
    }
    setBusyId(payFor.id);
    const { data, error } = await supabase.rpc("record_inquiry_invoice_payment", {
      p_invoice_id: payFor.id,
      p_amount: amount,
      p_payment_date: payDate,
      p_label: payLabel.trim() || "Zahlungseingang",
      p_reference: payReference.trim(),
    });
    setBusyId(null);
    if (error) {
      toast({ title: "Zahlung konnte nicht gespeichert werden", description: error.message, variant: "destructive" });
      return;
    }
    const updated = Array.isArray(data) ? data[0] : data;
    const paidAmount = Number(updated?.paid_amount ?? Number(payFor.paid_amount ?? 0) + amount);
    const fullyPaid = paidAmount >= Number(payFor.gross_amount) - 0.009;
    toast({
      title: "Zahlung erfasst",
      description: fullyPaid
        ? "Die Rechnung ist vollständig bezahlt."
        : `Offener Restbetrag: ${formatEuro(Number(payFor.gross_amount) - paidAmount)}`,
    });
    setPayFor(null);
    setPayAmount("");
    setPayReference("");
    load();
  };


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

  /**
   * Erstellt eine Rechnungskorrektur (Gutschrift). Eine versendete Rechnung darf
   * nach GoBD nicht geändert werden – storniert wird über ein eigenes Dokument
   * mit eigener Nummer (GS-JJJJ-MM-0001) und Bezug zur Ursprungsrechnung.
   */
  const createCreditNote = async () => {
    if (!creditFor) return;
    const reason = creditReason.trim();
    if (!reason) {
      toast({ title: "Grund fehlt", description: "Bitte einen Grund für die Korrektur angeben.", variant: "destructive" });
      return;
    }
    const grossCredit = Math.round((Number(creditAmount.replace(",", ".")) || 0) * 100) / 100;
    if (creditMode === "partial" && grossCredit <= 0) {
      toast({ title: "Betrag fehlt", description: "Bitte den gutzuschreibenden Bruttobetrag angeben.", variant: "destructive" });
      return;
    }
    setBusyId(creditFor.id);
    const { data, error } = await supabase.functions.invoke("send-inquiry-credit-note", {
      body: {
        invoice_id: creditFor.id,
        mode: creditMode,
        reason,
        gross_amount: creditMode === "partial" ? grossCredit : undefined,
        product_name: creditMode === "partial" ? creditLabel.trim() || "Teilgutschrift" : undefined,
      },
    });
    setBusyId(null);
    if (error || (data as any)?.error) {
      toast({
        title: "Gutschrift fehlgeschlagen",
        description: (data as any)?.error ?? error?.message ?? "Unbekannter Fehler",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: `Gutschrift ${(data as any)?.invoice_number ?? ""} erstellt`,
      description: !(data as any)?.email_sent
        ? "Das Dokument wurde gespeichert, konnte aber nicht per E-Mail versendet werden."
        : (data as any)?.fully_credited
          ? "Die Rechnung wurde vollständig storniert und der Kunde informiert."
          : "Die Teilgutschrift wurde erstellt und dem Kunden per E-Mail gesendet.",
    });
    setCreditFor(null);
    setCreditReason("");
    setCreditAmount("");
    load();
  };

  const resend = async (row: InvoiceRow) => {
    setBusyId(row.id);
    const isCredit = row.invoice_kind === "credit_note";
    const { data, error } = await supabase.functions.invoke(isCredit ? "send-inquiry-credit-note" : "send-inquiry-invoice", {
      body: isCredit ? { resend_credit_note_id: row.id } : { resend_invoice_id: row.id },
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
      subtitle="Rechnungen und Gutschriften aus Miet- und Verkaufsanfragen"
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
                    
                    {row.invoice_kind === "credit_note" && (
                      <Badge variant="secondary">Gutschrift</Badge>
                    )}
                    <Badge variant={STATUS_VARIANT[row.status] ?? "outline"}>
                      {row.invoice_kind === "credit_note" && row.status === "paid"
                        ? "Erstellt"
                        : STATUS_LABEL[row.status] ?? row.status}
                    </Badge>
                    <Badge variant="outline">
                      {row.inquiry_type === "rental" ? "Mietanfrage" : "Verkaufsanfrage"}
                    </Badge>
                    <span className="ml-auto font-semibold">{formatEuro(Number(row.gross_amount))}</span>
                  </div>
                  {Number(row.credited_amount ?? 0) > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Gutgeschrieben {formatEuro(Number(row.credited_amount))}
                      {row.credit_reason ? ` · ${row.credit_reason}` : ""}
                    </div>
                  )}
                  {Number(row.paid_amount ?? 0) > 0 && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">
                        Bereits gezahlt {formatEuro(Number(row.paid_amount))}
                      </span>
                      <span className={balanceOf(row) > 0 ? "ml-2 font-semibold text-destructive" : "ml-2 font-semibold text-primary"}>
                        {balanceOf(row) > 0 ? `offen ${formatEuro(balanceOf(row))}` : "vollständig bezahlt"}
                      </span>
                    </div>
                  )}
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
                    {(row.invoice_kind !== "credit_note" || !row.email_sent) && (
                      <Button size="sm" variant="outline" disabled={busyId === row.id} onClick={() => resend(row)}>
                        <Send className="h-3.5 w-3.5 mr-1" /> {row.email_sent ? "Erneut senden" : "E-Mail senden"}
                      </Button>
                    )}
                    {row.status !== "cancelled" && row.invoice_kind !== "credit_note" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === row.id}
                        onClick={() => {
                          setPayFor(row);
                          setPayAmount(String(Math.max(0, balanceOf(row)).toFixed(2)));
                          setPayDate(new Date().toISOString().slice(0, 10));
                          setPayLabel("Banküberweisung");
                          setPayReference(row.invoice_number ?? "");
                        }}
                      >
                        <Banknote className="h-3.5 w-3.5 mr-1" /> Zahlung erfassen
                      </Button>
                    )}
                    {row.status !== "paid" && row.status !== "cancelled" && row.invoice_kind !== "credit_note" && (

                      <Button size="sm" variant="outline" disabled={busyId === row.id} onClick={() => setStatus(row, "paid")}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Als bezahlt markieren
                      </Button>
                    )}
                    {row.status !== "cancelled" && row.invoice_kind !== "credit_note" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === row.id}
                        onClick={() => {
                          setCreditFor(row);
                          setCreditMode("full");
                          setCreditReason("");
                          setCreditAmount(String(Math.max(0, balanceOf(row)).toFixed(2)));
                          setCreditLabel("Gutschrift");
                        }}
                      >
                        <Ban className="h-3.5 w-3.5 mr-1" /> Stornieren / Gutschrift
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!payFor} onOpenChange={(open) => !open && setPayFor(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Zahlung erfassen</DialogTitle>
              <DialogDescription>
                {payFor
                  ? `Rechnung ${payFor.invoice_number ?? ""} über ${formatEuro(Number(payFor.gross_amount))} · offen ${formatEuro(Math.max(0, balanceOf(payFor)))}`
                  : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Eingegangener Betrag (€)</Label>
                <Input type="number" step="0.01" min="0" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Zahlungsdatum</Label>
                <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Zahlungsweg</Label>
                <Input value={payLabel} onChange={(e) => setPayLabel(e.target.value)} placeholder="Banküberweisung" />
              </div>
              <div>
                <Label className="text-xs">Verwendungszweck (optional)</Label>
                <Input value={payReference} onChange={(e) => setPayReference(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPayFor(null)}>Abbrechen</Button>
              <Button onClick={savePayment} disabled={busyId === payFor?.id}>Zahlung speichern</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!creditFor} onOpenChange={(open) => !open && setCreditFor(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Rechnungskorrektur (Gutschrift)</DialogTitle>
              <DialogDescription>
                {creditFor
                  ? `Zu Rechnung ${creditFor.invoice_number ?? ""} über ${formatEuro(Number(creditFor.gross_amount))}. Die Rechnung selbst bleibt unverändert – der Kunde erhält ein eigenes Korrekturdokument mit eigener Nummer.`
                  : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Art der Korrektur</Label>
                <Select value={creditMode} onValueChange={(v) => setCreditMode(v as "full" | "partial")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Vollständige Stornierung</SelectItem>
                    <SelectItem value="partial">Teilgutschrift</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {creditMode === "partial" && (
                <>
                  <div>
                    <Label className="text-xs">Gutzuschreibender Betrag brutto (€)</Label>
                    <Input type="number" step="0.01" min="0" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Bezeichnung der Gutschriftposition</Label>
                    <Input value={creditLabel} onChange={(e) => setCreditLabel(e.target.value)} placeholder="z. B. Mietzeit verkürzt" />
                  </div>
                </>
              )}
              <div>
                <Label className="text-xs">Grund der Korrektur (erscheint auf dem Dokument)</Label>
                <Textarea rows={3} value={creditReason} onChange={(e) => setCreditReason(e.target.value)} placeholder="z. B. Maschine wurde zwei Tage früher zurückgegeben" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreditFor(null)}>Abbrechen</Button>
              <Button onClick={createCreditNote} disabled={busyId === creditFor?.id}>
                Gutschrift erstellen und senden
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

    </B2BPortalLayout>
  );
}
