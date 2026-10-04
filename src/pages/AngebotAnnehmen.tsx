import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, FileSignature, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignaturePad } from "@/components/b2b/SignaturePad";
import { supabase } from "@/integrations/supabase/client";

interface AcceptInfo {
  status: "active" | "accepted" | "superseded" | "expired" | "closed";
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
}

const eur = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n || 0);
const dateDe = (d: string | null) => (d ? new Date(d).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" }) : "");

const STATUS_TEXT: Record<string, string> = {
  superseded: "Zu diesem Angebot gibt es eine neuere Fassung. Bitte nutze den Link aus der neuesten E-Mail.",
  expired: "Dieses Angebot ist abgelaufen. Melde dich gerne bei uns, dann erstellen wir dir ein neues Angebot.",
  closed: "Diese Anfrage ist bereits abgeschlossen. Bei Fragen melde dich gerne bei uns.",
};

export default function AngebotAnnehmen() {
  const { token = "" } = useParams();
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
    load();
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
                  Du bekommst eine Bestätigung per E-Mail und in Kürze unsere Auftragsbestätigung.
                </p>
              </div>
            ) : info.status !== "active" ? (
              <div className="flex gap-3 text-foreground"><AlertTriangle className="h-6 w-6 shrink-0 text-destructive" /><p>{STATUS_TEXT[info.status]}</p></div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground">Angebot {info.offer_number}{info.customer_name ? ` · ${info.customer_name}` : ""}</p>
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><FileSignature className="h-6 w-6 text-primary" /> Angebot annehmen</h1>
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
                  {info.valid_until && <p className="text-xs text-muted-foreground">Gültig bis {dateDe(info.valid_until)} · Alle Details stehen im Angebots-PDF aus der E-Mail.</p>}
                </div>

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
