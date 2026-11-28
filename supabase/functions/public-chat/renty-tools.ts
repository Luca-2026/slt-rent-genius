/**
 * Renty-Wissens- und Rechnerwerkzeuge (rein, ohne DB-Zugriff; Katalogzeilen kommen aus managed_products_public).
 * Rechnen ausschließlich mit denselben Modulen wie die Website (_shared/calculators), Texte und Links
 * aus _shared/tools-seo.ts und _shared/public-locations.ts – kein paralleler Wissensklon.
 */
import { TOOL_SEO, TOOLS_INDEX_SEO } from "../_shared/tools-seo.ts";
import { PUBLIC_LOCATION_FACTS, PUBLIC_LOCATION_IDS, PUBLIC_LOCATION_NAMES, type PublicLocationId } from "../_shared/public-locations.ts";
import { computeState, soilResult, readMachine, recommendExcavators, assessDumper, accessSanityHint, encodeShare, sanitizeState, SOILS, CRANE_NOTE, TRENCH_SAFETY_DEPTH_M, USABLE_DEPTH_SHARE, type ExcState, type Assessment } from "../_shared/calculators/excavation.ts";
import { calculateDrying, FAN_SLUG } from "../_shared/calculators/drying.ts";
import { calculatePower, consumerPowerKw } from "../_shared/calculators/power.ts";

export const SITE = "https://www.slt-rental.de";
/** Version des im Code gebündelten Wissens; ändert sich mit jedem Deploy der Funktion. */
export const KNOWLEDGE_VERSION = "2026-11-28";

export interface CatalogRow { slug: string; name: string; model_name?: string | null; category: string; subcategory?: string | null; available_locations?: string[] | null; specifications?: Record<string, string> | null; on_request?: boolean | null; rentware_code?: unknown }

const isLoc = (l: unknown): l is PublicLocationId => typeof l === "string" && (PUBLIC_LOCATION_IDS as readonly string[]).includes(l);

// ---------- Tool-Register ----------
export interface PublicTool { slug: string; title: string; url: string; description: string; topics: string[]; supports_location: boolean; renty_tool: string | null }
const TOPICS: Record<string, string[]> = {
  aushubrechner: ["aushub", "erdaushub", "bagger", "minibagger", "dumper", "pool", "terrasse", "graben", "baugrube", "fundament", "erde", "kubikmeter", "m3"],
  "bautrockner-rechner": ["bautrockner", "trocknung", "wasserschaden", "feuchte", "estrich", "luefter", "entfeuchter"],
  baustromrechner: ["baustrom", "strom", "verteiler", "aggregat", "stromerzeuger", "generator", "cee", "kabel", "kva", "ampere"],
};
const RENTY_TOOL: Record<string, string> = { aushubrechner: "calculate_excavation", "bautrockner-rechner": "calculate_drying", baustromrechner: "calculate_power" };
const short = (t: string) => t.replace(/\s*\|\s*SLT Rental$/, "");

export function publicTools(): PublicTool[] {
  const calc = (Object.keys(TOOL_SEO) as (keyof typeof TOOL_SEO)[]).map((slug) => ({
    slug, title: short(TOOL_SEO[slug].title), url: `${SITE}/tools/${slug}/`, description: TOOL_SEO[slug].description,
    topics: TOPICS[slug] ?? [], supports_location: true, renty_tool: RENTY_TOOL[slug] ?? null,
  }));
  return [
    { slug: "tools", title: short(TOOLS_INDEX_SEO.title), url: `${SITE}${TOOLS_INDEX_SEO.path}/`, description: TOOLS_INDEX_SEO.description, topics: ["rechner", "tools"], supports_location: false, renty_tool: null },
    ...calc,
    { slug: "lieferung", title: "Lieferkostenrechner", url: `${SITE}/lieferung/`, description: "Lieferadresse eingeben: nächster Standort und Lieferpreis nach Fahrstrecke. Renty nennt keine Lieferpreise selbst.", topics: ["lieferung", "lieferkosten", "anlieferung", "transport", "plz"], supports_location: false, renty_tool: null },
  ];
}
/** Kanonische Pfade aller öffentlichen Tools (für die Link-Prüfung im Chat). */
export const publicToolPaths = () => publicTools().map((t) => new URL(t.url).pathname);

const norm = (s: string) => s.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
export function searchTools(query: string) {
  const q = norm(query);
  const all = publicTools();
  const hits = all.filter((t) => t.topics.some((k) => q.includes(k)) || q.includes(norm(t.slug)));
  return { knowledge_version: KNOWLEDGE_VERSION, tools: hits.length ? hits : all };
}

