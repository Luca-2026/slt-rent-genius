import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Shovel, Plus, Trash2, Info, AlertTriangle, Printer, Share2, RotateCcw, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getLocationById, getProductsForLocationCategory } from "@/data/rentalData";
import { useManagedProductsVersion } from "@/data/managedProductsCache";
import { CalculatorRecommendations, ToolsLink } from "./CalculatorRecommendations";
import {
  SOILS, type SoilKey, type Shape, type ShapeKind, shapeVolume, shapeDepthM, soilResult, dumperTrips, readMachine,
  recommendExcavators, TRENCH_SAFETY_DEPTH_M, type Assessment,
} from "@/lib/excavationCalculator";

const PROJECTS = ["Terrasse oder Pflasterfläche", "Garten und Geländemodellierung", "Pool oder Schwimmbecken", "Fundament", "Kabel- oder Rohrgraben", "Baugrube", "Einfahrt oder Parkplatz", "Sonstiges Aushubprojekt"];
const SHAPES: { kind: ShapeKind; label: string; fields: [keyof Shape, string][] }[] = [
  { kind: "rect", label: "Rechteck", fields: [["a", "Länge (m)"], ["b", "Breite (m)"], ["c", "Tiefe (cm)"]] },
  { kind: "area", label: "Fläche", fields: [["a", "Fläche (m²)"], ["c", "Tiefe (cm)"]] },
  { kind: "trench", label: "Graben", fields: [["a", "Länge (m)"], ["b", "Breite (cm)"], ["c", "Tiefe (cm)"]] },
  { kind: "circle", label: "Kreis", fields: [["a", "Durchmesser (m)"], ["c", "Tiefe (cm)"]] },
  { kind: "volume", label: "Bekanntes Volumen", fields: [["a", "Volumen (m³)"]] },
];
interface State { project: number; shapes: { kind: ShapeKind; v: Record<string, string> }[]; soil: SoilKey; density: string; loosening: string; access: string; fill: string; days: string }
const INITIAL: State = { project: 0, shapes: [{ kind: "area", v: { a: "40", c: "30" } }], soil: "unbekannt", density: "", loosening: "", access: "", fill: "85", days: "1" };
const KEY = "slt-excavation-calc";
const num = (v?: string) => { const x = parseFloat((v ?? "").replace(",", ".")); return isFinite(x) && x > 0 ? x : 0; };
const f = (v: number, d = 1) => v.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });

function loadState(): State {
  try {
    const p = new URLSearchParams(window.location.search).get("aushub");
    if (p) return { ...INITIAL, ...JSON.parse(decodeURIComponent(atob(p))) };
    const s = sessionStorage.getItem(KEY); if (s) return { ...INITIAL, ...JSON.parse(s) };
  } catch { /* ungültige Daten ignorieren */ }
  return INITIAL;
}

export function excavationHeading(subcategory?: string) {
  if (!subcategory) return "Plane dein Erdbewegungsprojekt";
  if (/bagger/.test(subcategory)) return "Ist dieser Bagger für dein Projekt geeignet?";
  if (/dumper/.test(subcategory)) return "Wie viele Fahrten benötigst du für deinen Erdaushub?";
  if (/lader/.test(subcategory)) return "Berechne den Materialbedarf für dein Bauprojekt";
  return "Plane dein Erdbewegungsprojekt";
}

