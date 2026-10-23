import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, FileSignature, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignaturePad } from "@/components/b2b/SignaturePad";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

interface Info { number: string; order_code: string; name: string; items: { name: string; quantity: number; detail: string | null }[]; file_url: string | null; signed_at: string | null; signer: string | null }
export default function DeliveryProtocolSign() {
  const { token = "" } = useParams();
  const [info, setInfo] = useState<Info | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [agb, setAgb] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const { data, error: err } = await supabase.functions.invoke("delivery-protocol-sign", { body: { action: "info", token } });
    if (err || !data || data.error) { setError("Dieser Link ist ungültig oder abgelaufen. Bitte wende dich an SLT-Rental."); }
    else { setInfo(data); setName(data.name ?? ""); }
    setLoading(false);
  }, [token]);
  useEffect(() => { void load(); }, [load]);
  const sign = async () => {
    if (!signature || !agb || !confirmed || name.trim().length < 2) return;
    setBusy(true); setError("");
    const { data, error: err } = await supabase.functions.invoke("delivery-protocol-sign", { body: { action: "sign", token, signer: name.trim(), signature, agb_accepted: agb, items_confirmed: confirmed } });
    if (err || !data?.success) {
      let message = data?.error;
      try { message = message ?? (await (err as { context?: Response })?.context?.json())?.error; } catch { /* network */ }
      setError(message ?? "Die Unterschrift konnte nicht gespeichert werden. Bitte erneut versuchen.");
    } else { await load(); window.scrollTo({ top: 0 }); }
    setBusy(false);
  };
  return <main className="min-h-screen bg-background text-foreground px-4 py-8 sm:py-12">
    <SEO title="Übergabeprotokoll unterschreiben – SLT-Rental" description="Persönliches Übergabeprotokoll prüfen und digital unterschreiben." noIndex />
    <div className="mx-auto max-w-2xl space-y-6">
      <p className="text-primary font-semibold text-xl">SLT-Rental</p>
      <h1 className="text-2xl font-semibold">Übergabeprotokoll</h1>
      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : info && <>
        <div className="border-b pb-4 space-y-1"><p className="font-medium">{info.number} · Auftrag #{info.order_code}</p><p className="text-muted-foreground">{info.name}</p></div>
        {info.signed_at ? <div className="space-y-2"><CheckCircle2 className="h-8 w-8 text-primary" /><h2 className="text-xl font-semibold">Unterschrift gespeichert</h2><p>{info.signer} · {new Date(info.signed_at).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })} Uhr</p></div> : <ul className="divide-y divide-border">{info.items.map((it, i) => <li key={i} className="flex justify-between gap-4 py-3"><div className="min-w-0 break-words">{it.name}{it.detail && <p className="text-sm text-muted-foreground">{it.detail}</p>}</div><strong className="shrink-0">{it.quantity} ×</strong></li>)}</ul>}
        {info.file_url && <Button asChild variant="outline"><a href={info.file_url} target="_blank" rel="noreferrer">PDF ansehen</a></Button>}
        {!info.signed_at && <div className="space-y-5">
          <div className="space-y-2"><Label htmlFor="signer">Vor- und Nachname</Label><Input id="signer" value={name} onChange={e => setName(e.target.value)} maxLength={120} /></div>
          <label className="flex items-start gap-3 text-sm"><Checkbox checked={agb} onCheckedChange={v => setAgb(v === true)} /><span>Ich habe die <a href="https://www.slt-rental.de/agb" target="_blank" rel="noreferrer" className="underline">Allgemeinen Geschäftsbedingungen</a> und die Auftragsbestätigung erhalten und zur Kenntnis genommen.</span></label>
          <label className="flex items-start gap-3 text-sm"><Checkbox checked={confirmed} onCheckedChange={v => setConfirmed(v === true)} /><span>Ich bestätige die Übernahme der aufgeführten Mietgegenstände und die im PDF dokumentierten Mengen, Zustandswerte und Mängel.</span></label>
          <SignaturePad label="Unterschrift Kunde" onSignatureChange={setSignature} />
          <Button className="w-full" disabled={busy || !signature || !agb || !confirmed || name.trim().length < 2} onClick={sign}><FileSignature className="h-4 w-4 mr-2" />{busy ? "Wird gespeichert …" : "Übergabeprotokoll unterschreiben"}</Button>
        </div>}
      </>}
      {error && <p role="alert" className="text-destructive break-words">{error}</p>}
    </div>
  </main>;
}