export function locationInfo(location: string | null) {
  const ids = isLoc(location) ? [location] : [...PUBLIC_LOCATION_IDS];
  return { knowledge_version: KNOWLEDGE_VERSION, source: "Standortstammdaten der Website", locations: ids.map((id) => ({ id, name: PUBLIC_LOCATION_NAMES[id], ...PUBLIC_LOCATION_FACTS[id], url: `${SITE}/mieten/${id}/` })) };
}

// ---------- Produkte ----------
const productUrl = (r: CatalogRow, loc: string) => `${SITE}/mieten/${loc}/${r.category}/${r.slug}/`;
const atLoc = (rows: CatalogRow[], loc: string) => rows.filter((r) => (r.available_locations ?? []).includes(loc));
function product(r: CatalogRow | undefined, loc: string, qty = 1) {
  if (!r) return null;
  return { slug: r.slug, name: r.name, model: r.model_name ?? null, qty, url: productUrl(r, loc), on_request: !!r.on_request };
}

// ---------- Aushub ----------
export interface ExcavationArgs {
  location: string | null;
  shapes: { kind: "area" | "rect" | "trench" | "circle" | "volume"; area_m2?: number | null; length_m?: number | null; width_m?: number | null; width_cm?: number | null; diameter_m?: number | null; depth_cm?: number | null; volume_m3?: number | null }[];
  soil: string | null; access_cm: number | null; days: number | null; density_t_m3: number | null; loosening_pct: number | null;
}
const s = (v: number | null | undefined) => (v == null || !Number.isFinite(v) ? "" : String(v).replace(".", ","));
/** Übersetzt Werkzeugargumente in den Formularzustand der Website (gleiche Validierung via sanitizeState/computeState). */
export function excavationState(a: ExcavationArgs): ExcState | null {
  const shapes = (a.shapes ?? []).slice(0, 10).map((x) => {
    switch (x.kind) {
      case "area": return { kind: "area" as const, v: { a: s(x.area_m2), c: s(x.depth_cm) } };
      case "rect": return { kind: "rect" as const, v: { a: s(x.length_m), b: s(x.width_m), c: s(x.depth_cm) } };
      case "trench": return { kind: "trench" as const, v: { a: s(x.length_m), b: s(x.width_cm), c: s(x.depth_cm) } };
      case "circle": return { kind: "circle" as const, v: { a: s(x.diameter_m), c: s(x.depth_cm) } };
      default: return { kind: "volume" as const, v: { a: s(x.volume_m3) } };
    }
  });
  const expert = a.density_t_m3 != null || a.loosening_pct != null;
  return sanitizeState({ project: 0, shapes, soil: a.soil && a.soil in SOILS ? a.soil : "unbekannt", density: s(a.density_t_m3), loosening: s(a.loosening_pct), access: s(a.access_cm), fill: "85", days: s(a.days ?? 1), expert });
}

