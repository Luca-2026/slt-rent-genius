import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, expect, it } from "vitest";
const db = new PGlite();
const actor = "61389d69-7188-4834-b74b-44b9051046f8";
const id = "00000000-0000-0000-0000-000000000001";
beforeAll(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT '${actor}'::uuid $$;
    CREATE FUNCTION has_role(uuid,text) RETURNS boolean LANGUAGE sql AS $$ SELECT current_setting('test.admin',true) = 'true' $$;
    CREATE TABLE staff_profiles(user_id uuid,is_active boolean,location text);
    CREATE TABLE rental_inquiries(id uuid,status text);
    CREATE TABLE sign_bookings(id uuid PRIMARY KEY,inquiry_id uuid,location text,status text,cancelled_at timestamptz);
    INSERT INTO staff_profiles VALUES ('${actor}',true,'krefeld');
    INSERT INTO rental_inquiries VALUES ('${id}','accepted');
    INSERT INTO sign_bookings VALUES ('${id}','${id}','muelheim','paid',NULL);
    SET test.admin = 'false';`);
  await db.exec(readFileSync("drizzle/migrations/0195_sign_booking_preparation_checkbox.sql", "utf8"));
}, 30000);
afterAll(() => db.close());
it("persists one checkbox with real actor and supports removal without changing booking status", async () => {
  const result = await db.query<{prepared_at: string; prepared_by: string; status: string}>("SELECT * FROM set_sign_booking_prepared($1,true,NULL)", [id]);
  expect(result.rows[0].prepared_by).toBe(actor);
  expect(result.rows[0].status).toBe("paid");
  expect(result.rows[0].prepared_at).toBeTruthy();
  await expect(db.query("SELECT set_sign_booking_prepared($1,false,NULL)", [id])).rejects.toThrow("Bitte aktualisieren");
  await db.query("SELECT set_sign_booking_prepared($1,false,(SELECT prepared_at FROM sign_bookings WHERE id=$1))", [id]);
  expect((await db.query("SELECT prepared_at,prepared_by FROM sign_bookings WHERE id=$1", [id])).rows[0]).toEqual({prepared_at:null,prepared_by:null});
});
it("blocks another branch while preserving existing admin access", async () => {
  await db.exec("UPDATE sign_bookings SET location='bonn'");
  await expect(db.query("SELECT set_sign_booking_prepared($1,true,NULL)", [id])).rejects.toThrow("Keine Berechtigung");
  await db.exec("SET test.admin='true'");
  await db.query("SELECT set_sign_booking_prepared($1,true,NULL)", [id]);
  await db.query("SELECT set_sign_booking_prepared($1,false,(SELECT prepared_at FROM sign_bookings WHERE id=$1))", [id]);
});
it("never changes completed historical records", async () => {
  await db.exec("UPDATE rental_inquiries SET status='done'");
  await expect(db.query("SELECT set_sign_booking_prepared($1,true,NULL)", [id])).rejects.toThrow("bleiben unverändert");
  expect((await db.query("SELECT prepared_at FROM sign_bookings WHERE id=$1", [id])).rows[0]).toEqual({prepared_at:null});
});