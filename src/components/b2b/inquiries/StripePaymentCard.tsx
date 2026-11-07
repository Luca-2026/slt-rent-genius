import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Copy, Link2, Loader2, Undo2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { invokeWithAuth } from "@/lib/invokeWithAuth";
import { useToast } from "@/hooks/use-toast";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { formatEuro } from "./offerMath";
import { allPaymentsByBank } from "@/lib/bankTransferDiscount";
import { depositRefundPayment, pendingDepositRefund } from "@/lib/depositRefundPayment";

interface LinkRow {
  id: string;
  token: string;
  offer_number: string;
  rent_cents: number;
  deposit_cents: number;
  amount_cents: number;
  status: string;
  paid_cents: number | null;
  paid_at: string | null;
  warning: string | null;
  livemode: boolean;
  created_at: string;
}
interface RefundRow {
  request_id: string;
  link_id: string;
  id: string;
  amount_cents: number;
  status: string;
  reason: string | null;
  created_at: string;
  created_by_name: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  active: "Link offen – noch nicht bezahlt",
  paid: "Bezahlt",
  superseded: "Ersetzt durch neueren Link",
  void: "Ungültig",
  amount_mismatch: "Betrag weicht ab – nicht gebucht",
};
const REFUND_LABEL: Record<string, string> = {
  creating: "wird ausgelöst",
  pending: "in Bearbeitung",
  requires_action: "Aktion nötig",
  succeeded: "erstattet",
  failed: "fehlgeschlagen",
  canceled: "abgebrochen",
};
const cents = (c: number) => formatEuro(c / 100);

interface Props {
  table: "rental_inquiries" | "sales_inquiries";
  inquiryId: string;
  offerNumber: string | null | undefined;
  payments?: unknown;
  offerTotalGross?: number | null;
  deposit?: number;
  onChanged: () => void;
}

