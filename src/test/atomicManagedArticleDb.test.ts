import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, expect, it } from 'vitest';
const db = new PGlite();
const id = '11111111-1111-4111-8111-111111111111';
beforeAll(async () => {
  await db.exec(`CREATE ROLE authenticated; CREATE ROLE anon; CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT '${id}'::uuid $$;
    CREATE FUNCTION can_edit_operations(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
    CREATE TABLE b2b_managed_products(id uuid PRIMARY KEY,name text,price_from_1_rd numeric,created_by uuid,updated_by uuid);
    CREATE TABLE b2b_managed_product_location_prices(managed_product_id uuid,location text,price_from_1_rd numeric CHECK(price_from_1_rd>=0),price_base_1_3_cd numeric,surcharge_per_cd_from_4 numeric,surcharge_per_cd_from_8 numeric,tier_prices_manual jsonb,UNIQUE(managed_product_id,location));`);
  await db.exec(readFileSync('drizzle/migrations/0145_atomic_managed_article_price_save.sql','utf8'));
  await db.exec(readFileSync('drizzle/migrations/0146_allow_event_location_price_patches.sql','utf8'));
},30000);
afterAll(() => db.close());
it('article and both location prices roll back when the second location fails', async () => {
  await expect(db.query('SELECT save_managed_article($1,$2,$3)',[id,JSON.stringify({name:'TEST',price_from_1_rd:100}),JSON.stringify([{location:'krefeld',price_from_1_rd:90},{location:'bonn',price_from_1_rd:-1}])])).rejects.toThrow();
  expect((await db.query('SELECT * FROM b2b_managed_products')).rows).toHaveLength(0);
  expect((await db.query('SELECT * FROM b2b_managed_product_location_prices')).rows).toHaveLength(0);
});
it('event location patches retain base and calendar-day surcharge fields',async()=>{
  const eventId=crypto.randomUUID();
  await db.query('SELECT save_managed_article($1,$2,$3)',[eventId,JSON.stringify({name:'TEST Event'}),JSON.stringify([{location:'bonn',price_base_1_3_cd:100,surcharge_per_cd_from_4:20,surcharge_per_cd_from_8:10}])]);
  const row=(await db.query<Record<string,unknown>>('SELECT * FROM b2b_managed_product_location_prices WHERE managed_product_id=$1',[eventId])).rows[0];
  expect(Number(row.price_base_1_3_cd)).toBe(100);expect(Number(row.surcharge_per_cd_from_4)).toBe(20);expect(Number(row.surcharge_per_cd_from_8)).toBe(10);
});
it('retry with the same identity creates one article and content updates preserve prices', async () => {
  await db.query('SELECT save_managed_article($1,$2,$3)',[id,JSON.stringify({name:'TEST',price_from_1_rd:100}),JSON.stringify([{location:'krefeld',price_from_1_rd:90}])]);
  await db.query('SELECT save_managed_article($1,$2)',[id,JSON.stringify({name:'TEST geändert'})]);
  const rows=(await db.query<{name:string,price_from_1_rd:string}>('SELECT * FROM b2b_managed_products')).rows;
  expect(rows).toHaveLength(1);expect(rows[0].name).toBe('TEST geändert');expect(Number(rows[0].price_from_1_rd)).toBe(100);
  expect(Number((await db.query<{price_from_1_rd:string}>('SELECT * FROM b2b_managed_product_location_prices')).rows[0].price_from_1_rd)).toBe(90);
});