import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";

// Synthetische Nachbildung des Bonner Falls (keine Produktivdaten): Hotfix 0215.
const db = new PGlite();
const P = "22222222-0000-0000-0000-000000000001";
const SCISSOR = "22222222-0000-0000-0000-000000000002";
const CUR = "11111111-0000-0000-0000-000000000001";
const OTHER = "11111111-0000-0000-0000-000000000002";

beforeAll(async () => {
  await db.exec(`CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT '00000000-0000-0000-0000-000000000001'::uuid $$;
    CREATE TABLE allowed(ok boolean); INSERT INTO allowed VALUES (true);
    CREATE FUNCTION public.is_staff_member(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT ok FROM allowed $$;
    CREATE FUNCTION public.has_role(uuid, text) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
    CREATE FUNCTION public.can_edit_operations(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT ok FROM allowed $$;
    CREATE TABLE public.rental_inquiries(id uuid PRIMARY KEY, status text, location text, start_date text, end_date text, start_time text, end_time text,
      offer_payload jsonb, offer_number text, customer_name text, product_id text, product_name text, quantity int, order_confirmed_at timestamptz);
    CREATE TABLE public.b2b_managed_products(id uuid PRIMARY KEY, slug text, name text, quantities jsonb);
    CREATE TABLE public.b2b_product_instances(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), managed_product_id uuid, location text, status text, internal_inventory_number text, created_at timestamptz DEFAULT now());
    CREATE TABLE public.b2b_instance_allocations(instance_id uuid, rental_inquiry_id uuid, from_at timestamptz, to_at timestamptz);
    CREATE TABLE public.b2b_reservations(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), status text, location text, product_id text, product_name text, start_date date, end_date date, quantity int);
    CREATE FUNCTION public.slt_try_date(_raw text) RETURNS date LANGUAGE sql IMMUTABLE AS $$
      SELECT CASE WHEN _raw ~ '^\\d{4}-\\d{2}-\\d{2}' THEN to_date(substring(_raw from 1 for 10), 'YYYY-MM-DD') ELSE NULL END $$;
    CREATE FUNCTION public.slt_normalize_location(_raw text) RETURNS text LANGUAGE sql IMMUTABLE AS $$
      SELECT CASE WHEN _raw IS NULL OR btrim(_raw) = '' THEN NULL WHEN lower(_raw) LIKE '%bonn%' THEN 'bonn'
        WHEN lower(_raw) LIKE '%lheim%' OR lower(_raw) LIKE '%mulheim%' THEN 'muelheim' WHEN lower(_raw) LIKE '%krefeld%' THEN 'krefeld' ELSE lower(btrim(_raw)) END $$;
    CREATE FUNCTION public.slt_stock_location(_raw text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT public.slt_normalize_location(_raw) $$;
    CREATE FUNCTION public.slt_quantity_at(_q jsonb, _stock_loc text) RETURNS integer LANGUAGE sql IMMUTABLE AS $$
      SELECT CASE WHEN count(*) = 0 THEN NULL ELSE sum(v::int)::int END FROM jsonb_each_text(COALESCE(_q,'{}'::jsonb)) e(k,v)
      WHERE v ~ '^[0-9]+$' AND public.slt_stock_location(k) = _stock_loc $$;
    CREATE FUNCTION public.slt_item_period(_inq rental_inquiries, _item jsonb, OUT from_at timestamptz, OUT to_at timestamptz) RETURNS record LANGUAGE plpgsql STABLE AS $$
    DECLARE sd date; ed date; st time; et time;
    BEGIN
      sd := COALESCE(public.slt_try_date(_item->>'rental_start'), public.slt_try_date(_inq.start_date));
      ed := COALESCE(public.slt_try_date(_item->>'rental_end'), public.slt_try_date(_inq.end_date), sd);
      BEGIN st := NULLIF(_inq.start_time,'')::time; EXCEPTION WHEN others THEN st := NULL; END;
      BEGIN et := NULLIF(_inq.end_time,'')::time; EXCEPTION WHEN others THEN et := NULL; END;
      IF sd IS NULL THEN from_at := NULL; to_at := NULL; RETURN; END IF;
      from_at := ((sd + COALESCE(st, time '00:00'))::timestamp) AT TIME ZONE 'Europe/Berlin';
      to_at := ((ed + COALESCE(et, time '23:59'))::timestamp) AT TIME ZONE 'Europe/Berlin';
      IF to_at <= from_at THEN to_at := from_at + interval '1 minute'; END IF;
    END $$;
    CREATE FUNCTION public.slt_free_instances(_product uuid, _location text, _from timestamptz, _to timestamptz, _exclude_inquiry uuid) RETURNS SETOF uuid LANGUAGE sql STABLE AS $$
      SELECT i.id FROM public.b2b_product_instances i WHERE i.managed_product_id = _product
        AND public.slt_stock_location(i.location) = public.slt_stock_location(_location) AND i.status IN ('available','rented')
        AND NOT EXISTS (SELECT 1 FROM public.b2b_instance_allocations a WHERE a.instance_id = i.id
          AND (_exclude_inquiry IS NULL OR a.rental_inquiry_id <> _exclude_inquiry) AND tstzrange(a.from_at, a.to_at, '[)') && tstzrange(_from, _to, '[)'))
      ORDER BY i.internal_inventory_number NULLS LAST, i.created_at $$;`);
  await db.exec("SET TIME ZONE 'UTC'");
  await db.exec(readFileSync("docs/prepared/0215_availability_item_period_hotfix.sql", "utf8"));
}, 30000);
afterAll(() => db.close());