/** Online-Zahlung (Stripe): Zahlungslink zum Angebot, Zahlungsstatus, Kautionserstattung. */
export function StripePaymentCard({ table, inquiryId, offerNumber, payments, offerTotalGross, deposit = 0, onChanged }: Props) {
  const { toast } = useToast();
  const { canManageInventory } = useStaffAccess();
  // Kautionserstattung per Stripe: alle Standortmitarbeiter, Niederlassungsleitung und Admin.
  const canRefund = canManageInventory;
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [refunds, setRefunds] = useState<RefundRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [amount, setAmount] = useState<number | string>(0);
  const [reason, setReason] = useState("");
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());

  const load = useCallback(async () => {
    const { data: l } = await supabase
      .from("offer_payment_links")
      .select("id, token, offer_number, rent_cents, deposit_cents, amount_cents, status, paid_cents, paid_at, warning, livemode, created_at")
      .eq("inquiry_table", table)
      .eq("inquiry_id", inquiryId)
      .order("created_at", { ascending: false });
    const rows = (l ?? []) as LinkRow[];
    setLinks(rows);
    const ids = rows.map((r) => r.id);
    if (ids.length) {
      const { data: r } = await supabase
        .from("deposit_refunds")
        .select("id, request_id, link_id, amount_cents, status, reason, created_at, created_by_name")
        .in("link_id", ids)
        .order("created_at", { ascending: false });
      setRefunds((r ?? []) as RefundRow[]);
    } else setRefunds([]);
  }, [table, inquiryId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!offerNumber) return null;

  const current = links.find((l) => l.status === "active") ?? links.find((l) => l.status === "paid") ?? links[0];
  const received = Array.isArray(payments) ? payments.reduce((sum, p) => sum + Math.round((Number(p?.amount) || 0) * 100), 0) : 0;
  const settledByBank = received > 0 && allPaymentsByBank(payments) && offerTotalGross != null && received >= Math.round(offerTotalGross * 100) + Math.round(deposit * 100);
  const refundChoice = depositRefundPayment(links, refunds);
  const paidLink = refundChoice?.link;
  const refundedCents = refunds.filter((r) => !["failed", "canceled"].includes(r.status)).reduce((s, r) => s + r.amount_cents, 0);
  const refundable = refundChoice?.available ?? 0;
  const unresolved = pendingDepositRefund(refunds);
  const syncRefund = async () => {
    setBusy(true);
    try {
      const { data, error } = await invokeWithAuth<{ success?: boolean; error?: string }>("offer-payment-admin", { action: "sync_deposit_refunds", inquiry_id: inquiryId });
      if (error || !data?.success) throw new Error(data?.error ?? "Erstattungsstatus ungeklärt.");
      await load(); onChanged();
      toast({ title: "Erstattungsstatus aktualisiert", description: "Keine neue Auszahlung ausgelöst." });
    } catch (e) { toast({ title: "Status nicht bestätigt", description: e instanceof Error ? e.message : "Nicht zusätzlich erstatten.", variant: "destructive" }); }
    finally { setBusy(false); }
  };
  const linkUrl = !settledByBank && current?.status === "active" ? `${window.location.origin.includes("app.") ? "https://www.slt-rental.de" : window.location.origin}/zahlung/${current.token}` : null;

  const createLink = async () => {
    setBusy(true);
    const { data, error } = await invokeWithAuth<{ url?: string; error?: string; test_mode?: boolean }>("offer-payment-admin", {
      action: "create_link",
      inquiry_type: table === "rental_inquiries" ? "rental" : "sales",
      inquiry_id: inquiryId,
    });
    setBusy(false);
    if (error || !data?.url) {
      toast({ title: "Zahlungslink nicht erstellt", description: data?.error ?? "Bitte später erneut versuchen.", variant: "destructive" });
      return;
    }
    toast({ title: "Zahlungslink erstellt", description: data.test_mode ? "Stripe-Testmodus: nur Testzahlungen möglich." : undefined });
    load();
  };

  const copy = async () => {
    if (!linkUrl) return;
    await navigator.clipboard.writeText(linkUrl);
    toast({ title: "Link kopiert" });
  };

  const openRefund = () => {
    setAmount(refundable / 100);
    setReason("");
    setRequestId(crypto.randomUUID());
    setDialog(true);
  };

  const refund = async () => {
    if (!paidLink) return;
    const c = Math.round((Number(amount) || 0) * 100);
    if (c <= 0 || c > refundable) {
      toast({ title: "Ungültiger Betrag", description: `Erstattbar sind höchstens ${cents(refundable)}.`, variant: "destructive" });
      return;
    }
    setBusy(true);
    const { data, error } = await invokeWithAuth<{ success?: boolean; error?: string; customer_mailed?: boolean }>("offer-payment-admin", {
      action: "refund_deposit",
      link_id: paidLink.id,
      amount_cents: c,
      reason: reason.trim() || undefined,
      request_id: requestId,
    });
    setBusy(false);
    if (error || !data?.success) {
      toast({ title: "Erstattung nicht ausgeführt", description: data?.error ?? "Bitte später erneut versuchen.", variant: "destructive" });
      return;
    }
    toast({ title: "Kaution wird erstattet", description: "Der Erstattungsstatus wird im Auftrag gespeichert. Es wird keine separate E-Mail versendet." });
    setDialog(false);
    load();
    onChanged();
  };

  return (
    <div className="min-w-0 rounded-lg border border-border p-3 text-sm space-y-3">
      <div className="flex items-center gap-2 font-semibold">
        <CreditCard className="h-4 w-4" /> Online-Zahlung (Stripe)
      </div>

      {settledByBank && <p className="text-sm">Vollständig per Überweisung bezahlt – keine Online-Zahlung offen.</p>}
      {!current && !settledByBank && <p className="text-xs text-muted-foreground">Noch kein Zahlungslink zu Angebot {offerNumber}.</p>}

      {current && !settledByBank && (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{STATUS_LABEL[current.status] ?? current.status}</span>
            {!current.livemode && <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">Testmodus</span>}
          </div>
          <div className="text-xs text-muted-foreground">
            {cents(current.amount_cents)} (Miete {cents(current.rent_cents)}
            {current.deposit_cents > 0 ? ` + Kaution ${cents(current.deposit_cents)}` : ""})
            {current.paid_at ? ` · bezahlt am ${new Date(current.paid_at).toLocaleString("de-DE")}` : ""}
          </div>
          {current.warning && <p className="text-xs text-destructive">{current.warning}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
        {linkUrl && (
          <Button variant="outline" className="h-11 w-full px-3 py-0" onClick={copy}>
            <Copy /> Link kopieren
          </Button>
        )}
        {!settledByBank && current?.status !== "paid" && (
          <Button variant="outline" className="h-11 w-full px-3 py-0" onClick={createLink} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Link2 />}
            {current?.status === "active" ? "Neuen Link erstellen" : "Zahlungslink erstellen"}
          </Button>
        )}
        {unresolved && canRefund && <Button variant="outline" className="h-11 w-full px-3 py-0" disabled={busy} onClick={syncRefund}><RotateCcw /> Erstattungsstatus abgleichen</Button>}
        {!unresolved && paidLink && paidLink.deposit_cents > 0 && canRefund && (
          <Button className="h-11 w-full px-3 py-0" onClick={openRefund} disabled={busy || refundable <= 0}>
            <Undo2 /> Kaution erstatten
          </Button>
        )}
      </div>

      {paidLink && paidLink.deposit_cents > 0 && (
        <p className="text-xs text-muted-foreground">
          Kaution {cents(paidLink.deposit_cents)} · erstattet {cents(refundedCents)} · noch erstattbar {cents(refundable)}
          {!canRefund && " · Erstattung nur durch Standortmitarbeiter, Niederlassungsleitung oder Admin"}
        </p>
      )}

      {refunds.length > 0 && (
        <ul className="text-xs space-y-0.5">
          {refunds.map((r) => (
            <li key={r.id}>
              {new Date(r.created_at).toLocaleDateString("de-DE")}: {cents(r.amount_cents)} – {REFUND_LABEL[r.status] ?? r.status}
              {r.reason ? ` (${r.reason})` : ""}
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kaution erstatten</DialogTitle>
            <DialogDescription>
              Der Betrag geht auf das ursprüngliche Zahlungsmittel zurück. Bei Schäden kannst du einen geringeren Betrag erstatten (z. B. abzüglich Schäden laut Rückgabeprotokoll). Die Erstattung wird auf der Rechnung ausgewiesen, ohne separate E-Mail.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Betrag in € (max. {cents(refundable)})</Label>
              <NumberInput value={amount} onChange={(e) => setAmount(e.target.value.replace(",", "."))} />
            </div>
            <div>
              <Label className="text-xs">Erstattungsgrund (optional)</Label>
              <Input value={reason} maxLength={300} onChange={(e) => setReason(e.target.value)} placeholder="z. B. abzüglich Reinigung" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)} disabled={busy}>Abbrechen</Button>
            <Button onClick={refund} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />} Jetzt erstatten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
