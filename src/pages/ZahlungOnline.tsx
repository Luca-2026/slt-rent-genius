import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, Lock, AlertTriangle } from "lucide-react";
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

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase.functions.invoke("offer-pay", { body: { token, action: "info" } });
    if (err || !data || (data as { error?: string }).error) {
      setError("Dieser Zahlungslink ist nicht gültig. Bitte wende dich an dein SLT-Rental-Team.");
      setInfo(null);
    } else {
      setInfo(data as PayInfo);
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
      body: { token, action: "checkout", origin: window.location.origin },
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
                <dl className="space-y-2 text-sm">
                  {info.rent_cents > 0 && (
                    <div className="flex justify-between"><dt className="text-muted-foreground">Miete (brutto)</dt><dd className="font-medium">{eur(info.rent_cents)}</dd></div>
                  )}
                  {info.deposit_cents > 0 && (
                    <div className="flex justify-between"><dt className="text-muted-foreground">Kaution (wird nach Rückgabe erstattet)</dt><dd className="font-medium">{eur(info.deposit_cents)}</dd></div>
                  )}
                  <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                    <dt>Gesamtbetrag</dt><dd>{eur(info.amount_cents)}</dd>
                  </div>
                </dl>
                {params.get("status") === "cancelled" && (
                  <p className="text-sm text-muted-foreground">Die Zahlung wurde abgebrochen. Du kannst es jederzeit erneut versuchen.</p>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button onClick={pay} disabled={starting} size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  {starting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                  Jetzt sicher bezahlen
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Die Zahlung läuft über Stripe. Die Kaution erstatten wir nach der Rückgabe auf das Zahlungsmittel, mit dem du bezahlt hast.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
