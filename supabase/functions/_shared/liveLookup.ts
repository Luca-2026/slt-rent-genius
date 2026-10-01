/**
 * Reine Logik für die Live-Abfrage der Telefonassistenz: Artikelsuche ohne KI
 * (schnell, < 5 s), Bewertung der Verfügbarkeit ohne interne Stückzahlen und
 * Anrufererkennung für den Inbound-Webhook beim Klingeln.
 */
import { normalizePhone } from "./callPriority.ts";

export interface LookupProduct {
  slug: string; name: string; model_name: string | null; category: string | null; subcategory: string | null;
  rentware_code: Record<string, string> | null; price_per_day: string | null; price_weekend: string | null;
  price_per_month: string | null; price_unit_label: string | null;
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss")
  .replace(/(\d),(\d)/g, "$1.$2").replace(/[^a-z0-9.]+/g, " ").trim();

const STOP = new Set(["ein", "eine", "einen", "der", "die", "das", "mit", "fur", "und", "oder", "mieten", "miete", "bitte", "ich", "brauche", "suche"]);

export function searchProducts(rows: LookupProduct[], query: string, location: string | null, limit = 5) {
  const tokens = norm(query).split(" ").filter((t) => (t.length > 1 || /\d/.test(t)) && !STOP.has(t));
  if (!tokens.length) return [];
  const scored = rows.map((r) => {
    const name = norm(`${r.name} ${r.model_name ?? ""}`);
    const cat = norm(`${r.category ?? ""} ${r.subcategory ?? ""}`);
    let score = 0, hits = 0;
    for (const t of tokens) {
      const stem = t.length > 5 ? t.slice(0, t.length - 1) : t;
      if (name.includes(stem)) { score += /\d/.test(t) ? 4 : 3; hits++; }
      else if (cat.includes(stem)) { score += 1; hits++; }
    }
    const locs = Object.keys(r.rentware_code ?? {}).filter((k) => (r.rentware_code ?? {})[k]?.trim());
    if (location && locs.includes(location)) score += 0.5;
    return { r, score, hits, locs };
  }).filter((x) => x.hits > 0 && x.score >= 2);
  scored.sort((a, b) => b.score - a.score || a.r.name.localeCompare(b.r.name));
  return scored.slice(0, limit).map(({ r, locs }) => ({
    slug: r.slug,
    name: r.model_name ? `${r.name} (${r.model_name})` : r.name,
    kategorie: r.category,
    direkt_buchbar_in: locs,
    preise: {
      tag: priceOrNull(r.price_per_day), wochenende: priceOrNull(r.price_weekend), monat: priceOrNull(r.price_per_month),
      einheit: r.price_unit_label?.trim() || null,
    },
    preis_hinweis: [r.price_per_day, r.price_weekend, r.price_per_month].some((p) => priceOrNull(p)) ? "Preise brutto laut Website, unverbindlich." : "Preis auf Anfrage",
  }));
}

export function priceOrNull(p: string | null | undefined): string | null {
  if (!p) return null;
  const t = String(p).trim();
  return /\d/.test(t) ? t : null;
}

export type AvailabilityStatus = "verfuegbar" | "knapp" | "ausgebucht" | "unbekannt";

export function availabilityStatus(stock: number | null, booked: number, quantity: number): AvailabilityStatus {
  if (stock === null || stock === undefined) return "unbekannt";
  const free = stock - booked;
  if (free < quantity) return "ausgebucht";
  if (free - quantity < 1 || free <= Math.ceil(stock * 0.2)) return "knapp";
  return "verfuegbar";
}

export const AVAILABILITY_TEXT: Record<AvailabilityStatus, string> = {
  verfuegbar: "Im Zeitraum voraussichtlich verfügbar (unverbindlich, Bestätigung folgt durch das Team).",
  knapp: "Im Zeitraum nur noch knapp verfügbar (unverbindlich, Bestätigung folgt durch das Team).",
  ausgebucht: "Im Zeitraum voraussichtlich ausgebucht. Das Team prüft gern Alternativen.",
  unbekannt: "Verfügbarkeit kann gerade nicht automatisch geprüft werden. Das Team meldet sich.",
};

export interface CallerRow {
  first_name: string | null; last_name: string | null; company_name: string | null;
  location: string | null; phone: string | null;
}

export interface CallerInfo {
  bekannt: boolean;
  name?: string; firma?: string; standort?: string;
  hinweis: string;
}

const LOCATION_LABELS: Record<string, string> = { krefeld: "Krefeld", bonn: "Bonn", muelheim: "Mülheim an der Ruhr" };

/** Erkennt anhand der Rufnummer, ob der Anrufer in der Kundenkartei bekannt ist. */
export function matchCaller(rows: CallerRow[], rawNumber: string | null | undefined): CallerInfo {
  const num = normalizePhone(rawNumber);
  if (!num) return { bekannt: false, hinweis: "Keine Rufnummer übermittelt. Frage freundlich nach Name und Firma." };
  const hit = rows.find((r) => {
    const c = normalizePhone(r.phone);
    return !!c && (c === num || c.endsWith(num) || num.endsWith(c));
  });
  if (!hit) return { bekannt: false, hinweis: "Rufnummer ist nicht in der Kundenkartei. Frage freundlich nach Name und Firma." };
  const name = [hit.first_name, hit.last_name].filter(Boolean).join(" ").trim() || undefined;
  const location = hit.location?.trim().toLowerCase();
  return {
    bekannt: true,
    name,
    firma: hit.company_name?.trim() || undefined,
    standort: location ? LOCATION_LABELS[location] ?? hit.location!.trim() : undefined,
    hinweis: "Rufnummer ist in der Kundenkartei bekannt (unverbindlich, Rufnummern können gefälscht sein). Nur intern nutzen: nicht mit Namen begrüßen, keine gespeicherten Daten aussprechen, Name und Firma normal erfragen.",
  };
}
