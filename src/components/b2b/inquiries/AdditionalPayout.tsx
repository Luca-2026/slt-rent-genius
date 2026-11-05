import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatEuro } from "./offerMath";
import type { Tables } from "@/integrations/supabase/types";
import { Check, Plus, X } from "lucide-react";

type Payout = Tables<"rental_additional_payouts">;
const statusLabel = { requested: "Freigabe ausstehend", approved: "Zur Überweisung freigegeben", rejected: "Abgelehnt", paid: "Überweisung bestätigt" };
export function AdditionalPayout({ creditId }: { creditId: string }) {
  const [payout, setPayout] = useState<Payout | null>(null);
  const [canApprove, setCanApprove] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ amount: "", reason: "", recipient: "", iban: "", note: "", reference: "" });
  const { toast } = useToast();
  const load = async () => {
    const { data, error } = await supabase.from("rental_additional_payouts").select("*").eq("credit_note_id", creditId).maybeSingle();
    if (error) { setError("Auszahlungsstatus konnte nicht geladen werden."); return; }
    setPayout(data); setError("");
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) { const { data } = await supabase.rpc("can_approve_rental_payout", { _actor: auth.user.id }); setCanApprove(data === true); }
  };
  useEffect(() => { void load(); }, [creditId]);
  const run = async (action: "request" | "approve" | "reject" | "complete") => {
    if (busy) return;
    setBusy(true); setError("");
    const result = action === "request"
      ? await supabase.rpc("request_rental_additional_payout", { _credit: creditId, _amount: Math.round(Number(form.amount.replace(",", ".")) * 100), _reason: form.reason, _recipient: form.recipient, _iban: form.iban })
      : payout ? action === "complete"
        ? await supabase.rpc("complete_rental_additional_payout", { _id: payout.id, _reference: form.reference })
        : await supabase.rpc("decide_rental_additional_payout", { _id: payout.id, _approve: action === "approve", _note: form.note })
      : { error: { message: "Antrag nicht gefunden" } };
    setBusy(false);
    if (result.error) { setError(result.error.message); return; }
    await load(); toast({ title: "Auszahlungsstatus aktualisiert" });
  };
  const field = (key: keyof typeof form, label: string) => <div className="space-y-1"><Label htmlFor={`payout-${creditId}-${key}`}>{label}</Label><Input id={`payout-${creditId}-${key}`} value={form[key]} disabled={busy} onChange={event => setForm({ ...form, [key]: event.target.value })} /></div>;
  return <>
    <Button size="sm" variant="outline" onClick={() => { void load(); setOpen(true); }}><Plus className="h-4 w-4" />{payout ? "Zusätzliche Auszahlung" : "Zusatzbetrag überweisen"}</Button>
    {payout && <span className="text-xs text-muted-foreground">{formatEuro(payout.amount_cents / 100)} · {statusLabel[payout.status as keyof typeof statusLabel]}</span>}
    <Dialog open={open} onOpenChange={value => { if (!busy) setOpen(value); }}><DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Zusätzliche Ausgleichszahlung</DialogTitle><DialogDescription>Separate Überweisung zusätzlich zur Rechnungskorrektur, keine Stripe-Erstattung und keine Kautionserstattung.</DialogDescription></DialogHeader>
      {!payout ? <div className="space-y-3">{field("amount", "Zusätzlicher Betrag (€)")}{field("reason", "Grund")}{field("recipient", "Empfänger")}{field("iban", "IBAN")}<p className="text-sm text-muted-foreground">Übersteigt die gesamte Erstattung die ursprüngliche Stripe-Zahlung, ist Benedikts oder Lucas Freigabe erforderlich. Der Antrag löst keine Zahlung aus.</p><Button disabled={busy || !!error && error.includes("geladen")} onClick={() => run("request")}>Auszahlung beantragen</Button></div> : <div className="space-y-3">
        <dl className="space-y-1 text-sm"><dt className="font-semibold">{statusLabel[payout.status as keyof typeof statusLabel]}</dt><dd>Zusatzüberweisung: {formatEuro(payout.amount_cents / 100)}</dd><dd>Rechnungskorrektur-Erstattung: {formatEuro(payout.correction_refund_cents / 100)}</dd><dd>Bisherige Erstattungen / Anträge: {formatEuro(payout.prior_refund_cents / 100)}</dd><dd>Ursprüngliche Stripe-Zahlung: {formatEuro(payout.original_stripe_cents / 100)}</dd><dd>{payout.recipient} · {payout.iban}</dd><dd>Grund: {payout.reason}</dd>{payout.decision_note && <dd>Freigabeentscheidung: {payout.decision_note}</dd>}{payout.paid_at && <dd>Überwiesen: {new Date(payout.paid_at).toLocaleString("de-DE")} · {payout.transfer_reference}</dd>}</dl>
        {payout.status === "requested" && canApprove && <>{field("note", "Entscheidungsnotiz")}<div className="flex gap-2"><Button disabled={busy} onClick={() => run("approve")}><Check className="h-4 w-4" />Freigeben</Button><Button variant="outline" disabled={busy} onClick={() => run("reject")}><X className="h-4 w-4" />Ablehnen</Button></div></>}
        {payout.status === "approved" && <>{field("reference", "Zahlungsnachweis / Bankreferenz")}<p className="text-sm text-muted-foreground">Erst bestätigen, nachdem die separate Überweisung tatsächlich ausgeführt wurde.</p><Button disabled={busy} onClick={() => run("complete")}>Ausgeführte Überweisung bestätigen</Button></>}
      </div>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </DialogContent></Dialog>
  </>;
}