const trailer = (extra: Record<string, unknown> = {}) => ({ product_slug: "baumaschinen-3500", product_name: "3500 kg Baumaschinenanhänger", articles: 1, ...extra });
async function inquiry(id: string, status: string, start: string, end: string, items: unknown[], times = ["08:30", "16:30"], location = "Bonn") {
  await db.query("INSERT INTO rental_inquiries(id,status,location,start_date,end_date,start_time,end_time,offer_payload) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",
    [id, status, location, start, end, times[0], times[1], JSON.stringify({ items })]);
}
const check = async (id = CUR) => (await db.query<{ r: { items: Array<Record<string, any>> } }>("SELECT check_availability($1) r", [id])).rows[0].r.items;
const inv = async (loc: string, s: string, e: string, ex: string | null = null) =>
  (await db.query<{ stock: number; booked: number }>("SELECT * FROM check_inventory_availability('baumaschinen-3500',$1,$2,$3,$4,NULL)", [loc, s, e, ex])).rows[0];

beforeEach(async () => {
  await db.exec(`DELETE FROM rental_inquiries; DELETE FROM b2b_reservations; DELETE FROM b2b_product_instances; DELETE FROM b2b_instance_allocations; DELETE FROM b2b_managed_products; UPDATE allowed SET ok = true;`);
  await db.query(`INSERT INTO b2b_managed_products VALUES ($1,'baumaschinen-3500','3500 kg Baumaschinenanhänger','{"bonn":1,"krefeld":2,"muelheim":0}'), ($2,'schere-11-8','11,8 m Scherenbühne','{}')`, [P, SCISSOR]);
});

it("Bonner Fall: unverbindliches Angebot mit Positionsdatum 30.11. blockiert 04.12. nicht, aktueller Auftrag ausgeschlossen", async () => {
  await inquiry(CUR, "accepted", "2026-12-04", "2026-12-04", [trailer({ rental_start: "2026-12-04", rental_end: "2026-12-04" })]);
  await inquiry(OTHER, "offer_sent", "2026-11-02", "2026-12-04", [trailer({ rental_start: "2026-11-30", rental_end: "2026-11-30" }), trailer({ rental_start: "2026-11-30", rental_end: "2026-11-30" })], ["08:00", "15:00"]);
  const [t] = await check();
  expect(t).toMatchObject({ source: "quantities", free: 1, needed: 1, available: true });
  expect(t.other_locations).toEqual({ krefeld: 2, muelheim: 0 });
});

it("auch angenommener Auftrag belegt nur seinen Positionszeitraum, nicht den Anfragezeitraum", async () => {
  await inquiry(CUR, "accepted", "2026-12-04", "2026-12-04", [trailer()]);
  await inquiry(OTHER, "accepted", "2026-11-02", "2026-12-04", [trailer({ rental_start: "2026-11-30", rental_end: "2026-11-30" })]);
  expect((await check())[0]).toMatchObject({ free: 1, available: true });
});

it("bereits bestätigter done-Auftrag bleibt belegt, ohne AB erledigtes Angebot nicht", async () => {
  await inquiry(CUR, "accepted", "2026-12-04", "2026-12-04", [trailer()]);
  await inquiry(OTHER, "done", "2026-12-04", "2026-12-04", [trailer()]);
  expect((await check())[0].free).toBe(1);
  await db.query("UPDATE rental_inquiries SET order_confirmed_at=now() WHERE id=$1", [OTHER]);
  expect((await check())[0]).toMatchObject({ free: 0, available: false });
  await db.query("UPDATE rental_inquiries SET status='cancelled' WHERE id=$1", [OTHER]);
  expect((await check())[0].free).toBe(1);
});

it("zwei überlappende aktuelle Mengenpositionen dürfen nicht dasselbe letzte Gerät verwenden", async () => {
  await inquiry(CUR, "accepted", "2026-12-04", "2026-12-04", [trailer(), trailer()]);
  const items = await check();
  expect(items).toHaveLength(2);
  expect(items.map(i => i.needed)).toEqual([2, 2]);
  expect(items.every(i => i.available === false)).toBe(true);
});

it("unterschiedliche Tage der aktuellen Positionen werden nicht gemeinsam benötigt", async () => {
  await inquiry(CUR, "accepted", "2026-12-04", "2026-12-05", [trailer({rental_start:'2026-12-04',rental_end:'2026-12-04'}), trailer({rental_start:'2026-12-05',rental_end:'2026-12-05'})]);
  expect((await check()).map(i => i.needed)).toEqual([1, 1]);
});

