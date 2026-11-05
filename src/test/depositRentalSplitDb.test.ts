import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, expect, it } from "vitest";
const db = new PGlite();
const actor = "11111111-1111-4111-8111-111111111111";
beforeAll(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT '${actor}'::uuid $$;
    CREATE FUNCTION can_edit_operations(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
    CREATE TABLE auth.users(id uuid,email text); INSERT INTO auth.users VALUES('${actor}','fixture@example.com');
    CREATE TABLE staff_profiles(user_id uuid,first_name text,last_name text);
    CREATE TABLE rental_inquiries(id uuid PRIMARY KEY,payments jsonb,offer_total_gross numeric,offer_payload jsonb);
    CREATE TABLE deposit_settlements(rental_inquiry_id uuid,paid_amount numeric,rent_amount numeric,deposit_held numeric,deductions jsonb,deductions_net numeric,deductions_gross numeric,offset_amount numeric,balance numeric,payout_method text,payout_status text,payout_date date,invoice_id uuid,notes text,settled_by uuid,settled_by_name text);
    CREATE TABLE b2b_return_protocols(id uuid,rental_inquiry_id uuid);
    CREATE TABLE b2b_return_extra_charges(return_protocol_id uuid,billed boolean);
    CREATE TABLE b2b_protocol_damages(return_protocol_id uuid,billed boolean);
    CREATE TABLE rental_inquiry_events(rental_inquiry_id uuid,event text,user_id uuid,details jsonb);`);
  await db.exec(readFileSync("drizzle/migrations/0140_separate_deposit_from_rental_credit.sql", "utf8"));
}, 30000);
afterAll(() => db.close());
async function fixture() {
  const id = crypto.randomUUID();
  await db.query("INSERT INTO rental_inquiries VALUES($1,'[{\"amount\":1180.68}]',556.92,'{\"deposit\":500}')", [id]);
  return id;
}
it("server stores 500 deposit refund separately from 123.76 rental credit", async () => {
  const id = await fixture();
  await db.query("SELECT settle_deposit($1,'[]','transfer',500)", [id]);
  const row = (await db.query<{ deposit_held: string; rental_credit: string; balance: string }>("SELECT * FROM deposit_settlements WHERE rental_inquiry_id=$1", [id])).rows[0];
  expect(Number(row?.deposit_held)).toBe(500);
  expect(Number(row?.rental_credit)).toBe(123.76);
  expect(Number(row?.balance)).toBe(500);
  await expect(db.query("SELECT settle_deposit($1,'[]','transfer',500)", [id])).rejects.toThrow("bereits abgerechnet");
});
it("old combined 623.76 balance is rejected instead of paid", async () => {
  const id = await fixture();
  await expect(db.query("SELECT settle_deposit($1,'[]','transfer',623.76)", [id])).rejects.toThrow("Beträge haben sich geändert");
  expect((await db.query<{ count: number }>("SELECT count(*)::int AS count FROM deposit_settlements WHERE rental_inquiry_id=$1", [id])).rows[0]?.count).toBe(0);
});