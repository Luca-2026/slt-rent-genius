import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Copy, Loader2, Undo2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { invokeWithAuth } from "@/lib/invokeWithAuth";
import { useToast } from "@/hooks/use-toast";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { formatEuro } from "./offerMath";

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
  onChanged: () => void;
}

/** Online-Zahlung (Stripe): Zahlungslink zum Angebot, Zahlungsstatus, Kautionserstattung. */
export function StripePaymentCard({ table, inquiryId, offerNumber, onChanged }: Props) {
  const { toast } = useToast();
  const { isAdmin, isBranchManager } = useStaffAccess();
  const canRefund = isAdmin || isBranchManager;
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
        .select("id, amount_cents, status, reason, created_at, created_by_name")
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
  const paidLink = links.find((l) => l.status === "paid");
  const refundedCents = refunds.filter((r) => !["failed", "canceled"].includes(r.status)).reduce((s, r) => s + r.amount_cents, 0);
  const refundable = paidLink ? Math.max(0, paidLink.deposit_cents - refundedCents) : 0;
  const linkUrl = current?.status === "active" ? `${window.location.origin.includes("app.") ? "https://www.slt-rental.de" : window.location.origin}/zahlung/${current.token}` : null;

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
    toast({ title: "Kaution wird erstattet", description: data.customer_mailed ? "Der Kunde wurde per E-Mail informiert." : "Kunden-E-Mail wurde nicht versendet." });
    setDialog(false);
    load();
    onChanged();
  };

  return (
    <div className="rounded-lg border border-border p-3 text-sm space-y-3">
      <div className="flex items-center gap-2 font-semibold">
        <CreditCard className="h-4 w-4" /> Online-Zahlung (Stripe)
      </div>

      {!current && <p className="text-xs text-muted-foreground">Noch kein Zahlungslink zu Angebot {offerNumber}.</p>}

      {current && (
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

      <div className="flex flex-wrap gap-2">
        {linkUrl && (
          <Button size="sm" variant="outline" onClick={copy}>
            <Copy className="h-3.5 w-3.5 mr-1.5" /> Link kopieren
          </Button>
        )}
        {current?.status !== "paid" && (
          <Button size="sm" variant="outline" onClick={createLink} disabled={busy}>
            {busy && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            {current?.status === "active" ? "Neuen Link erstellen" : "Zahlungslink erstellen"}
          </Button>
        )}
        {paidLink && paidLink.deposit_cents > 0 && canRefund && (
          <Button size="sm" onClick={openRefund} disabled={busy || refundable <= 0}>
            <Undo2 className="h-3.5 w-3.5 mr-1.5" /> Kaution erstatten
          </Button>
        )}
      </div>

      {paidLink && paidLink.deposit_cents > 0 && (
        <p className="text-xs text-muted-foreground">
          Kaution {cents(paidLink.deposit_cents)} · erstattet {cents(refundedCents)} · noch erstattbar {cents(refundable)}
          {!canRefund && " · Erstattung nur durch Niederlassungsleitung oder Admin"}
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
              Der Betrag geht auf das ursprüngliche Zahlungsmittel zurück. Bei Schäden kannst du einen geringeren Betrag erstatten (z. B. abzüglich Schäden laut Rückgabeprotokoll). Der Kunde bekommt eine E-Mail.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Betrag in € (max. {cents(refundable)})</Label>
              <NumberInput value={amount} onChange={(e) => setAmount(e.target.value.replace(",", "."))} />
            </div>
            <div>
              <Label className="text-xs">Hinweis an den Kunden (optional)</Label>
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