export function ExcavationCalculator({ locationId, currentProductId, heading = "Aushubrechner", collapsible = false, showToolsLink = true }: { locationId?: string; currentProductId?: string; heading?: string; collapsible?: boolean; showToolsLink?: boolean }) {
  const [s, setS] = useState<State>(loadState);
  const [open, setOpen] = useState(!collapsible);
  const [expert, setExpert] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => { try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch { /* */ } }, [s]);
  const set = (p: Partial<State>) => setS((o) => ({ ...o, ...p }));
  const version = useManagedProductsVersion();

  const shapes: Shape[] = s.shapes.map((x) => ({ kind: x.kind, a: num(x.v.a), b: num(x.v.b), c: num(x.v.c) }));
  const bank = shapes.reduce((t, x) => t + shapeVolume(x), 0);
  const maxDepth = Math.max(0, ...shapes.map(shapeDepthM));
  const soil = SOILS[s.soil];
  const density = (expert && num(s.density)) || soil.density;
  const loosening = expert && s.loosening !== "" ? Math.max(0, parseFloat(s.loosening.replace(",", ".")) || 0) : soil.loosening;
  const r = soilResult(bank, density, loosening);
  const accessM = num(s.access) / 100 || undefined;
  const fill = Math.min(1, (num(s.fill) || 85) / 100);
  const days = Math.max(1, Math.round(num(s.days) || 1));

  const machines = useMemo(() => {
    const list = locationId ? getProductsForLocationCategory(locationId, "erdbewegung") : [];
    return list.map((p) => ({ id: p.id, name: p.name, sub: p.category ?? "", onRequest: !!p.onRequest, data: readMachine(p.specifications) }));
  }, [locationId, version]);
  const excavators = machines.filter((m) => /bagger/.test(m.sub));
  const pick = useMemo(() => recommendExcavators(excavators, { volume: bank, depthM: maxDepth, accessM }), [excavators, bank, maxDepth, accessM]);
  const dumpers = machines.filter((m) => /dumper/.test(m.sub)).map((m) => ({ ...m, trips: dumperTrips(r.loose, r.looseDensity, m.data.struckM3 ?? 0, m.data.payloadKg ?? 0, fill), fits: accessM == null || m.data.widthM == null ? null : m.data.widthM + 0.2 <= accessM }));
  const bestDumper = dumpers.filter((d) => d.trips && d.fits !== false).sort((a, b) => a.trips!.trips - b.trips!.trips)[0];
  const current = currentProductId ? machines.find((m) => m.id === currentProductId) : undefined;
  const currentAssess: Assessment | undefined = current && /bagger/.test(current.sub) ? [pick.main, pick.compact, pick.strong, ...pick.unsuitable, ...pick.unchecked].find((a) => a?.id === current.id) : undefined;
  const safety = maxDepth > TRENCH_SAFETY_DEPTH_M || [3, 5].includes(s.project) || bank > 100;
  const lines = [pick.main && { slug: pick.main.id, qty: 1 }, bestDumper && { slug: bestDumper.id, qty: 1 }].filter(Boolean) as { slug: string; qty: number }[];
  const locName = locationId ? getLocationById(locationId)?.name : undefined;

  const share = async () => {
    const url = `https://www.slt-rental.de/tools/aushubrechner${locationId ? `?standort=${locationId}&` : "?"}aushub=${btoa(encodeURIComponent(JSON.stringify(s)))}`;
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { window.prompt("Link kopieren", url); }
  };
  const setShape = (i: number, p: Partial<State["shapes"][number]>) => set({ shapes: s.shapes.map((x, j) => (j === i ? { ...x, ...p } : x)) });

  const tile = (label: string, value: string, note?: string) => (
    <div className="rounded-lg border border-border bg-background p-3 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-headline break-words">{value}</p>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
  );
  const machineRow = (title: string, a?: Assessment) => a && (
    <li className="p-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">{title}</p>
      <Link to={`/mieten/${locationId}/erdbewegung/${a.id}`} className="font-semibold text-primary hover:underline">{a.name}</Link>
      {machines.find((m) => m.id === a.id)?.onRequest && <span className="ml-1 text-muted-foreground">(auf Anfrage)</span>}
      {a.reasons.length > 0 && <p className="text-muted-foreground">{a.reasons.join(" · ")}</p>}
    </li>
  );

  return (
    <section className="bg-card rounded-xl border border-border p-4 sm:p-5 print:border-0" aria-labelledby="exc-calc">
      <h2 id="exc-calc" className="text-base sm:text-lg font-semibold text-headline mb-1 flex items-center gap-2"><Shovel className="h-5 w-5 text-primary flex-shrink-0" /> {heading}</h2>
      <p className="text-sm text-muted-foreground mb-3">Berechne deinen Erdaushub und finde passende Baumaschinen{locName ? ` an unserem Standort in ${locName}` : ""}.</p>
      {collapsible && !open && <Button onClick={() => setOpen(true)} className="h-auto min-h-10 whitespace-normal">Aushub & Maschinenbedarf berechnen <ChevronDown className="h-4 w-4" /></Button>}
      {open && (<div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4 min-w-0">
          <div className="space-y-1.5">
            <Label htmlFor="exc-project">Projektart</Label>
            <select id="exc-project" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={s.project} onChange={(e) => set({ project: +e.target.value, ...(+e.target.value === 4 && s.shapes.length === 1 ? { shapes: [{ kind: "trench", v: {} }] } : {}) })}>
              {PROJECTS.map((p, i) => <option key={p} value={i}>{p}</option>)}
            </select>
          </div>
          {s.shapes.map((sh, i) => { const def = SHAPES.find((x) => x.kind === sh.kind)!; return (
            <fieldset key={i} className="rounded-lg border border-border p-3 space-y-2 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <legend className="text-sm font-medium">Teilfläche {i + 1}</legend>
                {s.shapes.length > 1 && <button type="button" aria-label={`Teilfläche ${i + 1} entfernen`} onClick={() => set({ shapes: s.shapes.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4 text-muted-foreground" /></button>}
              </div>
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Berechnungsart">
                {SHAPES.map((x) => <button key={x.kind} type="button" role="radio" aria-checked={sh.kind === x.kind} onClick={() => setShape(i, { kind: x.kind, v: {} })} className={`rounded-md border px-2.5 py-1 text-xs font-medium ${sh.kind === x.kind ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>{x.label}</button>)}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {def.fields.map(([k, label]) => (
                  <div key={k} className="space-y-1 min-w-0">
                    <Label htmlFor={`exc-${i}-${k}`} className="text-xs">{label}</Label>
                    <Input id={`exc-${i}-${k}`} inputMode="decimal" value={sh.v[k] ?? ""} onFocus={(e) => e.currentTarget.select()} onChange={(e) => setShape(i, { v: { ...sh.v, [k]: e.target.value } })} />
                  </div>))}
              </div>
            </fieldset>); })}
          <Button type="button" variant="outline" size="sm" onClick={() => set({ shapes: [...s.shapes, { kind: "rect", v: {} }] })}><Plus className="h-4 w-4" /> Teilfläche hinzufügen</Button>
          <div className="space-y-1.5">
            <Label htmlFor="exc-soil">Bodenart</Label>
            <select id="exc-soil" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={s.soil} onChange={(e) => set({ soil: e.target.value as SoilKey })}>
              {(Object.keys(SOILS) as SoilKey[]).map((k) => <option key={k} value={k}>{SOILS[k].label}</option>)}
            </select>
            <p className="text-xs text-muted-foreground">Planungswert: {f(soil.density)} t/m³, {soil.loosening} % Auflockerung</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1 min-w-0"><Label htmlFor="exc-access" className="text-xs">Schmalste Zufahrt (cm, optional)</Label><Input id="exc-access" inputMode="decimal" value={s.access} onFocus={(e) => e.currentTarget.select()} onChange={(e) => set({ access: e.target.value })} /></div>
            <div className="space-y-1 min-w-0"><Label htmlFor="exc-days" className="text-xs">Miettage</Label><Input id="exc-days" inputMode="numeric" value={s.days} onFocus={(e) => e.currentTarget.select()} onChange={(e) => set({ days: e.target.value })} /></div>
          </div>
          <label className="flex items-center justify-between gap-3 text-sm"><span>Expertenmodus</span><Switch checked={expert} onCheckedChange={setExpert} /></label>
          {expert && <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1 min-w-0"><Label htmlFor="exc-d" className="text-xs">Dichte (t/m³)</Label><Input id="exc-d" inputMode="decimal" placeholder={f(soil.density)} value={s.density} onChange={(e) => set({ density: e.target.value })} /></div>
            <div className="space-y-1 min-w-0"><Label htmlFor="exc-l" className="text-xs">Auflockerung (%)</Label><Input id="exc-l" inputMode="decimal" placeholder={String(soil.loosening)} value={s.loosening} onChange={(e) => set({ loosening: e.target.value })} /></div>
            <div className="space-y-1 min-w-0"><Label htmlFor="exc-f" className="text-xs">Füllgrad Mulde (%)</Label><Input id="exc-f" inputMode="decimal" value={s.fill} onChange={(e) => set({ fill: e.target.value })} /></div>
          </div>}
        </div>

        <div className="space-y-4 min-w-0">
          <div className="grid grid-cols-2 gap-2">
            {tile("Gewachsener Boden", `${f(r.bank)} m³`)}
            {tile("Aufgelockerter Boden", `${f(r.loose)} m³`, `bei ${f(loosening, 0)} % Auflockerung`)}
            {tile("Geschätztes Erdgewicht", `${f(r.tons)} t`, `bei ${f(density)} t/m³`)}
            {tile("Zusätzliches Volumen", `${f(r.extra)} m³`, "durch Auflockerung")}
          </div>
          {safety && <p className="flex gap-2 rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm"><AlertTriangle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            {maxDepth > TRENCH_SAFETY_DEPTH_M ? `Ab ${f(TRENCH_SAFETY_DEPTH_M, 2)} m Tiefe sind Böschung oder Verbau vorgeschrieben (DIN 4124). ` : ""}Bei Baugruben, Fundamenten und großen Mengen beraten wir dich gern persönlich – Leitungen vorher erkunden, Abstand zu Gebäuden beachten.</p>}

          {!locationId ? <p className="text-sm text-muted-foreground">Wähle einen Standort, um passende Maschinen zu sehen.</p> : bank > 0 && (<>
            {currentAssess && <p className={`rounded-lg border p-3 text-sm ${currentAssess.ok && !currentAssess.check ? "border-primary/40 bg-primary/5" : "border-accent/40 bg-accent/10"}`}>
              <strong>Dieser Bagger:</strong> {currentAssess.ok ? (currentAssess.check ? "Eignung bitte mit uns abstimmen – technische Daten fehlen." : "für deine Angaben geeignet.") : "für deine Angaben nicht geeignet."} {currentAssess.reasons.join(" · ")}</p>}
            <div>
              <h3 className="text-sm font-semibold text-headline mb-1">Passende Bagger in {locName}</h3>
              {pick.main ? <ul className="divide-y divide-border rounded-lg border border-border bg-background">
                {machineRow("Unsere Empfehlung", pick.main)}{machineRow("Kompakte Alternative", pick.compact)}{machineRow("Leistungsstarke Alternative", pick.strong)}
              </ul> : <p className="text-sm text-muted-foreground">Für deine Angaben können wir keinen Bagger sicher empfehlen. {pick.unchecked.length > 0 ? `Bitte prüfen lassen: ${pick.unchecked.map((a) => a.name).join(", ")}.` : ""} Ruf uns an – wir beraten dich persönlich.</p>}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-headline mb-1">Dumper für den Materialtransport</h3>
              <ul className="divide-y divide-border rounded-lg border border-border bg-background">
                {dumpers.map((d) => <li key={d.id} className="p-3 text-sm">
                  <Link to={`/mieten/${locationId}/erdbewegung/${d.id}`} className="font-semibold text-primary hover:underline">{d.name}</Link>
                  <p className="text-muted-foreground">{d.fits === false ? "zu breit für deine Zufahrt" : d.trips ? `ca. ${d.trips.trips} Fahrten (${f(d.trips.perTrip, 2)} m³ je Fahrt, begrenzt durch ${d.trips.limitedBy === "volume" ? `Mulde bei ${f(fill * 100, 0)} % Füllgrad` : "Nutzlast"})` : "Fahrtenzahl nicht berechenbar – Mulde oder Nutzlast nicht hinterlegt"}</p>
                </li>)}
              </ul>
            </div>
            {lines.length > 0 && <div><h3 className="text-sm font-semibold text-headline">Maschinenpaket anfragen</h3><CalculatorRecommendations lines={lines} locationId={locationId} days={days} /></div>}
          </>)}
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button type="button" variant="outline" size="sm" onClick={share}><Share2 className="h-4 w-4" /> {copied ? "Link kopiert" : "Link teilen"}</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" /> Drucken / PDF</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setS(INITIAL)}><RotateCcw className="h-4 w-4" /> Zurücksetzen</Button>
          </div>
          <p className="flex gap-2 text-xs text-muted-foreground"><Info className="h-4 w-4 shrink-0" />Alle Berechnungen und Maschinenempfehlungen dienen als unverbindliche Planungshilfe. Die tatsächliche Aushubmenge, das Erdgewicht und die benötigte Maschinenleistung hängen unter anderem von Bodenbeschaffenheit, Feuchtigkeit, Baustellenbedingungen und Bedienererfahrung ab. Bei komplexen Erdarbeiten beraten wir dich gerne persönlich.</p>
          {showToolsLink && <Link to="/tools/aushubrechner" className="text-sm text-primary hover:underline">Zum Aushubrechner mit Ratgeber</Link>}
        </div>
      </div>)}
    </section>
  );
}
export { ToolsLink };
