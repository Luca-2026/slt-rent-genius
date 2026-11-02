import { useMemo, useState } from "react";
import { Calculator, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateFinancing, FINANCING_RATE_PERCENT, FINANCING_TERMS, parseEuro } from "@/lib/financing";

export type FinancingSelection = { term: string; downPayment: string; balloon: string; summary: string };

const eur = (v: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(v);
const plain = (v: number) => new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

/** Beispielrechnung auf Basis des Bruttokaufpreises; Anzahlung in Höhe der USt per Klick. */
export function FinancingCalculator({ priceGross, priceNet, onRequest }: { priceGross: number; priceNet: number; onRequest: (s: FinancingSelection) => void }) {
  const vat = Math.round((priceGross - priceNet) * 100) / 100;
  const [term, setTerm] = useState(48);
  const [mode, setMode] = useState<"none" | "vat" | "custom">("vat");
  const [custom, setCustom] = useState("");
  const [balloonInput, setBalloonInput] = useState("");
  const down = mode === "none" ? 0 : mode === "vat" ? vat : parseEuro(custom);
  const balloon = parseEuro(balloonInput);
  const result = useMemo(() => calculateFinancing(priceGross, down, balloon, term), [priceGross, down, balloon, term]);
  const chip = (active: boolean) => `rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary"}`;

  const summary = result ? `Finanzierungsrechner (Beispiel, ${plain(FINANCING_RATE_PERCENT)} % p. a.): Kaufpreis ${eur(priceGross)} brutto, Anzahlung ${eur(down)}${mode === "vat" ? " (= USt.)" : ""}, Schlussrate ${eur(balloon)}, Laufzeit ${term} Monate → Finanzierungsbetrag ${eur(result.financed)}, Monatsrate ca. ${eur(result.monthly)}` : "";

  return <section className="rounded-lg border border-accent/40 bg-accent/5 p-4 sm:p-5" aria-labelledby="financing-heading">
    <h2 id="financing-heading" className="flex items-center gap-2 text-lg font-bold text-headline"><Calculator className="h-5 w-5 shrink-0 text-accent" />Finanzierung zu günstigen Konditionen</h2>
    <p className="mt-1 text-sm text-foreground/80">Diese Maschine kannst Du bei uns auch finanzieren. Über unsere Partnerbanken prüfen wir das gerne für Dich.</p>

    <div className="mt-4 space-y-4">
      <div>
        <Label className="mb-2 block">Laufzeit</Label>
        <div className="grid grid-cols-5 gap-2">{FINANCING_TERMS.map(t => <button key={t} type="button" aria-pressed={term === t} className={chip(term === t)} onClick={() => setTerm(t)}>{t}<span className="block text-[10px] font-normal">Monate</span></button>)}</div>
      </div>
      <div>
        <Label className="mb-2 block">Anzahlung</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button type="button" aria-pressed={mode === "none"} className={chip(mode === "none")} onClick={() => setMode("none")}>Vollfinanzierung</button>
          <button type="button" aria-pressed={mode === "vat"} className={chip(mode === "vat")} onClick={() => setMode("vat")}>In Höhe der USt. ({eur(vat)})</button>
          <button type="button" aria-pressed={mode === "custom"} className={chip(mode === "custom")} onClick={() => setMode("custom")}>Individuell</button>
        </div>
        {mode === "custom" && <Input className="mt-2" inputMode="decimal" aria-label="Individuelle Anzahlung in Euro" placeholder="Anzahlung in €" value={custom} onChange={e => setCustom(e.target.value)} />}
      </div>
      <div>
        <Label htmlFor="financing-balloon" className="mb-2 block">Schlussrate (optional, €)</Label>
        <Input id="financing-balloon" inputMode="decimal" placeholder="0" value={balloonInput} onChange={e => setBalloonInput(e.target.value)} />
      </div>

      {result ? <div className="rounded-md border border-border bg-background p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2"><span className="text-sm text-muted-foreground">Monatsrate ca.</span><span className="text-2xl font-bold text-primary" data-testid="financing-monthly">{eur(result.monthly)}</span></div>
        <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Kaufpreis brutto</dt><dd className="text-right">{eur(priceGross)}</dd>
          <dt className="text-muted-foreground">Anzahlung</dt><dd className="text-right">{eur(down)}</dd>
          <dt className="text-muted-foreground">Finanzierungsbetrag</dt><dd className="text-right font-semibold">{eur(result.financed)}</dd>
          {balloon > 0 && <><dt className="text-muted-foreground">Schlussrate</dt><dd className="text-right">{eur(balloon)}</dd></>}
          <dt className="text-muted-foreground">Zinsen gesamt ca.</dt><dd className="text-right">{eur(result.interest)}</dd>
        </dl>
      </div> : <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">Bitte gültige Beträge eingeben: Anzahlung und Schlussrate müssen zusammen unter dem Kaufpreis liegen.</p>}

      <p className="text-xs text-muted-foreground">Unverbindliche Beispielrechnung mit angenommenem Sollzins von {plain(FINANCING_RATE_PERCENT)} % p. a. Die tatsächlichen Konditionen hängen von der Prüfung durch unsere Partnerbanken ab und sind kein Finanzierungsangebot.</p>
      <Button type="button" className="w-full" disabled={!result} onClick={() => onRequest({ term: String(term), downPayment: plain(down), balloon: balloon > 0 ? plain(balloon) : "", summary })}>Finanzierung anfragen <ArrowRight className="ml-2 h-4 w-4" /></Button>
    </div>
  </section>;
}
