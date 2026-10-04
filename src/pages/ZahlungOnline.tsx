import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, Lock, AlertTriangle, Landmark, CreditCard } from "lucide-react";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface PayInfo {
  status: "active" | "paid" | "superseded" | "void" | "amount_mismatch";
  offer_number: string;
  rent_cents: number;
  deposit_cents: number;
  amount_cents: number;
  payment_terms?: string;
  paid_cents?: number;
  options?: { choice: "anzahlung" | "full"; rentCents: number; depositCents: number; amountCents: number }[];
  bank?: { holder: string; iban: string; bic: string; bank: string; reference: string } | null;
}

const eur = (cents: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);

export default function ZahlungOnline() {
  const { token = "" } = useParams();
  const [params] = useSearchParams();
  const [info, setInfo] = useState<PayInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [choice, setChoice] = useState<"anzahlung" | "full">("full");
  const [method, setMethod] = useState<"online" | "bank">("online");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase.functions.invoke("offer-pay", { body: { token, action: "info" } });
    if (err || !data || (data as { error?: string }).error) {
      setError("Dieser Zahlungslink ist nicht gültig. Bitte wende dich an dein SLT-Rental-Team.");
      setInfo(null);
    } else {
      const d = data as PayInfo;
      setInfo(d);
      setChoice(d.options?.some((o) => o.choice === "anzahlung") ? "anzahlung" : "full");
      setError(null);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const pay = async () => {
    setStarting(true);
    setError(null);
    const { data, error: err } = await supabase.functions.invoke("offer-pay", {
      body: { token, action: "checkout", choice, origin: window.location.origin },
    });
    const url = (data as { url?: string } | null)?.url;
    if (err || !url) {
      setError((data as { error?: string } | null)?.error ?? "Die Zahlung konnte nicht gestartet werden. Bitte versuche es erneut.");
      setStarting(false);
      load();
      return;
    }
    window.location.href = url;
  };

  const justPaid = params.get("status") === "success";
  const options = info?.options ?? [];
  const selected = options.find((o) => o.choice === choice) ?? options[options.length - 1];

  return (
    <Layout>
      <SEO title="Online bezahlen – SLT Rental" description="Persönlicher Zahlungslink zu deinem Angebot." noIndex />
      <section className="py-16 lg:py-24 bg-background">
        <div className="section-container max-w-xl mx-auto">
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : !info ? (
              <div className="flex gap-3 text-foreground">
                <AlertTriangle className="h-6 w-6 shrink-0 text-destructive" />
                <p>{error}</p>
              </div>
            ) : info.status === "paid" || justPaid ? (
              <div className="text-center space-y-3">
                <CheckCircle2 className="h-14 w-14 text-primary mx-auto" />
                <h1 className="text-2xl font-bold text-foreground">Vielen Dank für deine Zahlung</h1>
                <p className="text-muted-foreground">
                  {info.status === "paid"
                    ? `Wir haben deine Zahlung zu Angebot ${info.offer_number} erhalten. Die Auftragsbestätigung bekommst du in Kürze per E-Mail.`
                    : "Deine Zahlung wird gerade verarbeitet. Sobald sie bei uns eingegangen ist, bekommst du die Auftragsbestätigung per E-Mail."}
                </p>
              </div>
            ) : info.status !== "active" ? (
              <div className="flex gap-3 text-foreground">
                <AlertTriangle className="h-6 w-6 shrink-0 text-destructive" />
                <p>
                  Dieser Zahlungslink gilt nicht mehr, zum Beispiel weil es ein überarbeitetes Angebot gibt. Bitte nutze den Link in der neuesten E-Mail oder melde dich bei deinem SLT-Rental-Team.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground">Angebot {info.offer_number}</p>
                  <h1 className="text-2xl font-bold text-foreground">Online bezahlen</h1>
                </div>
                {(info.paid_cents ?? 0) > 0 && (
                  <p className="text-sm text-muted-foreground">Bereits bezahlt: {eur(info.paid_cents ?? 0)}. Offen ist noch der Restbetrag.</p>
                )}

                {options.length > 1 && (
                  <fieldset className="space-y-2">
                    <legend className="text-sm font-semibold text-foreground mb-2">Wie viel möchtest du jetzt zahlen?</legend>
                    {options.map((o) => (
                      <label key={o.choice} className={`flex items-center justify-between gap-3 rounded-lg border p-3 cursor-pointer ${choice === o.choice ? "border-primary bg-primary/5" : "border-border"}`}>
                        <span className="flex items-center gap-3">
                          <input type="radio" name="choice" checked={choice === o.choice} onChange={() => setChoice(o.choice)} className="accent-primary" />
                          <span>
                            <span className="block font-medium text-foreground">{o.choice === "anzahlung" ? "30 % Anzahlung" : "Gesamtbetrag"}</span>
                            <span className="block text-xs text-muted-foreground">
                              {o.choice === "anzahlung" ? "Restbetrag inkl. Kaution vor Mietbeginn" : o.depositCents > 0 ? `inkl. Kaution ${eur(o.depositCents)}` : "Miete komplett"}
                            </span>
                          </span>
                        </span>
                        <span className="font-bold text-foreground">{eur(o.amountCents)}</span>
                      </label>
                    ))}
                  </fieldset>
                )}

                {options.length <= 1 && selected && (
                  <dl className="space-y-2 text-sm">
                    {selected.rentCents > 0 && (
                      <div className="flex justify-between"><dt className="text-muted-foreground">Miete (brutto)</dt><dd className="font-medium">{eur(selected.rentCents)}</dd></div>
                    )}
                    {selected.depositCents > 0 && (
                      <div className="flex justify-between"><dt className="text-muted-foreground">Kaution (wird nach Rückgabe erstattet)</dt><dd className="font-medium">{eur(selected.depositCents)}</dd></div>
                    )}
                    <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                      <dt>Gesamtbetrag</dt><dd>{eur(selected.amountCents)}</dd>
                    </div>
                  </dl>
                )}

                <fieldset className="space-y-2">
                  <legend className="text-sm font-semibold text-foreground mb-2">Zahlungsart</legend>
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant={method === "online" ? "default" : "outline"} onClick={() => setMethod("online")}>
                      <CreditCard className="h-4 w-4 mr-2" />Online
                    </Button>
                    <Button type="button" variant={method === "bank" ? "default" : "outline"} onClick={() => setMethod("bank")}>
                      <Landmark className="h-4 w-4 mr-2" />Überweisung
                    </Button>
                  </div>
                </fieldset>

                {params.get("status") === "cancelled" && (
                  <p className="text-sm text-muted-foreground">Die Zahlung wurde abgebrochen. Du kannst es jederzeit erneut versuchen.</p>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}

                {method === "online" ? (
                  <>
                    <Button onClick={pay} disabled={starting || !selected} size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      {starting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                      {selected ? `${eur(selected.amountCents)} jetzt sicher bezahlen` : "Jetzt sicher bezahlen"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Die Zahlung läuft sicher über Stripe. Eine Kaution erstatten wir nach der Rückgabe auf das Zahlungsmittel, mit dem du bezahlt hast.
                    </p>
                  </>
                ) : info.bank ? (
                  <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm space-y-1">
                    <p className="font-semibold text-foreground mb-2">Bitte überweise {selected ? eur(selected.amountCents) : "den Betrag"} auf:</p>
                    <p><span className="text-muted-foreground">Empfänger:</span> {info.bank.holder}</p>
                    <p><span className="text-muted-foreground">IBAN:</span> <span className="font-mono">{info.bank.iban}</span></p>
                    <p><span className="text-muted-foreground">BIC:</span> <span className="font-mono">{info.bank.bic}</span> ({info.bank.bank})</p>
                    <p><span className="text-muted-foreground">Verwendungszweck:</span> <strong>{info.bank.reference}</strong></p>
                    <p className="text-xs text-muted-foreground pt-2">Sobald die Überweisung bei uns eingegangen ist, bekommst du die Auftragsbestätigung per E-Mail.</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
