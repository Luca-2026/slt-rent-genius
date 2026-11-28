import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shovel, Plus, Trash2, Info, AlertTriangle, FileText, Share2, RotateCcw, ChevronDown, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CalculatorRecommendations, ToolsLink } from "./CalculatorRecommendations";
import { excavationLinePrice } from "@/lib/excavationPrice";
import { useExcavationModel, productPath, statusLabel, inquiryMessage, type Machine } from "./useExcavationModel";
import {
  SOILS, type SoilKey, type ShapeKind, TRENCH_SAFETY_DEPTH_M, type Assessment, type Fit, CRANE_NOTE, PROJECTS,
  INITIAL_STATE, type ExcState, sanitizeState, decodeShare, encodeShare, SHAPE_LIMITS, PARAM_LIMITS, inRange, MAX_SHAPES,
} from "@/lib/excavationCalculator";

const SHAPES: { kind: ShapeKind; label: string; fields: ["a" | "b" | "c", string][] }[] = [
  { kind: "rect", label: "Rechteck", fields: [["a", "Länge (m)"], ["b", "Breite (m)"], ["c", "Tiefe (cm)"]] },
  { kind: "area", label: "Fläche", fields: [["a", "Fläche (m²)"], ["c", "Tiefe (cm)"]] },
  { kind: "trench", label: "Graben", fields: [["a", "Länge (m)"], ["b", "Breite (cm)"], ["c", "Tiefe (cm)"]] },
  { kind: "circle", label: "Kreis", fields: [["a", "Durchmesser (m)"], ["c", "Tiefe (cm)"]] },
  { kind: "volume", label: "Bekanntes Volumen", fields: [["a", "Volumen (m³)"]] },
];
const KEY = "slt-excavation-calc";
const f = (v: number, d = 1) => v.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });

/** Geteilter Link hat Vorrang, wird danach in die Sitzung übernommen und aus der Adresse entfernt,
 *  damit ein Standortwechsel die zwischenzeitlich geänderten Werte nicht überschreibt. */
function loadState(): { s: ExcState; badLink: boolean } {
  try {
    const url = new URL(window.location.href);
    const p = url.searchParams.get("aushub");
    if (p != null) {
      const s = decodeShare(p);
      url.searchParams.delete("aushub");
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
      if (s) { sessionStorage.setItem(KEY, JSON.stringify(s)); return { s, badLink: false }; }
      return { s: INITIAL_STATE, badLink: true };
    }
    const raw = sessionStorage.getItem(KEY);
    const s = raw ? sanitizeState(JSON.parse(raw)) : null;
    if (s) return { s, badLink: false };
  } catch { /* gesperrter Speicher oder ungültige Daten */ }
  return { s: INITIAL_STATE, badLink: false };
}
export const reportUrl = (s: ExcState, locationId?: string) => `/tools/aushubrechner/bericht?${locationId ? `standort=${locationId}&` : ""}aushub=${encodeURIComponent(encodeShare(s))}`;
export const shareUrl = (s: ExcState, locationId?: string) => `https://www.slt-rental.de/tools/aushubrechner/?${locationId ? `standort=${locationId}&` : ""}aushub=${encodeURIComponent(encodeShare(s))}`;

function Thumb({ src, alt }: { src?: string; alt: string }) {
  return <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">{src && <img src={src} alt={alt} loading="lazy" className="h-full w-full object-contain" />}</div>;
}
const BADGE: Record<Fit, string> = { fit: "border-primary/40 bg-primary/10 text-primary", check: "border-accent/50 bg-accent/10 text-foreground", unfit: "border-destructive/40 bg-destructive/10 text-destructive" };
export const availability = (m?: Machine) => (m?.rentware ? "online buchbar" : m?.onRequest ? "auf Anfrage" : "im Mietkatalog");

export function excavationHeading(subcategory?: string) {
  if (!subcategory) return "Plane dein Erdbewegungsprojekt";
  if (/bagger/.test(subcategory)) return "Ist dieser Bagger für dein Projekt geeignet?";
  if (/dumper/.test(subcategory)) return "Wie viele Fahrten benötigst du für deinen Erdaushub?";
  if (/lader/.test(subcategory)) return "Berechne den Materialbedarf für dein Bauprojekt";
  return "Plane dein Erdbewegungsprojekt";
}

