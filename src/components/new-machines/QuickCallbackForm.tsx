import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { PhoneCall, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  vorname: z.string().trim().min(1, "Bitte Vornamen angeben").max(80),
  nachname: z.string().trim().min(1, "Bitte Nachnamen angeben").max(80),
  telefon: z.string().trim().regex(/^[+0-9 ()/-]{6,30}$/, "Bitte gültige Telefonnummer angeben"),
  email: z.string().trim().email("Bitte gültige E-Mail angeben").max(255),
});

/**
 * Kurzanfrage "Rückruf gewünscht" für Verkaufsartikel. Nutzt dieselbe
 * Kaufanfrage-Funktion wie das lange Formular (Speicherung + Mail an Vertrieb).
 */
export function QuickCallbackForm({ brand, model, category }: { brand: string; model: string; category?: string | null }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ vorname: "", nachname: "", telefon: "", email: "" });
  const [privacy, setPrivacy] = useState(false);
  const [sending, setSending] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Bitte prüfen", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    if (!privacy) {
      toast({ title: "Bitte prüfen", description: "Bitte der Datenschutzerklärung zustimmen.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-purchase-inquiry", {
        body: {
          ...parsed.data,
          marke: brand,
          produktkategorie: category || "Neumaschine",
          modell: model,
          anzahl: "1",
          kundentyp: "unbekannt",
          lieferOption: "beratung",
          rechnungGleich: true,
          nachricht: `RÜCKRUF GEWÜNSCHT – Kurzanfrage von der Artikelseite ${brand} ${model}.`,
          wieGefunden: "Rückruf-Kurzanfrage (Artikelseite)",
          addons: [],
        },
      });
      if (error) throw error;
      navigate("/verkauf/danke");
    } catch (err) {
      console.error("Callback inquiry error:", err);
      toast({ title: "Senden fehlgeschlagen", description: "Bitte versuche es erneut oder ruf uns an: 02151 417 99 04.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="mb-6 border-accent/40">
      <CardContent className="p-5">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
            <PhoneCall className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-foreground">Rückruf zu {brand} {model}</p>
            <p className="text-sm text-muted-foreground">Kurz eintragen – unser Vertrieb meldet sich persönlich bei dir.</p>
          </div>
        </div>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2" noValidate>
          <div className="space-y-1">
            <Label htmlFor="cb-vorname">Vorname *</Label>
            <Input id="cb-vorname" autoComplete="given-name" value={form.vorname} onChange={set("vorname")} maxLength={80} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cb-nachname">Nachname *</Label>
            <Input id="cb-nachname" autoComplete="family-name" value={form.nachname} onChange={set("nachname")} maxLength={80} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cb-telefon">Telefon *</Label>
            <Input id="cb-telefon" type="tel" inputMode="tel" autoComplete="tel" value={form.telefon} onChange={set("telefon")} maxLength={30} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cb-email">E-Mail *</Label>
            <Input id="cb-email" type="email" autoComplete="email" value={form.email} onChange={set("email")} maxLength={255} />
          </div>
          <label className="flex items-start gap-2 text-xs text-muted-foreground sm:col-span-2">
            <Checkbox checked={privacy} onCheckedChange={(v) => setPrivacy(v === true)} className="mt-0.5" aria-label="Datenschutz zustimmen" />
            <span>
              Ich bin einverstanden, dass meine Angaben zur Bearbeitung des Rückrufs gespeichert werden (
              <a href="/datenschutz/" className="underline">Datenschutz</a>). *
            </span>
          </label>
          <Button type="submit" size="lg" disabled={sending} className="min-h-12 bg-accent font-bold text-accent-foreground hover:bg-accent/90 sm:col-span-2">
            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PhoneCall className="mr-2 h-4 w-4" />}
            Rückruf anfordern
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
