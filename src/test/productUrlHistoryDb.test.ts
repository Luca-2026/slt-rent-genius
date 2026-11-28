import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import { normalizeProductPath, productPath, resolveHistoricalProduct, type PublicUrlRedirect } from "../../supabase/functions/_shared/product-url-history";

const db = new PGlite();
const A = "11111111-1111-4111-8111-111111111111", B = "22222222-2222-4222-8222-222222222222";
const sql = readFileSync("docs/prepared/0214_managed_article_url_history.sql", "utf8");
beforeAll(async () => {
  const fields = readFileSync("drizzle/migrations/0024_spec_order_public_view.sql", "utf8").split("SELECT ")[1]?.split("FROM public.")[0]?.trim().split(", ");
  if (!fields) throw new Error("Projection missing");
  const types: Record<string, string> = { id: "uuid PRIMARY KEY", available_locations: "text[]", specifications: "jsonb", images: "text[]", seo_faqs: "jsonb", features: "text[]", tags: "text[]", rental_notes: "text[]", video_urls: "text[]", sort_order: "integer" };
  await db.exec(`CREATE ROLE authenticated; CREATE ROLE anon; CREATE ROLE service_role; CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT '${A}'::uuid $$;
    CREATE FUNCTION can_edit_operations(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
    CREATE TABLE b2b_managed_products(${fields.map(k => `${k} ${types[k] ?? "text"}`).join(",")},
      is_published boolean DEFAULT false, price_from_1_rd numeric, prices_same_all_locations boolean DEFAULT false,
      created_by uuid, updated_by uuid, UNIQUE(slug));
    CREATE TABLE b2b_managed_product_location_prices(managed_product_id uuid,location text,price_from_1_rd numeric CHECK(price_from_1_rd>=0),UNIQUE(managed_product_id,location));`);
  for (const name of ["0145_atomic_managed_article_price_save", "0146_allow_event_location_price_patches"]) await db.exec(readFileSync(`drizzle/migrations/${name}.sql`, "utf8"));
  await db.exec(sql);
}, 30_000);
beforeEach(async () => { await db.exec("TRUNCATE managed_article_url_history,b2b_managed_products,b2b_managed_product_location_prices"); });
afterAll(() => db.close());
const save = (patch: Record<string, unknown>, id = A, prices: unknown[] = []) => db.query("SELECT save_managed_article($1,$2,$3)", [id, JSON.stringify(patch), JSON.stringify(prices)]);
const draft = { slug: "original", name: "Synthetic article", category: "erdbewegung", available_locations: ["bonn", "krefeld", "muelheim"], images: ["/product-images/fixture.webp"], specifications: { Grabtiefe: "1820 mm" }, is_published: false };
const history = () => db.query<PublicUrlRedirect>("SELECT * FROM public_product_url_redirects ORDER BY id").then(r => r.rows);
it("draft edits and first publication create no pretend history", async () => {
  await save(draft); await save({ slug: "draft-new" }); await save({ is_published: true });
  expect((await db.query("SELECT * FROM managed_article_url_history")).rows).toHaveLength(0);
});
it("CMS lifecycle preserves identity, fields and prices while recording three old routes atomically", async () => {
  await save({ ...draft, is_published: true, price_from_1_rd: 100 });
  await save({ specifications: { Grabtiefe: "2000 mm" }, seo_meta_description: "Synthetic SEO", images: ["/product-images/changed.webp"] }, A, [{ location: "bonn", price_from_1_rd: 90 }]);
  expect((await db.query("SELECT * FROM managed_article_url_history")).rows).toHaveLength(0);
  await save({ slug: "second", category: "verdichtung" });
  const rows = await history(); expect(rows).toHaveLength(3);
  expect(resolveHistoricalProduct("/mieten/bonn/erdbewegung/original", [{ id: A, slug: "second", category: "verdichtung", available_locations: draft.available_locations }], rows)).toBe("/mieten/bonn/verdichtung/second");
  const p = (await db.query<{id:string;price_from_1_rd:string;specifications:unknown}>("SELECT * FROM b2b_managed_products")).rows[0];
  expect(p.id).toBe(A); expect(Number(p.price_from_1_rd)).toBe(100); expect(p.specifications).toEqual({ Grabtiefe: "2000 mm" });
});
it("multiple renames resolve to the current article without chains and return naming prioritizes current route", async () => {
  await save({ ...draft, is_published: true }); await save({ slug: "second" }); await save({ slug: "third" });
  expect(await history()).toHaveLength(6);
  await save({ slug: "original" });
  const rows = await history(); expect(rows).toHaveLength(6);
  expect(rows.some(r => r.old_path.endsWith("/original"))).toBe(false);
  expect(rows.some(r => r.old_path.endsWith("/third"))).toBe(true);
});
it("removed locations never redirect to another branch and reactivation restores only offered routes", async () => {
  await save({ ...draft, is_published: true }); await save({ slug: "new", available_locations: ["bonn"] });
  expect((await history()).map(r => r.location)).toEqual(["bonn"]);
  await save({ is_published: false }); expect(await history()).toHaveLength(0);
  await save({ slug: "reactivated", is_published: true });
  expect((await history()).every(r => r.location === "bonn")).toBe(true);
});
it("active reuse of an old slug by a different article wins", async () => {
  await save({ ...draft, is_published: true }); await save({ slug: "second" });
  await save({ ...draft, is_published: true }, B);
  expect(await history()).toHaveLength(0);
});
it("ambiguous historical ownership stays unresolved even after active reuse ends", async () => {
  await save({ ...draft, is_published: true }); await save({ slug: "second" }); await save({ ...draft, is_published: true }, B);
  await save({ slug: "third" }, B); expect(await history()).toHaveLength(0);
});
it("delete retains history without reviving deleted products", async () => {
  await save({ ...draft, is_published: true }); await db.exec(`DELETE FROM b2b_managed_products WHERE id='${A}'`);
  expect((await db.query("SELECT * FROM managed_article_url_history")).rows).toHaveLength(3); expect(await history()).toHaveLength(0);
});
it("failed transaction rolls back article, prices and history", async () => {
  await save({ ...draft, is_published: true });
  await expect(save({ slug: "failed" }, A, [{ location: "bonn", price_from_1_rd: -1 }])).rejects.toThrow();
  expect((await db.query<{slug:string}>("SELECT slug FROM b2b_managed_products")).rows[0].slug).toBe("original"); expect(await history()).toHaveLength(0);
});
it("repeated saves and repeated preparation do not duplicate evidence", async () => {
  await save({ ...draft, is_published: true }); await save({ slug: "second" }); await save({ slug: "second" }); await db.exec(sql);
  expect(await history()).toHaveLength(3);
});
it("public callers cannot read or write the raw history ledger", async () => {
  await save({ ...draft, is_published: true }); await save({ slug: "new" });
  await db.exec("SET ROLE anon");
  await expect(db.query("SELECT * FROM managed_article_url_history")).rejects.toThrow("permission denied");
  expect(await history()).toHaveLength(3);
  await db.exec("RESET ROLE");
});
it("encodes non-ASCII segments exactly once and rejects manipulated paths", async () => {
  await save({ ...draft, slug: "gerät", is_published: true }); await save({ slug: "neu" });
  expect((await history())[0].old_path).toContain("ger%C3%A4t");
  expect(normalizeProductPath("/mieten/bonn/erdbewegung/ger%C3%A4t/")).toBe(productPath("bonn", "erdbewegung", "gerät"));
  for (const path of ["https://evil.test/mieten/bonn/a/b", "/mieten/bonn/a/%2F", "/mieten/bonn/a/%252F", "/mieten/other/a/b", "/mieten/bonn/a/%xx"]) expect(normalizeProductPath(path)).toBeNull();
});