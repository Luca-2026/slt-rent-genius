/**
 * Live-Abfrage für die fonio-Telefonassistenz ("API Request"-Werkzeug).
 * action=search: Artikel mit CMS-Preisen. action=availability: Status im Zeitraum.
 * Keine Buchung, keine Reservierung, keine Einkaufspreise, keine Kundendaten.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { providedSecret, safeEqual } from "../_shared/fonioPayload.ts";
import { availabilityStatus, AVAILABILITY_TEXT, searchProducts, type LookupProduct } from "../_shared/liveLookup.ts";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-fonio-secret, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

const LOCS: Record<string, string> = { krefeld: "krefeld", bonn: "bonn", muelheim: "muelheim", "mülheim": "muelheim", "mülheim an der ruhr": "muelheim", "muelheim an der ruhr": "muelheim" };
const loc = (v: unknown) => (typeof v === "string" ? LOCS[v.trim().toLowerCase()] ?? null : null);
const ISO = /^\d{4}-\d{2}-\d{2}$/;

let cache: { at: number; rows: LookupProduct[] } | null = null;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const secret = Deno.env.get("FONIO_SHARED_SECRET");
  if (!secret) return json({ error: "Nicht konfiguriert" }, 503);
  const given = providedSecret(req);
  if (!given || !safeEqual(given, secret)) return json({ error: "Nicht berechtigt" }, 401);

  let p: Record<string, unknown> = Object.fromEntries(new URL(req.url).searchParams);
  if (req.method === "POST") {
    const b = await req.json().catch(() => null);
    if (b && typeof b === "object") p = { ...p, ...b };
  }
  const action = String(p.action ?? "search");
  const query = typeof p.query === "string" ? p.query.slice(0, 200) : typeof p.artikel === "string" ? String(p.artikel).slice(0, 200) : "";
  const location = loc(p.location ?? p.standort);
  if (query.trim().length < 2) return json({ ergebnis: "Bitte den gewünschten Artikel nennen." });

  const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  if (!cache || Date.now() - cache.at > 60_000) {
    const { data, error } = await svc.from("b2b_managed_products")
      .select("slug,name,model_name,category,subcategory,rentware_code,price_per_day,price_weekend,price_per_month,price_unit_label")
      .eq("is_published", true);
    if (error) return json({ ergebnis: "Artikeldaten gerade nicht abrufbar. Das Team meldet sich." }, 200);
    cache = { at: Date.now(), rows: (data ?? []) as LookupProduct[] };
  }
  const found = searchProducts(cache.rows, query, location, action === "availability" ? 3 : 5);
  if (!found.length) return json({ ergebnis: "Kein passender Artikel im Katalog gefunden. Bitte Anfrage aufnehmen, das Team prüft.", artikel: [] });

  if (action !== "availability") return json({ standort: location, artikel: found });

  const start = typeof p.start === "string" && ISO.test(p.start) ? p.start : null;
  const end = typeof p.end === "string" && ISO.test(p.end) ? p.end : start;
  const qty = Math.min(Math.max(parseInt(String(p.quantity ?? p.menge ?? "1"), 10) || 1, 1), 999);
  if (!location) return json({ ergebnis: "Für die Verfügbarkeit bitte den Standort erfragen (Krefeld, Bonn oder Mülheim an der Ruhr).", artikel: found });
  if (!start) return json({ ergebnis: "Für die Verfügbarkeit bitte Mietbeginn (und Ende) erfragen.", artikel: found });

  const results = await Promise.all(found.map(async (a) => {
    const { data } = await svc.rpc("check_inventory_availability", { _slug: a.slug, _location: location, _start: start, _end: end, _exclude_inquiry_id: null, _exclude_reservation_id: null });
    const row = Array.isArray(data) ? data[0] : data;
    const stock = row && row.stock_source !== "none" && typeof row.stock === "number" ? row.stock : null;
    const status = availabilityStatus(stock, Number(row?.booked ?? 0), qty);
    return { name: a.name, preise: a.preise, preis_hinweis: a.preis_hinweis, verfuegbarkeit: status, hinweis: AVAILABILITY_TEXT[status] };
  }));
  return json({ standort: location, zeitraum: { start, end }, menge: qty, artikel: results });
});