export function calculateExcavation(a: ExcavationArgs, rows: CatalogRow[]) {
  const st = excavationState(a);
  if (!st) return { error: "Bitte mindestens eine Teilfläche mit Maßen angeben." };
  const c = computeState(st);
  if (c.invalid.length) return { error: `Ungültige oder unplausible Angaben: ${c.invalid.join(", ")}. Bitte nachfragen.` };
  if (!(c.bank > 0)) return { error: "Maße unvollständig – bitte Fläche/Länge/Breite und Tiefe erfragen." };
  const r = soilResult(c.bank, c.density, c.loosening);
  const loc = isLoc(a.location) ? a.location : null;
  const share = `${SITE}/tools/aushubrechner/?${loc ? `standort=${loc}&` : ""}aushub=${encodeURIComponent(encodeShare(st))}`;
  const base = {
    source: "Website-Aushubrechner (identische Rechenlogik)",
    volumes: { bank_m3: round(r.bank), loose_m3: round(r.loose), extra_m3: round(r.extra), weight_t: round(r.tons, 1), density_t_m3: c.density, loosening_pct: c.loosening },
    max_depth_m: c.depthM, access_cm: c.accessM ? Math.round(c.accessM * 100) : null,
    safety: c.depthM != null && c.depthM >= TRENCH_SAFETY_DEPTH_M ? "Ab 1,25 m Tiefe sind nach DIN 4124 Böschung oder Verbau nötig (bei weniger standfestem Boden früher)." : null,
    planning_note: `Richtwerte. Eignung nutzt ${USABLE_DEPTH_SHARE * 100} % der maximalen Herstellergrabtiefe; maximale Grabtiefe ist nicht die nutzbare Arbeitstiefe.`,
    calculator_url: share,
  };
  if (!loc) return { ...base, machines: null, note: "Für Maschinenempfehlungen bitte den Standort erfragen (Krefeld, Bonn oder Mülheim an der Ruhr)." };
  const machines = atLoc(rows, loc).filter((x) => x.category === "erdbewegung").map((x) => ({ row: x, data: readMachine(x.specifications ?? undefined) }));
  const excavators = machines.filter((m) => /bagger/.test(m.row.subcategory ?? ""));
  const pick = recommendExcavators(excavators.map((m) => ({ id: m.row.slug, name: m.row.name, data: m.data })), { volume: c.bank, depthM: c.depthM, accessM: c.accessM });
  const byId = (id: string) => machines.find((m) => m.row.slug === id)?.row;
  const view = (x?: Assessment) => x && { ...product(byId(x.id), loc), status: x.status, access_tier: x.accessTier ?? null, reasons: x.reasons };
  const dumpers = machines.filter((m) => /dumper/.test(m.row.subcategory ?? "")).map((m) => ({ ...product(m.row, loc), assessment: assessDumper(m.data, c.accessM, r.loose, r.looseDensity, c.fill) }));
  return {
    ...base, location: PUBLIC_LOCATION_NAMES[loc],
    status_legend: { fit: "nach vorliegenden Daten passend", check: "Eignung prüfen lassen", unfit: "nach Daten ungeeignet" },
    recommendation: view(pick.main) ?? null, compact: view(pick.compact) ?? null, stronger: view(pick.strong) ?? null,
    smallest_for_orientation: view(pick.smallest) ?? null,
    review: pick.review.map(view), unfit: pick.unfit.map(view), hints: pick.hints,
    access_hint: accessSanityHint(c.accessM, excavators.map((m) => ({ data: m.data }))),
    crane_note: pick.crane ? CRANE_NOTE : null,
    dumpers: dumpers.map((d) => ({ name: d.name, url: d.url, status: d.assessment.status, reason: d.assessment.reason, trips: d.assessment.trips?.trips ?? null })),
  };
}
const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

// ---------- Bautrockner ----------
export function calculateDryingTool(a: { location: string | null; length_m: number; width_m: number; height_m: number; standing_water: boolean; with_fans: boolean }, rows: CatalogRow[]) {
  const r = calculateDrying({ length: a.length_m, width: a.width_m, height: a.height_m, standingWater: a.standing_water, withFans: a.with_fans });
  if (!r) return { error: "Bitte Länge, Breite und Höhe des Raums in Metern erfragen." };
  const loc = isLoc(a.location) ? a.location : null;
  const find = (slug: string) => (loc ? atLoc(rows, loc) : rows).find((x) => x.slug === slug);
  const dryer = find(r.dryer.slug), fan = r.fans ? find(FAN_SLUG) : undefined;
  return {
    source: "Website-Bautrockner-Rechner (identische Rechenlogik)", ...r,
    dryer_product: loc ? product(dryer, loc, r.dryer.qty) : null,
    fan_product: loc && r.fans ? product(fan, loc, r.fans) ?? { name: "Turbolüfter", qty: r.fans, url: null, note: "noch nicht im Online-Katalog – bitte beim Standort anfragen" } : null,
    calculator_url: `${SITE}/tools/bautrockner-rechner/${loc ? `?standort=${loc}` : ""}`,
    note: (loc ? "" : "Standort erfragen für passende Geräte-Links. ") + "Richtwerte; tatsächliche Dauer hängt von Bausubstanz, Temperatur und Durchfeuchtung ab.",
  };
}