export function ExcavationCalculator({ locationId, currentProductId, heading = "Aushubrechner", collapsible = false, showToolsLink = true }: { locationId?: string; currentProductId?: string; heading?: string; collapsible?: boolean; showToolsLink?: boolean }) {
  const [{ s, badLink }, setAll] = useState(loadState);
  const [open, setOpen] = useState(!collapsible);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  useEffect(() => { try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch { /* */ } }, [s]);
  const set = (p: Partial<ExcState>) => setAll((o) => ({ s: { ...o.s, ...p }, badLink: o.badLink }));
  const m = useExcavationModel(s, locationId);
  const { c, r, pick, dumpers, lines, byId, locName, accessHint } = m;
  const soil = SOILS[s.soil];
  const current = currentProductId ? byId(currentProductId) : undefined;
  const currentAssess = current && /bagger/.test(current.sub) ? pick.all.find((a) => a.id === current.id) : undefined;
  const deep = c.depthM != null && c.depthM > TRENCH_SAFETY_DEPTH_M;
  const safety = deep || [3, 5].includes(s.project) || c.bank > 100;
  const shown = new Set([pick.main, pick.compact, pick.strong, pick.smallest].filter(Boolean).map((a) => a!.id));

  const share = async () => {
    const url = shareUrl(s, locationId);
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { window.prompt("Link kopieren", url); }
  };
  const ask = () => navigate("/kontakt", { state: { prefill: { location: locationId, subject: `Aushubprojekt: ${PROJECTS[s.project]}`, message: inquiryMessage(m, PROJECTS[s.project], soil.label, shareUrl(s, locationId)) } } });
  const setShape = (i: number, p: Partial<ExcState["shapes"][number]>) => set({ shapes: s.shapes.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  const bad = (v: string | undefined, lim: readonly [number, number]) => inRange(v, lim) === null;

  const tile = (label: string, value: string, note?: string) => (
    <div className="rounded-lg border border-border bg-background p-3 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-headline break-words">{value}</p>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
  );
  const row = (title: string, a?: Assessment, status: Fit | "orient" = a?.status ?? "check") => { if (!a) return null; const mm = byId(a.id); return (
    <li key={title + a.id} className="p-3 text-sm flex gap-3" data-testid={`exc-machine-${a.id}`}>
      <Thumb src={mm?.image} alt={a.name} />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
        <Link to={productPath(locationId!, a.id)} className="font-semibold text-primary hover:underline break-words">{a.name}</Link>
        <span className="ml-1 text-xs text-muted-foreground">({availability(mm)})</span>
        <p className="mt-1"><span className={`inline-block rounded border px-1.5 py-0.5 text-xs font-medium ${BADGE[status === "orient" ? a.status : status]}`}>{a.tooWide ? "Passt nicht durch Zufahrt" : statusLabel(a)}</span></p>
        {a.reasons.length > 0 && <p className="text-muted-foreground mt-1">{a.reasons.join(" · ")}</p>}
      </div>
    </li>); };

  return (
    <section className="bg-card rounded-xl border border-border p-4 sm:p-5" aria-labelledby="exc-calc">
      <h2 id="exc-calc" className="text-base sm:text-lg font-semibold text-headline mb-1 flex items-center gap-2"><Shovel className="h-5 w-5 text-primary flex-shrink-0" /> {heading}</h2>
      <p className="text-sm text-muted-foreground mb-3">Berechne deinen Erdaushub und finde passende Baumaschinen{locName ? ` an unserem Standort in ${locName}` : ""}.</p>
      {badLink && <p role="alert" className="mb-3 rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm">Der geteilte Link enthielt ungültige Daten. Wir haben mit den Standardwerten begonnen.</p>}
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
                {def.fields.map(([k, label]) => { const lim = SHAPE_LIMITS[sh.kind][k]!; const err = bad(sh.v[k], lim); return (
                  <div key={k} className="space-y-1 min-w-0">
                    <Label htmlFor={`exc-${i}-${k}`} className="text-xs">{label}</Label>
                    <Input id={`exc-${i}-${k}`} inputMode="decimal" maxLength={12} aria-invalid={err} className={err ? "border-destructive" : ""} value={sh.v[k] ?? ""} onFocus={(e) => e.currentTarget.select()} onChange={(e) => setShape(i, { v: { ...sh.v, [k]: e.target.value } })} />
                    {err && <p className="text-xs text-destructive">{f(lim[0], lim[0] < 1 ? 2 : 0)} bis {f(lim[1], 0)}</p>}
                  </div>); })}
              </div>
            </fieldset>); })}
          {s.shapes.length < MAX_SHAPES && <Button type="button" variant="outline" size="sm" onClick={() => set({ shapes: [...s.shapes, { kind: "rect", v: {} }] })}><Plus className="h-4 w-4" /> Teilfläche hinzufügen</Button>}
          <div className="space-y-1.5">
            <Label htmlFor="exc-soil">Bodenart</Label>
            <select id="exc-soil" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={s.soil} onChange={(e) => set({ soil: e.target.value as SoilKey })}>
              {(Object.keys(SOILS) as SoilKey[]).map((k) => <option key={k} value={k}>{SOILS[k].label}</option>)}
            </select>
            <p className="text-xs text-muted-foreground">Geschätzter Planungswert: {f(soil.density)} t/m³, {soil.loosening} % Auflockerung</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1 min-w-0"><Label htmlFor="exc-access" className="text-xs">Schmalste Zufahrt (cm, optional)</Label><Input id="exc-access" inputMode="decimal" maxLength={12} aria-invalid={bad(s.access, PARAM_LIMITS.access)} className={bad(s.access, PARAM_LIMITS.access) ? "border-destructive" : ""} value={s.access} onFocus={(e) => e.currentTarget.select()} onChange={(e) => set({ access: e.target.value })} />{accessHint && <p className="text-xs text-muted-foreground" data-testid="access-hint">{accessHint}</p>}</div>
            <div className="space-y-1 min-w-0"><Label htmlFor="exc-days" className="text-xs">Miettage</Label><Input id="exc-days" inputMode="numeric" maxLength={12} aria-invalid={bad(s.days, PARAM_LIMITS.days)} className={bad(s.days, PARAM_LIMITS.days) ? "border-destructive" : ""} value={s.days} onFocus={(e) => e.currentTarget.select()} onChange={(e) => set({ days: e.target.value })} /></div>
          </div>
          <label className="flex items-center justify-between gap-3 text-sm"><span>Expertenmodus</span><Switch aria-label="Expertenmodus" checked={s.expert} onCheckedChange={(v) => set({ expert: v })} /></label>
          {s.expert && <div className="grid grid-cols-3 gap-2">
            {([["exc-d", "Dichte (t/m³)", "density", f(soil.density)], ["exc-l", "Auflockerung (%)", "loosening", String(soil.loosening)], ["exc-f", "Füllgrad Mulde (%)", "fill", "85"]] as const).map(([id, label, key, ph]) => { const err = bad(s[key], PARAM_LIMITS[key]); return (
              <div key={id} className="space-y-1 min-w-0"><Label htmlFor={id} className="text-xs">{label}</Label><Input id={id} inputMode="decimal" maxLength={12} placeholder={ph} aria-invalid={err} className={err ? "border-destructive" : ""} value={s[key]} onChange={(e) => set({ [key]: e.target.value })} /></div>); })}
          </div>}
        </div>

        <div className="space-y-4 min-w-0">
          {c.invalid.length > 0 && <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">Bitte prüfe: {c.invalid.join(", ")}. Ungültige Werte fließen nicht in die Berechnung ein.</p>}
          <div className="grid grid-cols-2 gap-2">
            {tile("Gewachsener Boden", `${f(r.bank)} m³`)}
            {tile("Aufgelockerter Boden", `${f(r.loose)} m³`, `bei ${f(c.loosening, 0)} % Auflockerung`)}
            {tile("Geschätztes Erdgewicht", `${f(r.tons)} t`, `bei ${f(c.density)} t/m³`)}
            {tile("Zusätzliches Volumen", `${f(r.extra)} m³`, "durch Auflockerung")}
          </div>
          {safety && <p className="flex gap-2 rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm"><AlertTriangle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            <span>{deep ? `Ab ${f(TRENCH_SAFETY_DEPTH_M, 2)} m Tiefe sind nach DIN 4124 grundsätzlich Böschung oder Verbau nötig – bei nicht standfestem Boden, Wasser oder Lasten am Rand auch schon früher. ` : ""}Leitungen vorher erkunden und Abstand zu Gebäuden beachten. Bei Baugruben, Fundamenten und großen Mengen beraten wir dich gern persönlich.</span></p>}

          {!locationId ? <p className="text-sm text-muted-foreground">Wähle einen Standort, um passende Maschinen zu sehen.</p> : c.bank > 0 && (<>
            {currentAssess && <p className={`rounded-lg border p-3 text-sm ${BADGE[currentAssess.status]}`}>
              <strong>Dieser Bagger:</strong> {currentAssess.tooWide ? "passt nicht durch deine Zufahrt." : currentAssess.status === "fit" ? "nach vorliegenden Daten passend." : currentAssess.status === "check" ? "Eignung bitte mit uns abstimmen." : "nach vorliegenden Daten ungeeignet."} {currentAssess.reasons.join(" · ")}</p>}
            <div>
              <h3 className="text-sm font-semibold text-headline mb-1">Bagger in {locName}</h3>
              {(pick.main || pick.smallest) && <ul className="divide-y divide-border rounded-lg border border-border bg-background">
                {row("Empfehlung – nach vorliegenden Daten passend", pick.main)}{row("Kompaktere Alternative – passend", pick.compact)}{row("Stärkere Alternative – passend", pick.strong)}
                {row("Kleinster Bagger – zur Orientierung, Eignung nicht bestätigt", pick.smallest, "orient")}
              </ul>}
              {pick.hints.map((h) => <p key={h} className="mt-2 flex gap-2 rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm"><Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />{h}</p>)}
              {pick.review.filter((a) => !shown.has(a.id)).length > 0 && <><h4 className="mt-3 text-sm font-semibold">Alternative – Eignung prüfen lassen</h4>
                <ul className="divide-y divide-border rounded-lg border border-border bg-background">{pick.review.filter((a) => !shown.has(a.id)).map((a) => row("Alternative – Eignung prüfen lassen", a))}</ul></>}
              {pick.unfit.filter((a) => !shown.has(a.id)).length > 0 && <><h4 className="mt-3 text-sm font-semibold">Nach Daten ungeeignet</h4>
                <ul className="divide-y divide-border rounded-lg border border-border bg-background">{pick.unfit.filter((a) => !shown.has(a.id)).map((a) => row(a.tooWide ? "Passt nicht durch Zufahrt" : "Ungeeignet", a))}</ul></>}
              {pick.crane && <p className="mt-2 text-xs text-muted-foreground">{CRANE_NOTE}</p>}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-headline mb-1">Dumper für den Materialtransport</h3>
              <ul className="divide-y divide-border rounded-lg border border-border bg-background">
                {dumpers.map((d) => <li key={d.id} className="p-3 text-sm flex gap-3" data-testid={`exc-machine-${d.id}`}><Thumb src={d.image} alt={d.name} /><div className="min-w-0">
                  <Link to={productPath(locationId, d.id)} className="font-semibold text-primary hover:underline break-words">{d.name}</Link>
                  <span className="ml-1 text-xs text-muted-foreground">({availability(d)})</span>
                  <p className="mt-1"><span className={`inline-block rounded border px-1.5 py-0.5 text-xs font-medium ${BADGE[d.a.status]}`}>{statusLabel(d.a)}</span></p>
                  <p className="text-muted-foreground mt-1">{d.a.reason}</p>
                </div></li>)}
              </ul>
            </div>
            {lines.length > 0 && <div><h3 className="text-sm font-semibold text-headline">Passende Geräte anfragen</h3>
              <p className="text-xs text-muted-foreground">Nur nach vorliegenden Daten passende Geräte. Mietzeitraum wählst du im Warenkorb; Verfügbarkeit bestätigen wir nach Prüfung. Preise sind Richtwerte nach Staffel ohne Lieferung, Versicherung und Kaution.</p>
              <CalculatorRecommendations lines={lines} locationId={locationId} days={c.days} priceOf={excavationLinePrice} /></div>}
            <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 space-y-2">
              <p className="text-sm font-semibold text-headline">{lines.length ? "Unsicher? Projekt mit SLT abstimmen" : "Passende Maschine anfragen"}</p>
              <p className="text-xs text-muted-foreground">Wir übernehmen deine Projektdaten ins Kontaktformular. Gesendet wird erst, wenn du es abschickst.</p>
              <Button type="button" className="w-full h-auto min-h-10 whitespace-normal" variant={lines.length ? "outline" : "default"} onClick={ask}><MessageSquare className="h-4 w-4" /> {lines.length ? "Projekt mit SLT abstimmen" : "Passende Maschine anfragen"}</Button>
            </div>
          </>)}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={share}><Share2 className="h-4 w-4" /> {copied ? "Link kopiert" : "Link teilen"}</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => window.open(reportUrl(s, locationId), "_blank", "noopener")}><FileText className="h-4 w-4" /> Projektbericht als PDF</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setAll({ s: INITIAL_STATE, badLink: false })}><RotateCcw className="h-4 w-4" /> Zurücksetzen</Button>
          </div>
          <p className="flex gap-2 text-xs text-muted-foreground"><Info className="h-4 w-4 shrink-0" />Alle Berechnungen und Maschinenempfehlungen sind unverbindliche Schätzungen. Dichte und Auflockerung sind allgemeine Planungswerte; Aushubmenge, Erdgewicht und Maschinenleistung hängen unter anderem von Bodenbeschaffenheit, Feuchtigkeit, Baustelle und Bedienererfahrung ab. Fehlen technische Daten eines Geräts, kennzeichnen wir es als „Eignung prüfen lassen“.</p>
          {showToolsLink && <Link to="/tools/aushubrechner" className="text-sm text-primary hover:underline">Zum Aushubrechner mit Ratgeber</Link>}
        </div>
      </div>)}
    </section>
  );
}
export { ToolsLink };
