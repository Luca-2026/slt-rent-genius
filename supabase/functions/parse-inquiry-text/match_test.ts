import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { matchItems, type CatalogRow } from "./match.ts";
import { sanitize, type Extraction } from "./extract.ts";

const row = (slug: string, name: string, rc: Record<string, string> = {}): CatalogRow => ({
  id: slug, slug, name, model_name: null, category: "x", subcategory: null, rentware_code: rc,
  on_request: false, price_per_day: null, price_weekend: null, price_per_month: null,
  price_unit_label: null, images: null, addon_options: null,
});

const ex: Extraction = {
  customer: { first_name: null, last_name: null, company: null, email: null, phone: null, street: null, postal_code: null, city: null, customer_type: null },
  location: "bonn",
  rental: { start_date: null, end_date: null, duration_days: null, date_text: null },
  delivery: { requested: null, street: null, postal_code: null, city: null },
  items: [
    { original_text: "Bagger", search_terms: ["Bagger"], quantity: 1 },
    { original_text: "Fantasie", search_terms: ["x"], quantity: 2 },
  ],
  notes: null,
  open_questions: [],
};

function sse(obj: unknown) {
  const body = `data: ${JSON.stringify({ type: "response.output_text.delta", delta: JSON.stringify(obj) })}\n\n`;
  return new Response(body, { status: 200 });
}

Deno.test("erfundene Katalogschlüssel werden verworfen", async () => {
  const orig = globalThis.fetch;
  globalThis.fetch = () => Promise.resolve(sse({ matches: [
    { index: 0, best: "K1", alternatives: ["K99", "K1", "K2"], confidence: "high", reason: "ok" },
    { index: 1, best: "K77", alternatives: [], confidence: "high", reason: "erfunden" },
  ] }));
  try {
    const { matches } = await matchItems(ex, [row("bagger", "Bagger", { bonn: "A" }), row("bagger2", "Bagger 2")], { apiKey: "k" });
    assertEquals(matches[0].product?.slug, "bagger");
    assertEquals(matches[0].product?.bookable_here, true);
    assertEquals(matches[0].alternatives.map((a) => a.slug), ["bagger2"]);
    assertEquals(matches[1].product, null);
    assertEquals(matches[1].confidence, "none");
    assertEquals(matches[1].quantity, 2);
  } finally {
    globalThis.fetch = orig;
  }
});

Deno.test("sanitize verwirft nicht im Text stehende Kontaktdaten und falsche Daten", () => {
  const d = sanitize({
    ...ex,
    customer: { ...ex.customer, email: "erfunden@x.de", phone: "0171 999999" },
    rental: { start_date: "2026-10-10", end_date: "2026-10-05", duration_days: 99, date_text: null },
  }, "Hallo, Tel 0228 123456");
  assertEquals(d.customer.email, null);
  assertEquals(d.customer.phone, null);
  assertEquals(d.rental.end_date, null);
});

Deno.test("sanitize rechnet Mietdauer selbst nach", () => {
  const d = sanitize({ ...ex, rental: { start_date: "2026-10-12", end_date: "2026-10-14", duration_days: 5, date_text: null } }, "x");
  assertEquals(d.rental.duration_days, 3);
});
