import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { invokeWithAuth } from "@/lib/invokeWithAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatEuro } from "./offerMath";
import { RotateCcw, Undo2 } from "lucide-react";
import { DepositSettlementCard } from "./DepositSettlementCard";
import { StripePaymentCard } from "./StripePaymentCard";
import { RentalCreditRefund } from "./RentalCreditRefund";
import { useStaffAccess } from "@/hooks/useStaffAccess";

type Totals = { success: boolean; error?: string; execution_available: boolean; manual_cancel_refund_available?: boolean; manual_method?: "cash" | "transfer" | null; paid_cents: number; deposit_available: number; rent_available: number; deposit_used: number; rent_used: number; pending: boolean; blocked_reason?: string; can_refund_rent: boolean; requests: RequestRow[] };
type RequestRow = { id: string; deposit_cents: number; rent_cents: number; payout_method: string; status: string; created_at: string; completed_at?: string; created_by: string };
type HistoryRow = { id: string; at: string; actor: string; label: string; detail: string };
const EVENT_LABELS: Record<string, string> = { order_cancelled: "Auftrag storniert", order_confirmed: "Auftrag bestätigt", order_bound_by_handover: "Auftrag durch Übergabe verbindlich", refund_completed: "Auszahlung bestätigt", deposit_settled: "Kaution abgerechnet", closed_without_return_protocol: "Abgeschlossen ohne Rückgabeprotokoll", return_without_delivery: "Rückgabe ohne Auslieferung" };
const eventDetail = (event: string, d: Record<string, unknown>) => event === "deposit_settled" ? `Kautionsbetrag ${formatEuro(Number(d.balance ?? 0))} · Auszahlung siehe Kautionseintrag` : String(d.reason ?? "");
const eur = (n: number) => formatEuro(n / 100);
const time = (s: string) => new Date(s).toLocaleString("de-DE", { timeZone: "Europe/Berlin" });
export function OrderRefundOverview({ inquiry, onChanged, compact = false, invoiceIds = [], actionTarget }: { inquiry: Record<string, any>; onChanged: () => void; compact?: boolean; invoiceIds?: string[]; actionTarget?: HTMLElement | null }) {
  const { canManageInventory, displayName } = useStaffAccess();
  const [legacyOpen, setLegacyOpen] = useState(false);
  const [hasSettlement, setHasSettlement] = useState(false);
  const [data, setData] = useState<Totals | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [error, setError] = useState("");
  const [openPayout, setOpenPayout] = useState<{ balance: number; method: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [deposit, setDeposit] = useState("0");
  const [rent, setRent] = useState("0");
  const [reference, setReference] = useState("");
  const [paidOn, setPaidOn] = useState(() => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" }));
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const call = useCallback(async (action = "order_refund_info", extra: Record<string, unknown> = {}) => {
    setBusy(true); setError("");
    try {
      const result = await invokeWithAuth<Totals>("offer-payment-admin", { action, inquiry_id: inquiry.id, ...extra });
      if (result.error || !result.data?.success) throw new Error(result.data?.error ?? "Zahlungsstand nicht verfügbar");
      setData(result.data);
      return result.data;
    } catch (e) { setError(e instanceof Error ? e.message : "Erstattungsstatus ungeklärt"); return null; }
    finally { setBusy(false); }
  }, [inquiry.id]);
  useEffect(() => { void call(); }, [call, inquiry.payments, inquiry.status]);
  useEffect(() => {
    let alive = true;
    void (async () => {
      const [events, links, basis, staff, invoices, settle] = await Promise.all([
        supabase.from("rental_inquiry_events").select("id,event,details,user_id,created_at").eq("rental_inquiry_id", inquiry.id).order("created_at", { ascending: false }).limit(100),
        supabase.from("offer_payment_links").select("id").eq("inquiry_id", inquiry.id).eq("inquiry_table", "rental_inquiries"),
        supabase.from("rental_refund_bases").select("id").eq("inquiry_id", inquiry.id).maybeSingle(),
        supabase.from("staff_profiles").select("user_id,first_name,last_name"),
        supabase.from("inquiry_invoices").select("id,invoice_number,invoice_kind,created_at").eq("rental_inquiry_id", inquiry.id),
        supabase.from("deposit_settlements").select("balance,payout_method,payout_status").eq("rental_inquiry_id", inquiry.id).maybeSingle(),
      ]);
      if ([events.error, links.error, basis.error, staff.error, invoices.error].some(Boolean)) { if (alive) setError("Historie konnte nicht vollständig geladen werden."); return; }
      const [deposits, rentals, credits] = await Promise.all([
        links.data?.length ? supabase.from("deposit_refunds").select("*").in("link_id", links.data.map(l => l.id)) : Promise.resolve({ data: [], error: null }),
        basis.data ? supabase.from("rental_order_refunds").select("*").eq("basis_id", basis.data.id) : Promise.resolve({ data: [], error: null }),
        invoices.data?.length ? supabase.from("credit_note_refunds").select("*").in("credit_note_id", invoices.data.map(i => i.id)) : Promise.resolve({ data: [], error: null }),
      ]);
      if (deposits.error || rentals.error || credits.error) { if (alive) setError("Erstattungshistorie nicht vollständig verfügbar."); return; }
      const refundedDeposit = (deposits.data ?? []).filter(r => r.status === "succeeded").reduce((a, r) => a + Number(r.amount_cents), 0);
      const openCents = settle.data && settle.data.payout_status === "pending" ? Math.round(Number(settle.data.balance) * 100) - Math.max(refundedDeposit, data?.deposit_used ?? 0) : 0;
      if (alive) {
        setHasSettlement(!!settle.data);
        setOpenPayout(openCents > 0 && settle.data ? { balance: openCents / 100, method: settle.data.payout_method } : null);
      }
      const names = new Map((staff.data ?? []).map(s => [s.user_id, `${s.first_name} ${s.last_name}`.trim()]));
      const actor = (id: string | null | undefined) => id ? names.get(id) ?? "Erfasser unbekannt" : "Erfasser unbekannt";
      const rows: HistoryRow[] = (events.data ?? []).map(e => ({ id: e.id, at: e.created_at, actor: actor(e.user_id), label: EVENT_LABELS[e.event] ?? "Auftragsaktion", detail: eventDetail(e.event, (e.details ?? {}) as Record<string, unknown>) }));
      for (const [index, p] of (inquiry.payments ?? []).entries()) rows.push({ id: `payment-${index}`, at: p.recorded_at ?? p.date, actor: p.recorded_by ?? actor(p.recorded_by_id), label: `Zahlung erhalten · ${formatEuro(Number(p.amount))}`, detail: p.label ?? "" });
      for (const [kind, refunds] of [["Kaution", deposits.data], ["Miete", rentals.data], ["Rechnungsguthaben", credits.data]] as const) {
        for (const r of refunds ?? []) rows.push({ id: r.id, at: r.created_at, actor: actor(r.created_by), label: `${kind} · ${eur(r.amount_cents)} · ${r.status === "succeeded" ? "erstattet" : "Erstattungsauftrag: " + r.status}`, detail: "payout_method" in r ? String(r.payout_method) === "stripe" ? "Ursprüngliches Zahlungsmittel (Stripe)" : String(r.payout_method) : "Ursprüngliches Zahlungsmittel (Stripe)" });
      }
      for (const r of data?.requests ?? []) rows.push({ id: r.id, at: r.created_at, actor: actor(r.created_by), label: `Erstattung · ${eur(r.deposit_cents + r.rent_cents)} · ${r.status === "succeeded" ? "erstattet" : "in Bearbeitung"}`, detail: `Kaution ${eur(r.deposit_cents)} · Miete ${eur(r.rent_cents)} · ${r.payout_method}` });
      for (const i of invoices.data ?? []) rows.push({ id: i.id, at: i.created_at, actor: "Erfasser unbekannt", label: `Beleg ${i.invoice_number ?? "Entwurf"}`, detail: i.invoice_kind });
      if (alive) setHistory(rows.filter(r => r.at).sort((a,b) => new Date(b.at).getTime() - new Date(a.at).getTime()));
    })();
    return () => { alive = false; };
  }, [inquiry.id, inquiry.payments, inquiry.status, data]);
  const total = (data?.deposit_available ?? 0) + (data?.rent_available ?? 0);
  const amount = (v: string) => Math.round(Number(v.replace(",", ".")) * 100);
  const manual = data?.requests.find(r => r.status === "creating" && r.payout_method !== "stripe");
  const resume = data?.requests.find(r => r.status === "creating" && r.payout_method === "stripe");
  const selected = amount(deposit) + amount(rent);
  const valid = data && [amount(deposit),amount(rent)].every(n => Number.isSafeInteger(n) && n >= 0) && amount(deposit) <= data.deposit_available && amount(rent) <= data.rent_available && selected > 0;
  const manualCancel = Boolean(data?.manual_cancel_refund_available && !data?.execution_available);
  const methodLabel = (m?: string | null) => m === "cash" ? "bar" : m === "transfer" ? "per Überweisung" : "auf das ursprüngliche Zahlungsmittel";
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
  const start = () => { setDeposit(String((data?.deposit_available ?? 0)/100)); setRent(String(data?.can_refund_rent && !manualCancel ? (data.rent_available/100) : 0)); setRequestId(crypto.randomUUID()); setOpen(true); };
  const refundAction = data && !data.pending && canManageInventory && (total > 0 || openPayout || !hasSettlement)
    ? <Button variant={actionTarget ? "outline" : "default"} className={actionTarget ? "min-h-11 w-full justify-start" : "h-11 w-full sm:w-64"} onClick={() => (data.execution_available || data.manual_cancel_refund_available) && !data.blocked_reason ? start() : setLegacyOpen(true)} disabled={busy}><Undo2 className="mr-2 h-4 w-4 shrink-0"/>Erstattung bearbeiten</Button>
    : null;
  return <section className="space-y-3 border-y border-border py-4" aria-label="Zahlungsstand und Auftragshistorie">
    {actionTarget && refundAction && createPortal(refundAction, actionTarget)}
    {!compact && <h3 className="font-semibold">Zahlungsstand &amp; Verlauf</h3>}
    {data && <>
      {!compact && <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"><div>Erhalten<strong className="block">{eur(data.paid_cents)}</strong></div><div>Kaution bereits beauftragt / erstattet<strong className="block">{eur(data.deposit_used)}</strong></div><div>Miete bereits beauftragt / erstattet<strong className="block">{eur(data.rent_used)}</strong></div><div>Noch zu erstatten<strong className="block">{eur(total)}</strong></div></div>}
      {!total && !data.pending && data.paid_cents > 0 && data.deposit_used+data.rent_used >= data.paid_cents && <p className="font-semibold text-primary">Vollständig erstattet · {eur(data.paid_cents)} · offen 0,00 €</p>}
      {data.blocked_reason && <p className="text-sm text-muted-foreground">{data.blocked_reason}</p>}
      <div className="flex flex-wrap gap-2">
        {!actionTarget && refundAction}
        {data.pending && <><p className="text-sm">Erstattung in Bearbeitung – keine weitere Auszahlung starten.</p><Button variant="outline" disabled={busy} onClick={() => void call("order_refund_sync")}><RotateCcw className="mr-2 h-4 w-4"/>Status prüfen</Button></>}
        {resume && <Button variant="outline" disabled={busy} onClick={() => void call("order_refund_execute", { request_id: resume.id, deposit_cents: resume.deposit_cents, rent_cents: resume.rent_cents }).then(onChanged)}>Gespeicherten Versuch fortsetzen</Button>}
        {manual && <div className="w-full space-y-2 rounded-md border border-border p-3" data-testid="manual-refund-confirm">
          <p className="text-sm font-semibold">Rückzahlung ausstehend: {eur(manual.deposit_cents + manual.rent_cents)} {methodLabel(manual.payout_method)}</p>
          <p className="text-xs text-muted-foreground">Erst bestätigen, wenn das Geld tatsächlich ausgezahlt wurde. Die Bestätigung löst keine Zahlung und keine E-Mail aus.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div><Label htmlFor="manual-refund-date">Tatsächliches Auszahlungsdatum</Label><Input id="manual-refund-date" type="date" max={today} value={paidOn} onChange={e => setPaidOn(e.target.value)}/></div>
            <div><Label htmlFor="manual-refund-reference">Belegreferenz</Label><Input id="manual-refund-reference" value={reference} onChange={e => setReference(e.target.value)} placeholder={manual.payout_method === "cash" ? "z. B. Kassenbeleg" : "z. B. Überweisungsreferenz"}/></div>
          </div>
          <Button disabled={busy || reference.trim().length<3 || !paidOn || paidOn > today} onClick={() => void call("order_refund_confirm_manual", { request_id: manual.id, reference: reference.trim(), paid_on: paidOn }).then(r => { if (r) { setReference(""); onChanged(); } })}>Tatsächliche Auszahlung bestätigen</Button>
        </div>}
      </div>
    </>}
    {openPayout && <p role="alert" className="rounded-md border border-destructive p-2 text-sm font-semibold text-destructive">Kaution abgerechnet, aber {formatEuro(openPayout.balance)} noch nicht ausgezahlt.</p>}
    {!data && !error && <p role="status" className="text-sm">Zahlungsstand wird geprüft …</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {!compact && <><h4 className="text-sm font-semibold">Auftragshistorie</h4><ol className="max-h-64 space-y-3 overflow-y-auto text-sm">{history.map(r => <li key={r.id} className="border-l-2 border-border pl-3"><strong>{r.label}</strong><div className="text-xs text-muted-foreground">{time(r.at)} · {r.actor}</div>{r.detail && <p className="text-xs">{r.detail}</p>}</li>)}</ol></>}
    <Dialog open={legacyOpen} onOpenChange={setLegacyOpen}><DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl">
      <DialogHeader><DialogTitle>Erstattung bearbeiten</DialogTitle><DialogDescription>Auftrag {inquiry.order_code ? `#${inquiry.order_code}` : ""} · Kaution und Mietguthaben auf das ursprüngliche Zahlungsmittel.</DialogDescription></DialogHeader>
      {inquiry.status !== "cancelled" && <DepositSettlementCard inquiry={inquiry} staffName={displayName} canMarkStripePayout={canManageInventory} showRentalRefunds={false} onDone={() => { void call(); onChanged(); }} />}
      {(!hasSettlement || inquiry.status === "cancelled") && <StripePaymentCard table="rental_inquiries" inquiryId={inquiry.id} offerNumber={inquiry.offer_number} payments={inquiry.payments} offerTotalGross={inquiry.offer_total_gross} deposit={Number(inquiry.offer_payload?.deposit) || 0} cancelled={inquiry.status === "cancelled"} onChanged={() => { void call(); onChanged(); }} />}
      {(data?.rent_available ?? 0) > 0 && <div className="space-y-2"><h4 className="text-sm font-semibold">Mietguthaben</h4>{invoiceIds.length ? invoiceIds.map(id => <RentalCreditRefund key={id} invoiceId={id} fullWidth onDone={() => { void call(); onChanged(); }} />) : <RentalCreditRefund inquiryId={inquiry.id} fullWidth onDone={() => { void call(); onChanged(); }} />}</div>}
    </DialogContent></Dialog>
    <Dialog open={open} onOpenChange={v => !busy && setOpen(v)}><DialogContent><DialogHeader><DialogTitle>Erstattung bestätigen</DialogTitle><DialogDescription>{manualCancel ? `Stornierter Auftrag: Die Kautionsrückzahlung ${methodLabel(data?.manual_method)} wird als ausstehend angelegt. Nach der tatsächlichen Auszahlung bitte mit Datum und Beleg bestätigen.` : "Rückzahlung auf das ursprüngliche Zahlungsmittel."}</DialogDescription></DialogHeader>
      <div><Label htmlFor="order-deposit-refund">Kaution (€), maximal {eur(data?.deposit_available ?? 0)}</Label><Input id="order-deposit-refund" inputMode="decimal" value={deposit} onChange={e => setDeposit(e.target.value)}/></div>
      <div><Label htmlFor="order-rent-refund">Mietguthaben (€), maximal {eur(data?.rent_available ?? 0)}</Label><Input id="order-rent-refund" inputMode="decimal" disabled={!data?.can_refund_rent || manualCancel} value={rent} onChange={e => setRent(e.target.value)}/></div>
      <p className="font-semibold">Gesamt: {eur(Number.isFinite(selected) ? selected : 0)}</p>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      <Button disabled={busy || !valid || !(data?.execution_available || manualCancel) || (manualCancel && amount(rent) > 0)} onClick={async () => {
        if (inquiry.status === "cancelled" && !manualCancel) {
          setBusy(true);
          const basis = await invokeWithAuth<{ error?: string }>("send-inquiry-invoice", { inquiry_type: "rental", inquiry_id: inquiry.id, cancellation_invoice: true, preview: true, prepare_refund: true, payment_terms: "vorkasse" });
          if (basis.error || basis.data?.error) { setError(basis.data?.error ?? "Stornoabrechnung nicht vorbereitet"); setBusy(false); return; }
        }
        const result = await call("order_refund_execute", { request_id: requestId, deposit_cents: amount(deposit), rent_cents: amount(rent) }); if (result) { setOpen(false); onChanged(); }
      }}>{manualCancel ? "Rückzahlung als ausstehend anlegen" : "Verbindlich erstatten"}</Button>
    </DialogContent></Dialog>
  </section>;
}