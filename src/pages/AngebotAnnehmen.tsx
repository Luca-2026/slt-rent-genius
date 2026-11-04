import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, FileSignature, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignaturePad } from "@/components/b2b/SignaturePad";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DECLINE_REASONS } from "../../supabase/functions/_shared/offer-followup";

interface AcceptInfo {
  status: "active" | "accepted" | "superseded" | "expired" | "closed" | "declined";
  expires_at?: string | null;
  offer_number: string;
  customer_name: string;
  gross_amount: number;
  deposit: number;
  valid_until: string | null;
  items: { name: string; quantity: number; unit: string }[];
  agb_kind: "business" | "private";
  accepted_at: string | null;
  signer_name: string | null;
  location: { name: string; email: string; phone: string };
  prepay?: boolean;
  business_type?: "rental" | "sales";
}

const eur = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n || 0);
const dateDe = (d: string | null) => (d ? new Date(d).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" }) : "");

const STATUS_TEXT: Record<string, string> = {
  superseded: "Zu diesem Angebot gibt es eine neuere Fassung. Bitte nutze den Link aus der neuesten E-Mail.",
  expired: "Dieses Angebot ist abgelaufen. Melde dich gerne bei uns, dann erstellen wir dir ein neues Angebot.",
  closed: "Diese Anfrage ist bereits abgeschlossen. Bei Fragen melde dich gerne bei uns.",
  declined: "Deine Ablehnung wurde gespeichert. Vielen Dank für deine Rückmeldung.",
};

export default function AngebotAnnehmen() {
  const { token = "" } = useParams();
  const [search] = useSearchParams();
  const [declining, setDeclining] = useState(search.get("aktion") === "ablehnen");
  const [reason, setReason] = useState<keyof typeof DECLINE_REASONS | "">("");
  const [note, setNote] = useState("");
  const [declineConfirmed, setDeclineConfirmed] = useState(false);
  const [info, setInfo] = useState<AcceptInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [agb, setAgb] = useState(false);
  const [binding, setBinding] = useState(false);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase.functions.invoke("offer-accept", { body: { action: "info", token } });
    if (err || !data || (data as { error?: string }).error) {
      setInfo(null);
      setError("Dieser Link ist nicht gültig. Bitte wende dich an dein SLT-Rental-Team.");
    } else {
      setInfo(data as AcceptInfo);
      setError(null);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const canSubmit = name.trim().length >= 2 && !!signature && agb && binding && !sending;
  const decline = async () => {
    if (!reason || !declineConfirmed || sending) return;
    setSending(true); setError(null);
    const { data, error: err } = await supabase.functions.invoke("offer-accept", { body: { action: "decline", token, reason, note: note.trim() } });
    setSending(false);
    if (err || !data?.success) { setError("Die Ablehnung konnte nicht gespeichert werden. Bitte lade das Angebot erneut."); return; }
    await load();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    if (!canSubmit) return;
    setSending(true);
    setError(null);
    const { data, error: err } = await supabase.functions.invoke("offer-accept", {
      body: { action: "accept", token, signer_name: name.trim(), signature_data: signature, agb_accepted: true, binding_accepted: true },
    });
    setSending(false);
    if (err || !(data as { success?: boolean } | null)?.success) {
      let msg = (data as { error?: string } | null)?.error;
      try { msg = msg ?? (await (err as any)?.context?.json?.())?.error; } catch { /* kein JSON */ }
      setError(msg ?? "Die Annahme konnte nicht gespeichert werden. Bitte versuche es erneut.");
      load();
      return;
    }
    const payUrl = (data as { pay_url?: string | null }).pay_url;
    if (payUrl) {
      // Vorkasse: direkt zur Zahlungsseite dieses Angebots weiterleiten.
      const m = payUrl.match(/\/zahlung\/([A-Za-z0-9_-]+)$/);
      window.location.assign(m ? `/zahlung/${m[1]}` : payUrl);
      return;
    }
    await load();
    // Am Handy steht man nach dem Annehmen weit unten – Bestätigung sichtbar machen.
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout>
      <SEO title="Angebot annehmen – SLT Rental" description="Angebot online annehmen und digital unterschreiben." noIndex />
      <section className="py-12 lg:py-20 bg-background">
        <div className="section-container max-w-xl mx-auto">
          <div className="rounded-xl border border-border bg-card p-5 sm:p-8 shadow-sm">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : !info ? (
              <div className="flex gap-3 text-foreground"><AlertTriangle className="h-6 w-6 shrink-0 text-destructive" /><p>{error}</p></div>
            ) : info.status === "accepted" ? (
              <div className="text-center space-y-3">
                <CheckCircle2 className="h-14 w-14 text-primary mx-auto" />
                <h1 className="text-2xl font-bold text-foreground">Vielen Dank – Angebot angenommen</h1>
                <p className="text-muted-foreground">
                  Angebot {info.offer_number} wurde{info.accepted_at ? ` am ${new Date(info.accepted_at).toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "short" })} Uhr` : ""}{info.signer_name ? ` von ${info.signer_name}` : ""} verbindlich angenommen.
                  {info.business_type === "sales" ? (info.prepay ? " Bitte überweise den Kaufpreis gemäß den Bankdaten und Zahlungsbedingungen im Angebot." : " Du erhältst in Kürze die Auftragsbestätigung für deinen Kauf.") : info.prepay ? " Bitte leiste nun die Zahlung – den Zahlungslink findest du auch in deiner E-Mail." : " Du erhältst in Kürze die Auftragsbestätigung, damit deine Miete bestätigt wird."}
                </p>
              </div>
            ) : info.status !== "active" ? (
              <div className="flex gap-3 text-foreground"><AlertTriangle className="h-6 w-6 shrink-0 text-destructive" /><p>{STATUS_TEXT[info.status]}</p></div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground">Angebot {info.offer_number}{info.customer_name ? ` · ${info.customer_name}` : ""}</p>
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><FileSignature className="h-6 w-6 text-primary" /> {declining ? "Angebot ablehnen" : "Angebot annehmen"}</h1>
                </div>

                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  {info.items.length > 0 && (
                    <ul className="space-y-1 text-sm">
                      {info.items.map((it, i) => (
                        <li key={i} className="break-words">{it.name}</li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-baseline justify-between gap-3 border-t border-border pt-2">
                    <span className="text-sm text-muted-foreground">Gesamtsumme brutto</span>
                    <span className="text-lg font-bold text-foreground">{eur(info.gross_amount)}</span>
                  </div>
                  {info.deposit > 0 && <p className="text-xs text-muted-foreground">zzgl. Kaution {eur(info.deposit)} (wird nach Rückgabe erstattet)</p>}
                  {info.valid_until && <p className="text-xs text-muted-foreground">Gültig bis {info.expires_at ? new Date(info.expires_at).toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "short" }) + " Uhr" : dateDe(info.valid_until)} · Alle Details stehen im Angebots-PDF aus der E-Mail.</p>}
                </div>

                {declining ? <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Angebot ablehnen</h2>
                  <Label>Ablehnungsgrund</Label>
                  <Select value={reason} onValueChange={(v) => { if (v in DECLINE_REASONS) setReason(v as keyof typeof DECLINE_REASONS); }}>
                    <SelectTrigger aria-label="Ablehnungsgrund"><SelectValue placeholder="Grund auswählen" /></SelectTrigger>
                    <SelectContent>{Object.entries(DECLINE_REASONS).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
                  </Select>
                  {reason === "price" && info.business_type !== "sales" && <div className="border-l-4 border-accent bg-muted p-4 space-y-2">
                    <h3 className="font-semibold">SLT Rental Tiefpreisgarantie</h3>
                    <p className="text-sm">Ein vergleichbares Mietprodukt günstiger gefunden? Wir prüfen dein Vergleichsangebot nach den Bedingungen unserer Tiefpreisgarantie.</p>
                    <a href="https://www.slt-rental.de/tiefpreisgarantie" target="_blank" rel="noopener noreferrer" className="text-primary underline">Tiefpreisgarantie ansehen</a>
                  </div>}
                  <Label htmlFor="decline-note">Deine Rückmeldung (optional)</Label>
                  <Textarea id="decline-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} />
                  <div className="flex items-start gap-3"><Checkbox id="decline-confirm" checked={declineConfirmed} onCheckedChange={(v) => setDeclineConfirmed(v === true)} /><Label htmlFor="decline-confirm">Ich möchte dieses Angebot endgültig ablehnen.</Label></div>
                  {error && <p className="text-destructive text-sm">{error}</p>}
                  <Button variant="destructive" className="w-full" disabled={!reason || !declineConfirmed || sending} onClick={decline}>{sending ? "Wird gespeichert …" : "Ablehnung bestätigen"}</Button>
                  <Button variant="outline" className="w-full" onClick={() => setDeclining(false)} disabled={sending}>Zurück zur Annahme</Button>
                </div> : <>

                <div className="space-y-2">
                  <Label htmlFor="signer">Vor- und Nachname der unterschreibenden Person</Label>
                  <Input id="signer" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" />
                </div>

                <SignaturePad onSignatureChange={setSignature} height={170} label="Deine Unterschrift" />

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex items-start gap-3">
                    <Checkbox id="agb" checked={agb} onCheckedChange={(v) => setAgb(v === true)} />
                    <label htmlFor="agb" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                      Ich bestätige die <a href="/agb" target="_blank" rel="noopener" className="text-primary underline">{info.agb_kind === "business" ? "AGB für Unternehmer" : "AGB für Verbraucher"}</a> der SLT Rental.
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox id="binding" checked={binding} onCheckedChange={(v) => setBinding(v === true)} />
                    <label htmlFor="binding" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                      Ich nehme das Angebot {info.offer_number} über {eur(info.gross_amount)} brutto rechtsverbindlich an.
                    </label>
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover" size="lg" disabled={!canSubmit} onClick={submit}>
                  {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Angebot verbindlich annehmen
                </Button>
                {!signature && <p className="text-xs text-muted-foreground text-center">Bitte unterschreiben und auf „Unterschrift speichern“ tippen.</p>}
                <Button variant="outline" className="w-full" onClick={() => setDeclining(true)} disabled={sending}>Angebot ablehnen</Button>
                </>}
                <p className="text-xs text-muted-foreground text-center">
                  Fragen? Standort {info.location.name}: {info.location.phone} · {info.location.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
