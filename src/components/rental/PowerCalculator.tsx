import { useMemo, useState } from "react";
import { Zap, Plus, Trash2, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { calculatePower, consumerPowerKw } from "@/lib/powerCalculator";
import { getLocationById } from "@/data/rentalData";
import { useManagedProductsVersion } from "@/data/managedProductsCache";
import { CalculatorRecommendations, ToolsLink } from "./CalculatorRecommendations";

const num = (v: string) => parseFloat(v.replace(",", ".")) || 0;
type Row = { id: number; name: string; kw: string; qty: string };

export function PowerCalculator({ locationId, showToolsLink = true }: { locationId: string; showToolsLink?: boolean }) {
  const [rows, setRows] = useState<Row[]>([{ id: 1, name: "", kw: "", qty: "1" }]);
  const [grid, setGrid] = useState(true);
  const [distance, setDistance] = useState("10");
  const [days, setDays] = useState("5");
  const set = (id: number, p: Partial<Row>) => setRows((r) => r.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const version = useManagedProductsVersion();
  const available = useMemo(() => { const set = new Set(Object.values(getLocationById(locationId)?.products ?? {}).flat().map((p) => p.id)); return (slug: string) => set.has(slug); }, [locationId, version]);
  const catalog = useMemo(() => {
    const seen = new Map<string, number>();
    for (const p of Object.values(getLocationById(locationId)?.products ?? {}).flat()) {
      const kw = consumerPowerKw(p.specifications);
      if (kw != null && !seen.has(p.name)) seen.set(p.name, kw);
    }
    return [...seen].sort((a, b) => a[0].localeCompare(b[0], "de")).map(([name, kw]) => ({ name, kw }));
  }, [locationId, version]);
  const pickName = (id: number, name: string) => { const hit = catalog.find((c) => c.name === name); set(id, hit ? { name, kw: hit.kw.toLocaleString("de-DE") } : { name }); };
  const selectAll = (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.select();
  const result = useMemo(() => calculatePower({ consumers: rows.map((r) => ({ kw: num(r.kw), qty: Math.round(num(r.qty)) })), gridConnection: grid, distanceM: num(distance), available }), [rows, grid, distance, available]);
  const lines = result ? [result.generator, result.distributor, ...result.cables].filter((l): l is { slug: string; qty: number } => !!l) : [];
  const rentalDays = Math.max(0, Math.round(num(days)));

  return (
    <section className="bg-card rounded-xl border border-border p-4 sm:p-5" aria-labelledby="power-calc">
      <h2 id="power-calc" className="text-base sm:text-lg font-semibold text-headline mb-1 flex items-center gap-2"><Zap className="h-5 w-5 text-primary flex-shrink-0" /> Baustromrechner</h2>
      <p className="text-sm text-muted-foreground mb-4">Wähle Geräte aus unserem Mietsortiment – die Leistung tragen wir automatisch ein – oder trage eigene Verbraucher mit der Leistung vom Typenschild ein. Wir schlagen Verteiler, Zuleitung und bei Bedarf ein Aggregat vor.</p>
      <datalist id="pc-catalog">{catalog.map((c) => <option key={c.name} value={c.name}>{c.kw.toLocaleString("de-DE")} kW</option>)}</datalist>
      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={r.id} className="grid grid-cols-[1fr_auto] sm:grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end rounded-lg border border-border p-3 sm:border-0 sm:p-0">
            <div className="col-span-2 sm:col-span-1 space-y-1 min-w-0"><Label htmlFor={`pc-n-${r.id}`}>Verbraucher {i + 1}</Label><Input id={`pc-n-${r.id}`} value={r.name} list="pc-catalog" autoComplete="off" onChange={(e) => pickName(r.id, e.target.value)} placeholder="Gerät aus unserem Sortiment oder eigenes" /></div>
            <div className="grid grid-cols-2 gap-2 sm:contents">
              <div className="space-y-1 min-w-0"><Label htmlFor={`pc-k-${r.id}`}>Leistung (kW)</Label><Input id={`pc-k-${r.id}`} inputMode="decimal" value={r.kw} onFocus={selectAll} onChange={(e) => set(r.id, { kw: e.target.value })} placeholder="z. B. 2,2" /></div>
              <div className="space-y-1 min-w-0"><Label htmlFor={`pc-q-${r.id}`}>Anzahl</Label><Input id={`pc-q-${r.id}`} inputMode="numeric" value={r.qty} onFocus={selectAll} onChange={(e) => set(r.id, { qty: e.target.value })} /></div>
            </div>
            <Button variant="ghost" size="icon" aria-label={`Verbraucher ${i + 1} entfernen`} disabled={rows.length === 1} onClick={() => setRows((x) => x.filter((y) => y.id !== r.id))}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setRows((x) => [...x, { id: Math.max(...x.map((y) => y.id)) + 1, name: "", kw: "", qty: "1" }])}><Plus className="h-4 w-4" /> Verbraucher hinzufügen</Button>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1"><Label htmlFor="pc-d">Entfernung zum Anschluss (m)</Label><Input id="pc-d" inputMode="decimal" value={distance} onFocus={selectAll} onChange={(e) => setDistance(e.target.value)} /></div>
        <div className="space-y-1"><Label htmlFor="pc-t">Mietdauer (Tage)</Label><Input id="pc-t" inputMode="numeric" value={days} onFocus={selectAll} onChange={(e) => setDays(e.target.value)} /></div>
      </div>
      <label className="mt-4 flex items-center justify-between gap-3 text-sm"><span>Baustromanschluss vorhanden (sonst Aggregat)</span><Switch checked={grid} onCheckedChange={setGrid} /></label>

      {result && (
        <div className="mt-5 rounded-lg bg-primary text-primary-foreground p-4">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div><div className="opacity-80">Leistung</div><div className="font-semibold">{result.totalKw.toLocaleString("de-DE")} kW</div></div>
            <div><div className="opacity-80">Bedarf</div><div className="font-semibold">{result.kva.toLocaleString("de-DE")} kVA</div></div>
            <div><div className="opacity-80">Strom</div><div className="font-semibold">{result.ampere.toLocaleString("de-DE")} A</div></div>
          </div>
          <p className="mt-2 text-xs opacity-80">Alle Verbraucher gleichzeitig gerechnet, cos φ 0,8, 400 V Drehstrom.</p>
        </div>
      )}
      {result?.overCapacity && <p className="mt-3 text-sm text-destructive">Dieser Bedarf übersteigt unser Online-Sortiment. Wir planen das gern individuell mit dir.</p>}
      {result?.feedOnRequest && <p className="mt-3 text-sm">Die Zuleitung über 63 A stimmen wir mit dir ab.</p>}
      {result && lines.length > 0 && <CalculatorRecommendations locationId={locationId} days={rentalDays} lines={lines} />}
      <p className="mt-3 text-xs text-muted-foreground flex gap-2"><Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />Richtwert ohne Gewähr. Anlaufströme von Motoren, Spannungsfall bei langen Leitungen und die Absicherung nach DIN VDE 0100-704 müssen von einer Elektrofachkraft geprüft werden.</p>
      {showToolsLink && <ToolsLink />}
    </section>
  );
}
