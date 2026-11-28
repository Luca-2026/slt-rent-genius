import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, expect, it } from "vitest";
import { classifyChange, validateCatalogSnapshot } from "@/lib/publicationRefresh";

// In-memory PostgreSQL only. Execute the existing save RPC and public projection;
// this is not a replica of production RLS or a deployment of these migrations.
const db = new PGlite();
const id = "11111111-1111-4111-8111-111111111111";
beforeAll(async () => {
  const view = readFileSync("drizzle/migrations/0024_spec_order_public_view.sql", "utf8");
  const fields = view.split("SELECT ")[1]?.split("FROM public.")[0]?.trim().split(", ");
  if (!fields) throw new Error("Public projection not found");
  const types: Record<string, string> = { id: "uuid PRIMARY KEY", available_locations: "text[]", specifications: "jsonb", price_per_day: "numeric", price_per_month: "numeric", sort_order: "integer" };
  await db.exec(`CREATE ROLE authenticated; CREATE ROLE anon; CREATE SCHEMA auth;
    CREATE TABLE fixture_access(allowed boolean); INSERT INTO fixture_access VALUES(true);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT '${id}'::uuid $$;
    CREATE FUNCTION can_edit_operations(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT allowed FROM fixture_access $$;
    CREATE TABLE b2b_managed_products(${fields.map(k => `${k} ${types[k] ?? "text"}`).join(",")},
      is_published boolean DEFAULT false, price_from_1_rd numeric, prices_same_all_locations boolean DEFAULT false,
      created_by uuid,updated_by uuid,internal_notes text,customer_email text);
    CREATE TABLE b2b_managed_product_location_prices(managed_product_id uuid,location text,price_from_1_rd numeric CHECK(price_from_1_rd>=0),UNIQUE(managed_product_id,location));`);
  for (const file of ["0145_atomic_managed_article_price_save", "0146_allow_event_location_price_patches"]) {
    await db.exec(readFileSync(`drizzle/migrations/${file}.sql`, "utf8"));
  }
  await db.exec(view);
  await db.exec(readFileSync("drizzle/migrations/0199_public_product_shared_price_flag.sql", "utf8"));
}, 30000);
afterAll(() => db.close());
const save = (patch: Record<string, unknown>, prices: unknown[] = []) => db.query("SELECT save_managed_article($1,$2,$3)", [id, JSON.stringify(patch), JSON.stringify(prices)]);
it("draft → publish → location/price/spec change → deactivate preserves identity and excludes private fields", async () => {
  const draft = { slug: "isolated-excavator", name: "Isolated fixture", category: "erdbewegung", available_locations: ["bonn"],
    specifications: { Grabtiefe: "1820 mm" }, price_from_1_rd: 100, internal_notes: "PRIVATE-FIXTURE", customer_email: "private@example.test", is_published: false };
  await save(draft);
  expect((await db.query("SELECT * FROM managed_products_public")).rows).toHaveLength(0);
  await save({ is_published: true });
  const published = (await db.query<Record<string, unknown>>("SELECT * FROM managed_products_public")).rows[0];
  expect(published.id).toBe(id); expect(published.available_locations).toEqual(["bonn"]);
  expect(published).not.toHaveProperty("customer_email"); expect(published).not.toHaveProperty("internal_notes");
  expect(JSON.stringify(published)).not.toContain("PRIVATE-FIXTURE");
  expect(validateCatalogSnapshot([published], 1).ok).toBe(true);
  await save({ available_locations: ["krefeld", "muelheim"], specifications: { Grabtiefe: "2000 mm" } }, [{ location: "krefeld", price_from_1_rd: 90 }, { location: "muelheim", price_from_1_rd: 95 }]);
  const changed = (await db.query<Record<string, unknown>>("SELECT * FROM managed_products_public")).rows[0];
  expect(changed.available_locations).toEqual(["krefeld", "muelheim"]); expect(changed.specifications).toEqual({ Grabtiefe: "2000 mm" });
  expect(classifyChange({ ...published, is_published: true }, { ...changed, is_published: true }, true)).toBe("public_update");
  const prices = (await db.query<{location:string;price_from_1_rd:string}>("SELECT location,price_from_1_rd FROM b2b_managed_product_location_prices ORDER BY location")).rows;
  expect(prices.map(p => [p.location, Number(p.price_from_1_rd)])).toEqual([["krefeld", 90], ["muelheim", 95]]);
  expect(Number((await db.query<{price_from_1_rd:string}>("SELECT price_from_1_rd FROM b2b_managed_products")).rows[0].price_from_1_rd)).toBe(100);
  await save({ is_published: false }); expect((await db.query("SELECT * FROM managed_products_public")).rows).toHaveLength(0);
  expect((await db.query("SELECT id FROM b2b_managed_products")).rows).toEqual([{ id }]);
});
it("rejects an unauthorized save without changing the article", async () => {
  await db.exec("UPDATE fixture_access SET allowed=false");
  await expect(save({ name: "Denied" })).rejects.toThrow("Keine Berechtigung");
  expect((await db.query<{name:string}>("SELECT name FROM b2b_managed_products WHERE id=$1", [id])).rows[0].name).toBe("Isolated fixture");
});