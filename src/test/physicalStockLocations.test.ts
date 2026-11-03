import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

let db: PGlite;
const product = "11111111-1111-4111-8111-111111111111";
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT NULL::uuid $$;
    CREATE FUNCTION can_edit_operations(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
    CREATE FUNCTION is_staff_member(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
    CREATE FUNCTION has_role(uuid,text) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
    CREATE FUNCTION slt_normalize_location(text) RETURNS text LANGUAGE sql AS $$ SELECT lower($1) $$;
    CREATE FUNCTION slt_try_date(text) RETURNS date LANGUAGE sql AS $$ SELECT $1::date $$;
    CREATE TABLE rental_inquiries(id uuid,location text,status text,offer_number text,customer_name text,start_date text,end_date text,product_id text,product_name text,quantity int,offer_payload jsonb);
    CREATE TABLE b2b_managed_products(id uuid,slug text,name text,quantities jsonb);
    CREATE TABLE b2b_product_instances(id uuid,managed_product_id uuid,location text,status text,internal_inventory_number text,created_at timestamptz);
    CREATE TABLE b2b_instance_allocations(instance_id uuid,rental_inquiry_id uuid,from_at timestamptz,to_at timestamptz);
    CREATE TABLE b2b_reservations(id uuid,product_id text,product_name text,location text,status text,start_date date,end_date date,quantity int);
    CREATE FUNCTION slt_item_period(rental_inquiries,jsonb) RETURNS TABLE(from_at timestamptz,to_at timestamptz) LANGUAGE sql AS $$ SELECT '2026-11-06 15:00+00'::timestamptz,'2026-11-09 08:30+00'::timestamptz $$;`);
  await db.exec(readFileSync("drizzle/migrations/0122_consolidate_stock_sources.sql", "utf8"));
  await db.exec(readFileSync("drizzle/migrations/0124_physical_stock_locations.sql", "utf8"));
  await db.query(`INSERT INTO b2b_managed_products VALUES ($1,'minibagger-1t','1t Minibagger','{"krefeld":1,"muelheim":2,"bonn":1}')`, [product]);
  await db.exec(`INSERT INTO b2b_product_instances VALUES
    ('22222222-2222-4222-8222-222222222222','${product}','krefeld','available','KR-01',now()),
    ('33333333-3333-4333-8333-333333333333','${product}','muelheim','available','MH-01',now()),
    ('44444444-4444-4444-8444-444444444444','${product}','muelheim','available','MH-02',now());
    INSERT INTO rental_inquiries VALUES ('55555555-5555-4555-8555-555555555555','Krefeld','accepted','9RDMKY','Test','2026-11-06','2026-11-09',NULL,'1t Minibagger',1,'{"items":[{"product_slug":"minibagger-1t","articles":1}]}');
    INSERT INTO b2b_instance_allocations VALUES ('22222222-2222-4222-8222-222222222222','55555555-5555-4555-8555-555555555555','2026-11-06 07:00+00','2026-11-09 07:00+00');
    INSERT INTO rental_inquiries VALUES ('66666666-6666-4666-8666-666666666666','Krefeld','accepted',NULL,'Test','2026-11-06','2026-11-09',NULL,'1t Minibagger',1,'{"items":[{"product_slug":"minibagger-1t","articles":1}]}');`);
});
afterAll(async () => { await db.close(); });
describe("Physical inventory locations", () => {
  it("keeps the two real Mülheim devices out of Krefeld stock", async () => {
    const { rows } = await db.query<{ stock: number; booked: number }>(`SELECT * FROM check_inventory_availability('minibagger-1t','Krefeld','2026-11-06','2026-11-09','66666666-6666-4666-8666-666666666666')`);
    expect(rows[0].stock).toBe(1);
    expect(rows[0].booked).toBe(1);
  });
  it("blocks the allocated Krefeld device and offers Mülheim only as a transport source", async () => {
    const { rows } = await db.query<{ result: { all_available: boolean; items: { free: number; other_locations: { muelheim: number } }[] } }>(`SELECT check_availability('66666666-6666-4666-8666-666666666666') as result`);
    expect(rows[0].result.all_available).toBe(false);
    expect(rows[0].result.items[0].free).toBe(0);
    expect(rows[0].result.items[0].other_locations.muelheim).toBe(2);
  });
  it("also separates quantity-only CMS stock by physical location", async () => {
    const { rows } = await db.query<{ krefeld: number; muelheim: number }>(`SELECT slt_quantity_at('{"krefeld":1,"muelheim":2}','krefeld') as krefeld, slt_quantity_at('{"krefeld":1,"muelheim":2}','muelheim') as muelheim`);
    expect(rows[0].krefeld).toBe(1);
    expect(rows[0].muelheim).toBe(2);
  });
});