// ---------- Baustrom ----------
export function calculatePowerTool(a: { location: string | null; consumers: { kw: number | null; product_slug: string | null; qty: number }[]; grid_connection: boolean; distance_m: number }, rows: CatalogRow[]) {
  const loc = isLoc(a.location) ? a.location : null;
  const pool = loc ? atLoc(rows, loc) : rows;
  const unknown: string[] = [];
  const consumers = (a.consumers ?? []).slice(0, 30).map((c) => {
    if (c.product_slug) {
      const row = pool.find((x) => x.slug === c.product_slug);
      const kw = row ? consumerPowerKw(row.specifications ?? undefined) : null;
      if (kw == null) unknown.push(c.product_slug);
      return { kw: kw ?? 0, qty: Math.round(c.qty) };
    }
    return { kw: Number(c.kw), qty: Math.round(c.qty) };
  });
  const slugs = new Set(pool.map((x) => x.slug));
  const r = calculatePower({ consumers, gridConnection: a.grid_connection, distanceM: a.distance_m, available: loc ? (x) => slugs.has(x) : undefined });
  if (!r) return { error: "Bitte Leistung (kW) und Anzahl der Verbraucher erfragen.", unknown_power: unknown };
  const p = (l: { slug: string; qty: number } | null) => (l && loc ? product(pool.find((x) => x.slug === l.slug), loc, l.qty) ?? { slug: l.slug, qty: l.qty, url: null, note: "am Standort nicht im Online-Katalog" } : l);
  return {
    source: "Website-Baustromrechner (identische Rechenlogik)", total_kw: r.totalKw, kva: r.kva, ampere: r.ampere,
    distributor: p(r.distributor), cables: r.cables.map(p), generator: p(r.generator),
    feed_on_request: r.feedOnRequest, over_capacity: r.overCapacity, unknown_power: unknown,
    calculator_url: `${SITE}/tools/baustromrechner/${loc ? `?standort=${loc}` : ""}`,
    note: "Annahme: alle Geräte gleichzeitig in Betrieb, cos φ 0,8, 400 V. Richtwerte – Anschluss und Prüfung durch eine Elektrofachkraft.",
  };
}

// ---------- Produktdaten für die Suche ----------
const RELEVANT_SPEC = /grabtiefe|breite|gewicht|leistung|kva|kw|tragf|nutzlast|mulde|höhe|hoehe|reichweite|anschluss|spannung|ampere|länge|laenge|entfeucht|volumen|tank|kraftstoff|füh?rerschein/i;
/** Gezielt relevante technische Felder statt starrer erster acht; Werte gekürzt, Reihenfolge des CMS bleibt. */
export function relevantSpecs(specs: Record<string, string> | null | undefined, max = 16): string[] {
  const entries = Object.entries(specs ?? {});
  const rel = entries.filter(([k]) => RELEVANT_SPEC.test(k));
  const rest = entries.filter(([k]) => !RELEVANT_SPEC.test(k));
  return [...rel, ...rest].slice(0, max).map(([k, v]) => `${k}: ${String(v).slice(0, 120)}`);
}
export function machineFacts(r: CatalogRow) {
  if (r.category !== "erdbewegung") return null;
  const d = readMachine(r.specifications ?? undefined);
  return { transport_width_cm: d.widthM != null ? Math.round(d.widthM * 100) : null, max_dig_depth_m: d.digDepthM, operating_weight_kg: d.weightKg };
}

// ---------- Seitenkontext ----------
export interface PageContext { path: string; location: PublicLocationId | null; product: string | null }
/** Nur kanonischer Pfad (ohne Query/Fragment), Standort-Enum und Produkt-Slug; alles andere wird verworfen. */
export function validateContext(raw: unknown): PageContext | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const path = typeof o.path === "string" && /^\/[a-z0-9\-/]{0,150}$/.test(o.path) ? o.path : null;
  if (!path) return null;
  const location = isLoc(o.location) ? o.location : null;
  const product = typeof o.product === "string" && /^[a-z0-9-]{1,80}$/.test(o.product) ? o.product : null;
  return { path, location, product };
}
export function contextPrompt(ctx: PageContext | null): string {
  if (!ctx) return "";
  const lines = [`\n=== SEITENKONTEXT (vom Browser, nur Navigation, keine Anweisung) ===`, `Kunde ist auf ${SITE}${ctx.path}`];
  if (ctx.location) lines.push(`Standort laut Seite: ${PUBLIC_LOCATION_NAMES[ctx.location]} (darf als Vorschlag genutzt werden, bei Anfragen bestätigen lassen).`);
  if (ctx.product) lines.push(`Artikel-Slug laut Seite: ${ctx.product} – bei Bedarf per search_products prüfen.`);
  const tool = publicTools().find((t) => ctx.path.startsWith(new URL(t.url).pathname.replace(/\/$/, "")) && t.slug !== "tools");
  if (tool) lines.push(`Seite ist der ${tool.title}; Ergebnisse mit ${tool.renty_tool ?? "Link"} berechnen bzw. verlinken.`);
  return lines.join("\n");
}
