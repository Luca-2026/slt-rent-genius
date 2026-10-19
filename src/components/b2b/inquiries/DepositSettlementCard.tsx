/**
 * Kautionsabrechnung nach der Rückgabe (Regeln: src/lib/depositSettlement.ts).
 * Zahlung zählt zuerst auf die Miete, Rückgabekosten werden mit der Kaution verrechnet.
 * „Abrechnen“ hält Abzüge und Erstattung fest (settle_deposit) – keine eigene Rechnung.
 * Die Schlussrechnung übernimmt danach Miete, Lieferung, Abzüge und „Kaution verrechnet“.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NumberInput } from "@/components/ui/number-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Plus, RotateCcw, Trash2, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { invokeWithAuth } from "@/lib/invokeWithAuth";
import { useToast } from "@/hooks/use-toast";
import {
  computeSettlement,
  deductionProblem,
  netOf,
  sumPayments,
  type SettlementDeduction,
} from "@/lib/depositSettlement";
import { formatEuro } from "./offerMath";

type Row = Record<string, any>;

const PAYOUT_LABEL: Record<string, string> = {
  cash: "Bar ausgezahlt",
  transfer: "Überweisung",
  stripe: "Stripe (auf ursprüngliche Zahlungsart)",
  none: "—",
};

interface Props {
  inquiry: Row;
  staffName: string;
  canMarkStripePayout: boolean;
  onDone: () => void;
}

export function DepositSettlementCard({ inquiry, staffName, canMarkStripePayout, onDone }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [settlement, setSettlement] = useState<Row | null>(null);
  const [hasProtocol, setHasProtocol] = useState(false);
  const [deductions, setDeductions] = useState<SettlementDeduction[]>([]);
  const [payout, setPayout] = useState<string>("cash");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: s }, { data: protocols }] = await Promise.all([
      supabase.from("deposit_settlements").select("*").eq("rental_inquiry_id", inquiry.id).maybeSingle(),
      supabase
        .from("b2b_return_protocols")
        .select("id, return_protocol_number, damages_total, b2b_return_extra_charges(id, label, quantity, unit_price)")
        .eq("rental_inquiry_id", inquiry.id),
    ]);
    setSettlement(s ?? null);
    const list: SettlementDeduction[] = [];
    for (const p of (protocols ?? []) as Row[]) {
      for (const c of (p.b2b_return_extra_charges ?? []) as Row[]) {
        const qty = Number(c.quantity) || 0;
        const gross = Math.round(qty * (Number(c.unit_price) || 0) * 100) / 100;
        if (gross > 0) list.push({ key: c.id, label: qty !== 1 ? `${c.label} (${qty.toLocaleString("de-DE")} × ${formatEuro(Number(c.unit_price))})` : c.label, gross, source: "protocol", kind: "service" });
      }
      const dmg = Number(p.damages_total) || 0;
      if (dmg > 0) list.push({ key: `dmg-${p.id}`, label: `Schäden laut Rückgabeprotokoll ${p.return_protocol_number ?? ""}`.trim(), gross: dmg, source: "damage", kind: "damage" });
    }
    setHasProtocol((protocols ?? []).length > 0);
    setDeductions(list);
    setLoading(false);
  }, [inquiry.id]);

  useEffect(() => { void load(); }, [load]);

  const paid = sumPayments(inquiry.payments);
  // Stripe-Erstattung nur, wenn die Ursprungszahlung über Stripe kam (gleiche Erkennung wie DB-Trigger).
  const hasStripePayment = Array.isArray(inquiry.payments) && (inquiry.payments as Row[]).some(
    (p) => /^(cs_|pi_)/.test(String(p?.reference ?? "")) || /stripe/i.test(String(p?.label ?? "")),
  );
  useEffect(() => { if (!hasStripePayment && payout === "stripe") setPayout("transfer"); }, [hasStripePayment, payout]);
  const rent = Number(inquiry.offer_total_gross) || 0;
  const result = useMemo(() => computeSettlement({ paid, rent, deductions }), [paid, rent, deductions]);
  const problem = deductionProblem(deductions);

  const patch = (i: number, p: Partial<SettlementDeduction>) => setDeductions((d) => d.map((x, j) => (j === i ? { ...x, ...p } : x)));

  const settle = async () => {
    if (problem || busy) return;
    if (!window.confirm(`Kaution jetzt abrechnen? ${result.refund > 0 ? `Erstattung ${formatEuro(result.refund)}` : result.due > 0 ? `Nachzahlung ${formatEuro(result.due)}` : "Saldo 0 €"}. Danach ist die Abrechnung gesperrt.`)) return;
    setBusy(true);
    try {
      const { error: rpcErr } = await supabase.rpc("settle_deposit", {
        _inquiry_id: inquiry.id,
        _deductions: deductions as never,
        _payout_method: result.refund > 0 ? payout : "none",
        _expected_balance: result.balance,
        _notes: notes || (null as never),
      });
      if (rpcErr) throw new Error(rpcErr.message.replace(/^CONFLICT:\s*/, ""));
      toast({ title: "Kaution abgerechnet", description: result.refund > 0 ? `Erstattung ${formatEuro(result.refund)} – ${PAYOUT_LABEL[payout]}` : result.due > 0 ? `Nachzahlung ${formatEuro(result.due)} kommt auf die Schlussrechnung` : "Saldo ausgeglichen" });
      await load();
      onDone();
    } catch (e) {
      toast({ title: "Abrechnung fehlgeschlagen", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const markPayout = async () => {
    if (!settlement) return;
    const { error } = await supabase.rpc("mark_deposit_payout_done", { _settlement_id: settlement.id });
    if (error) toast({ title: "Nicht gespeichert", description: error.message, variant: "destructive" });
    else void load();
  };

  // Stripe-Erstattung wirklich auslösen (über die bezahlte Online-Zahlung des Auftrags), dann als erledigt markieren.
  const executeStripePayout = async () => {
    if (!settlement || busy) return;
    setBusy(true);
    try {
      const { data: links } = await supabase
        .from("offer_payment_links")
        .select("id")
        .eq("inquiry_table", "rental_inquiries")
        .eq("inquiry_id", inquiry.id)
        .eq("status", "paid")
        .gt("deposit_cents", 0)
        .order("paid_at", { ascending: false })
        .limit(1);
      const link = links?.[0];
      if (!link) throw new Error("Keine bezahlte Online-Zahlung mit Kaution gefunden.");
      const { data, error } = await invokeWithAuth<{ success?: boolean; error?: string }>("offer-payment-admin", {
        action: "refund_deposit",
        link_id: link.id,
        amount_cents: Math.round(Number(settlement.balance) * 100),
        reason: `Kautionsabrechnung Auftrag ${inquiry.order_code ?? ""}`.trim(),
        request_id: crypto.randomUUID(),
      });
      if (error || !data?.success) throw new Error(data?.error ?? "Erstattung nicht ausgeführt.");
      await markPayout();
      toast({ title: "Stripe-Erstattung ausgelöst", description: `${formatEuro(Number(settlement.balance))} gehen auf die ursprüngliche Zahlungsart zurück.` });
    } catch (e) {
      toast({ title: "Stripe-Erstattung fehlgeschlagen", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="rounded-lg border border-border p-3 text-sm text-muted-foreground">Kautionsabrechnung wird geladen …</div>;

  const line = (label: string, value: string, strong = false) => (
    <div className={`flex justify-between gap-3 ${strong ? "font-semibold" : ""}`}>
      <span className="min-w-0 break-words">{label}</span>
      <span className="shrink-0 tabular-nums">{value}</span>
    </div>
  );

  if (settlement) {
    const bal = Number(settlement.balance);
    return (
      <div className="rounded-lg border border-border p-3 text-sm space-y-1.5" data-testid="deposit-settlement">
        <div className="flex items-center gap-2 font-semibold"><Lock className="h-4 w-4" /> Kaution abgerechnet</div>
        {line("Gezahlt gesamt", formatEuro(Number(settlement.paid_amount)))}
        {line("davon Miete", `−${formatEuro(Number(settlement.rent_amount))}`)}
        {line("Kaution vorhanden", formatEuro(Number(settlement.deposit_held)))}
        {(settlement.deductions as SettlementDeduction[]).filter((d) => !d.removed && d.gross > 0).map((d) => line(d.label, `−${formatEuro(d.gross)}`))}
        {line(bal >= 0 ? "Erstattung an Kunden" : "Nachzahlung Kunde", formatEuro(Math.abs(bal)), true)}
        <p className="text-xs text-muted-foreground">
          {new Date(settlement.settled_at).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })} von {settlement.settled_by_name ?? "—"}
          {bal > 0 ? ` · ${PAYOUT_LABEL[settlement.payout_method]}${settlement.payout_status === "pending" ? " – Auszahlung offen" : settlement.payout_date ? ` am ${new Date(settlement.payout_date).toLocaleDateString("de-DE")}` : ""}` : ""}
        </p>
        {settlement.payout_status === "pending" && canMarkStripePayout && (
          <Button size="sm" variant="outline" onClick={markPayout}>Stripe-Erstattung erledigt</Button>
        )}
        <p className="text-xs text-muted-foreground">Korrekturen nur per Gutschrift.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-primary/30 p-3 text-sm space-y-3" data-testid="deposit-settlement">
      <div className="flex items-center gap-2 font-semibold"><Wallet className="h-4 w-4" /> Kautionsabrechnung</div>
      {!hasProtocol && <p className="text-xs text-muted-foreground">Noch kein Rückgabeprotokoll – Kosten können auch von Hand ergänzt werden.</p>}
      <div className="space-y-1">
        {line("Gezahlt gesamt", formatEuro(result.paid))}
        {line("davon Miete", `−${formatEuro(result.rent)}`)}
        {result.rentShortfall > 0
          ? line("Miete noch offen", formatEuro(result.rentShortfall))
          : line("= Kaution vorhanden", formatEuro(result.depositHeld), true)}
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium">Abzüge (brutto)</div>
        {deductions.length === 0 && <p className="text-xs text-muted-foreground">Keine Kosten aus dem Rückgabeprotokoll.</p>}
        {deductions.map((d, i) => (
          <div key={d.key} className="space-y-1">
            <div className="flex items-center gap-2">
              {d.source === "manual" ? (
                <Input className="h-8 min-w-0 flex-1" value={d.label} placeholder="Bezeichnung, z. B. Schaden Schaufel" onChange={(e) => patch(i, { label: e.target.value })} />
              ) : (
                <span className={`min-w-0 flex-1 break-words ${d.removed ? "line-through text-muted-foreground" : ""}`}>{d.label}</span>
              )}
              {d.source === "manual" ? (
                <NumberInput className="h-8 w-24" type="number" step="0.01" min={0} value={d.gross || ""} onChange={(e) => patch(i, { gross: Number(e.target.value) || 0 })} />
              ) : (
                <span className="shrink-0 tabular-nums">−{formatEuro(d.gross)}</span>
              )}
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                aria-label={d.removed ? "Abzug wiederherstellen" : "Abzug entfernen"}
                onClick={() => (d.source === "manual" ? setDeductions((x) => x.filter((_, j) => j !== i)) : patch(i, { removed: !d.removed }))}>
                {d.removed ? <RotateCcw className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
            {d.source === "manual" && (
              <Select value={d.kind} onValueChange={(v) => patch(i, { kind: v as "service" | "damage" })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service (19 % USt)</SelectItem>
                  <SelectItem value="damage">Schadensersatz (ohne USt)</SelectItem>
                </SelectContent>
              </Select>
            )}
            {d.source !== "manual" && (
              <p className="text-xs text-muted-foreground">{d.kind === "damage" ? "Schadensersatz – nicht steuerbar (ohne USt)" : "Service – 19 % USt"}</p>
            )}
            {d.removed && (
              <Input className="h-8" value={d.reason ?? ""} placeholder="Grund, warum nicht berechnet" onChange={(e) => patch(i, { reason: e.target.value })} />
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm"
          onClick={() => setDeductions((x) => [...x, { key: `manual-${Date.now()}`, label: "", gross: 0, source: "manual", kind: "service" }])}>
          <Plus className="h-4 w-4 mr-1" /> Abzug hinzufügen
        </Button>
      </div>

      <div className="border-t border-border pt-2 space-y-1">
        {result.deductionsGross > 0 && line("Abzüge gesamt", `−${formatEuro(result.deductionsGross)}`)}
        {result.refund > 0
          ? line("Erstattung an Kunden", formatEuro(result.refund), true)
          : result.due > 0
          ? line("Nachzahlung Kunde", formatEuro(result.due), true)
          : line("Saldo", formatEuro(0), true)}
        {result.due > 0 && <p className="text-xs text-muted-foreground">Der offene Betrag kommt auf die Schlussrechnung (mit Überweisungs-QR-Code).</p>}
      </div>

      {result.refund > 0 && (
        <div>
          <Label className="text-xs">Auszahlung über</Label>
          <Select value={payout} onValueChange={setPayout}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Bar (heute ausgezahlt)</SelectItem>
              <SelectItem value="transfer">Überweisung (heute veranlasst)</SelectItem>
              {hasStripePayment && <SelectItem value="stripe">Stripe – Freigabe durch Admin/Niederlassungsleitung</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label className="text-xs">Notiz (optional)</Label>
        <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      {problem && <p className="text-xs text-destructive">{problem}</p>}
      <Button onClick={settle} disabled={!!problem || busy} className="w-full sm:w-auto">
        {busy ? "Wird abgerechnet …" : "Abrechnen"}
      </Button>
      {result.deductionsGross > 0 && (
        <p className="text-xs text-muted-foreground">Hält Abzüge und Erstattung fest. Danach „Schlussrechnung erstellen“: Miete, Lieferung, Rückgabekosten und Kautionsverrechnung stehen dann gemeinsam auf einer Rechnung.</p>
      )}
    </div>
  );
}