it("echter bestätigter Konflikt bleibt: 1 von 1 belegt → frei 0, 2 benötigt bei 1 → nicht verfügbar", async () => {
  await inquiry(CUR, "accepted", "2026-12-04", "2026-12-04", [trailer()]);
  await inquiry(OTHER, "accepted", "2026-12-03", "2026-12-05", [trailer()]);
  expect((await check())[0]).toMatchObject({ free: 0, available: false });
  await db.exec("DELETE FROM rental_inquiries WHERE status='accepted' AND start_date='2026-12-03'");
  await db.exec(`UPDATE rental_inquiries SET offer_payload='{"items":[{"product_slug":"baumaschinen-3500","articles":2}]}'`);
  expect((await check())[0]).toMatchObject({ free: 1, needed: 2, available: false });
});

it("Positionen mit Anfragezeitraum-Fallback, Aggregation gleicher Artikel und Selbstausschluss", async () => {
  await db.exec(`UPDATE b2b_managed_products SET quantities='{"bonn":2}' WHERE slug='baumaschinen-3500'`);
  await inquiry(OTHER, "accepted", "2026-12-04", "2026-12-04", [trailer(), trailer()]);
  expect((await inv("Bonn", "2026-12-04", "2026-12-04")).booked).toBe(2);
  expect((await inv("Bonn", "2026-12-04", "2026-12-04", OTHER)).booked).toBe(0);
});

it("angrenzende Tage: gleicher Übergabetag zählt (bestehende inklusive Tagesregel), Folgetag nicht", async () => {
  await inquiry(OTHER, "accepted", "2026-12-01", "2026-12-04", [trailer()]);
  expect((await inv("Bonn", "2026-12-04", "2026-12-04")).booked).toBe(1);
  expect((await inv("Bonn", "2026-12-05", "2026-12-05")).booked).toBe(0);
});

it("Mitternacht Berlin wird nicht als UTC-Vortag geprüft", async () => {
  await inquiry(CUR, "accepted", "2026-12-04", "2026-12-04", [trailer()], ["00:00", "10:00"]);
  await inquiry(OTHER, "accepted", "2026-12-03", "2026-12-03", [trailer()]);
  expect((await check())[0]).toMatchObject({ free: 1, available: true });
});

it("B2B-Reservierungen und unbekannte Standorte bleiben belegt bzw. andere Standorte getrennt", async () => {
  await db.exec(`INSERT INTO b2b_reservations(status,location,product_id,start_date,end_date,quantity) VALUES ('confirmed','Bonn','baumaschinen-3500','2026-12-04','2026-12-04',1)`);
  expect((await inv("Bonn", "2026-12-04", "2026-12-04")).booked).toBe(1);
  await inquiry(OTHER, "accepted", "2026-12-04", "2026-12-04", [trailer()], ["08:00", "16:00"], "Krefeld");
  expect((await inv("Krefeld", "2026-12-04", "2026-12-04")).booked).toBe(1);
  expect((await inv("Mülheim an der Ruhr", "2026-12-04", "2026-12-04")).booked).toBe(0);
});

it("Einzelgeräte-Artikel unverändert über Allocations; andere Konflikte (Scherenbühne) bleiben", async () => {
  await db.query("INSERT INTO b2b_product_instances(managed_product_id,location,status) VALUES ($1,'krefeld','available')", [SCISSOR]);
  await inquiry(CUR, "accepted", "2026-12-04", "2026-12-04", [trailer(), { product_slug: "schere-11-8", articles: 1 }]);
  const items = await check();
  expect(items[1]).toMatchObject({ source: "instances", free: 0, available: false, other_locations: { krefeld: 1, muelheim: 0 } });
  expect(items[0]).toMatchObject({ available: true });
});

it("ohne Berechtigung keine Auskunft", async () => {
  await inquiry(CUR, "accepted", "2026-12-04", "2026-12-04", [trailer()]);
  await db.exec("UPDATE allowed SET ok = false");
  await expect(check()).rejects.toThrow("Keine Berechtigung");
  await expect(inv("Bonn", "2026-12-04", "2026-12-04")).rejects.toThrow("Nicht berechtigt");
});

it("Reproduktion: bisherige Produktivdefinition (Rollback-Datei) meldet im Bonner Fall frei 0", async () => {
  await inquiry(CUR, "accepted", "2026-12-04", "2026-12-04", [trailer({ rental_start: "2026-12-04", rental_end: "2026-12-04" })]);
  await inquiry(OTHER, "offer_sent", "2026-11-02", "2026-12-04", [trailer({ rental_start: "2026-11-30", rental_end: "2026-11-30" }), trailer({ rental_start: "2026-11-30", rental_end: "2026-11-30" })], ["08:00", "15:00"]);
  await db.exec(readFileSync("docs/prepared/0215_availability_item_period_rollback.sql", "utf8"));
  try {
    expect((await check())[0]).toMatchObject({ free: 0, available: false });
  } finally {
    await db.exec(readFileSync("docs/prepared/0215_availability_item_period_hotfix.sql", "utf8"));
  }
  expect((await check())[0]).toMatchObject({ free: 1, available: true });
});
