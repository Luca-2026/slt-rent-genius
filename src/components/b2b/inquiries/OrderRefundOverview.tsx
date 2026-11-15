import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { invokeWithAuth } from "@/lib/invokeWithAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatEuro } from "./offerMath";
import { RotateCcw, Undo2 } from "lucide-react";

type Totals = { success: boolean; error?: string; paid_cents: number; deposit_available: number; rent_available: number; deposit_used: number; rent_used: number; pending: boolean; blocked_reason?: string; can_refund_rent: boolean; requests: RequestRow[] };
type RequestRow = { id: string; deposit_cents: number; rent_cents: number; payout_method: string; status: string; created_at: string; completed_at?: string; created_by: string };
type HistoryRow = { id: string; at: string; actor: string; label: string; detail: string };
const eur = (n: number) => formatEuro(n / 100);
const time = (s: string) => new Date(s).toLocaleString("de-DE", { timeZone: "Europe/Berlin" });
export function OrderRefundOverview({ inquiry, onChanged, compact = false }: { inquiry: Record<string, any>; onChanged: () => void; compact?: boolean }) {
  const [data, setData] = useState<Totals | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [deposit, setDeposit] = useState("0");
  const [rent, setRent] = useState("0");
  const [reference, setReference] = useState("");
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
      const [events, links, basis, staff, invoices] = await Promise.all([
        supabase.from("rental_inquiry_events").select("id,event,details,user_id,created_at").eq("rental_inquiry_id", inquiry.id).order("created_at", { ascending: false }).limit(100),
        supabase.from("offer_payment_links").select("id").eq("inquiry_id", inquiry.id).eq("inquiry_table", "rental_inquiries"),
        supabase.from("rental_refund_bases").select("id").eq("inquiry_id", inquiry.id).maybeSingle(),
        supabase.from("staff_profiles").select("user_id,first_name,last_name"),
        supabase.from("inquiry_invoices").select("id,invoice_number,invoice_kind,created_at").eq("rental_inquiry_id", inquiry.id),
      ]);
      if ([events.error, links.error, basis.error, staff.error, invoices.error].some(Boolean)) { if (alive) setError("Historie konnte nicht vollständig geladen werden."); return; }
      const [deposits, rentals, credits] = await Promise.all([
        links.data?.length ? supabase.from("deposit_refunds").select("*").in("link_id", links.data.map(l => l.id)) : Promise.resolve({ data: [], error: null }),
        basis.data ? supabase.from("rental_order_refunds").select("*").eq("basis_id", basis.data.id) : Promise.resolve({ data: [], error: null }),
        invoices.data?.length ? supabase.from("credit_note_refunds").select("*").in("credit_note_id", invoices.data.map(i => i.id)) : Promise.resolve({ data: [], error: null }),
      ]);
      if (deposits.error || rentals.error || credits.error) { if (alive) setError("Erstattungshistorie nicht vollständig verfügbar."); return; }
      const names = new Map((staff.data ?? []).map(s => [s.user_id, `${s.first_name} ${s.last_name}`.trim()]));
      const actor = (id: string | null | undefined) => id ? names.get(id) ?? "Erfasser unbekannt" : "Erfasser unbekannt";
      const rows: HistoryRow[] = (events.data ?? []).map(e => ({ id: e.id, at: e.created_at, actor: actor(e.user_id), label: e.event === "order_cancelled" ? "Auftrag storniert" : e.event === "order_confirmed" ? "Auftrag bestätigt" : e.event === "refund_completed" ? "Auszahlung bestätigt" : "Auftragsaktion", detail: String((e.details as Record<string, unknown>)?.reason ?? "") }));
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
  const start = () => { setDeposit(String((data?.deposit_available ?? 0)/100)); setRent(String(data?.can_refund_rent ? (data.rent_available/100) : 0)); setRequestId(crypto.randomUUID()); setOpen(true); };
  return <section className="space-y-3 border-y border-border py-4" aria-label="Zahlungsstand und Auftragshistorie">
    {!compact && <h3 className="font-semibold">Zahlungsstand &amp; Verlauf</h3>}
    {data && <>
      {!compact && <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"><div>Erhalten<strong className="block">{eur(data.paid_cents)}</strong></div><div>Kaution bereits beauftragt / erstattet<strong className="block">{eur(data.deposit_used)}</strong></div><div>Miete bereits beauftragt / erstattet<strong className="block">{eur(data.rent_used)}</strong></div><div>Noch zu erstatten<strong className="block">{eur(total)}</strong></div></div>}
      {!total && !data.pending && data.paid_cents > 0 && data.deposit_used+data.rent_used >= data.paid_cents && <p className="font-semibold text-primary">Vollständig erstattet · {eur(data.paid_cents)} · offen 0,00 €</p>}
      {data.blocked_reason && <p className="text-sm text-muted-foreground">{data.blocked_reason}</p>}
      <div className="flex flex-wrap gap-2">
        {!data.pending && !data.blocked_reason && total > 0 && <Button onClick={start} disabled={busy}><Undo2 className="mr-2 h-4 w-4"/>Erstattung</Button>}
        {data.pending && <><p className="text-sm">Erstattung in Bearbeitung – keine weitere Auszahlung starten.</p><Button variant="outline" disabled={busy} onClick={() => void call("order_refund_sync")}><RotateCcw className="mr-2 h-4 w-4"/>Status prüfen</Button></>}
        {resume && <Button variant="outline" disabled={busy} onClick={() => void call("order_refund_execute", { request_id: resume.id, deposit_cents: resume.deposit_cents, rent_cents: resume.rent_cents }).then(onChanged)}>Gespeicherten Versuch fortsetzen</Button>}
        {manual && <><Input aria-label="Auszahlungsnachweis" value={reference} onChange={e => setReference(e.target.value)} placeholder="Auszahlungsnachweis"/><Button disabled={busy || reference.trim().length<3} onClick={() => void call("order_refund_confirm_manual", { request_id: manual.id, reference }).then(onChanged)}>Tatsächliche Auszahlung bestätigen</Button></>}
      </div>
    </>}
    {!data && !error && <p role="status" className="text-sm">Zahlungsstand wird geprüft …</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {!compact && <><h4 className="text-sm font-semibold">Auftragshistorie</h4><ol className="max-h-64 space-y-3 overflow-y-auto text-sm">{history.map(r => <li key={r.id} className="border-l-2 border-border pl-3"><strong>{r.label}</strong><div className="text-xs text-muted-foreground">{time(r.at)} · {r.actor}</div>{r.detail && <p className="text-xs">{r.detail}</p>}</li>)}</ol></>}
    <Dialog open={open} onOpenChange={v => !busy && setOpen(v)}><DialogContent><DialogHeader><DialogTitle>Erstattung bestätigen</DialogTitle><DialogDescription>Rückzahlung auf das ursprüngliche Zahlungsmittel.</DialogDescription></DialogHeader>
      <div><Label htmlFor="order-deposit-refund">Kaution (€), maximal {eur(data?.deposit_available ?? 0)}</Label><Input id="order-deposit-refund" inputMode="decimal" value={deposit} onChange={e => setDeposit(e.target.value)}/></div>
      <div><Label htmlFor="order-rent-refund">Mietguthaben (€), maximal {eur(data?.rent_available ?? 0)}</Label><Input id="order-rent-refund" inputMode="decimal" disabled={!data?.can_refund_rent} value={rent} onChange={e => setRent(e.target.value)}/></div>
      <p className="font-semibold">Gesamt: {eur(Number.isFinite(selected) ? selected : 0)}</p>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      <Button disabled={busy || !valid} onClick={async () => {
        if (inquiry.status === "cancelled") {
          setBusy(true);
          const basis = await invokeWithAuth<{ error?: string }>("send-inquiry-invoice", { inquiry_type: "rental", inquiry_id: inquiry.id, cancellation_invoice: true, preview: true, prepare_refund: true, payment_terms: "vorkasse" });
          if (basis.error || basis.data?.error) { setError(basis.data?.error ?? "Stornoabrechnung nicht vorbereitet"); setBusy(false); return; }
        }
        const result = await call("order_refund_execute", { request_id: requestId, deposit_cents: amount(deposit), rent_cents: amount(rent) }); if (result) { setOpen(false); onChanged(); }
      }}>Verbindlich erstatten</Button>
    </DialogContent></Dialog>
  </section>;
}