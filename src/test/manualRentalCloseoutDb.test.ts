import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, expect, it } from "vitest";

const db = new PGlite();
const actor = "00000000-0000-0000-0000-000000000001";
beforeAll(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated;
    CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT '${actor}'::uuid $$;
    CREATE TABLE public.user_roles(user_id uuid, role text);
    CREATE FUNCTION public.is_super_admin(_user_id uuid) RETURNS boolean LANGUAGE sql AS $$
      SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role='admin') $$;
    CREATE TABLE public.rental_inquiries(id uuid PRIMARY KEY,status text,closed_manually_at timestamptz,closed_manually_by uuid,closed_manually_reason text);
    CREATE TABLE public.rental_inquiry_events(rental_inquiry_id uuid,user_id uuid,event text,details jsonb);`);
  await db.exec(readFileSync("drizzle/migrations/0163_superadmin_only_manual_rental_closeout.sql", "utf8"));
}, 30000);
afterAll(() => db.close());

it("rejects branch managers and staff without changing the order", async () => {
  const id = crypto.randomUUID();
  await db.query("INSERT INTO rental_inquiries(id,status) VALUES($1,'accepted')", [id]);
  for (const role of ["niederlassungsleiter", "standort_mitarbeiter", "buchhaltung", "readonly", "user"]) {
    await db.exec("DELETE FROM user_roles");
    await db.query("INSERT INTO user_roles VALUES($1,$2)", [actor, role]);
    await expect(db.query("SELECT close_rental_without_protocol($1,'Gerät zurück, Protokoll vergessen')", [id])).rejects.toThrow("Nur Superadmins");
  }
  expect((await db.query<{ status: string; closed_manually_at: string | null }>("SELECT * FROM rental_inquiries WHERE id=$1", [id])).rows[0]).toMatchObject({ status: "accepted", closed_manually_at: null });
  expect((await db.query("SELECT * FROM rental_inquiry_events")).rows).toHaveLength(0);
});

it("allows superadmin closeout with reason, actor, timestamp and a single event", async () => {
  const id = crypto.randomUUID();
  await db.exec("DELETE FROM user_roles");
  await db.query("INSERT INTO user_roles VALUES($1,'admin')", [actor]);
  await db.query("INSERT INTO rental_inquiries(id,status) VALUES($1,'accepted')", [id]);
  await expect(db.query("SELECT close_rental_without_protocol($1,'')", [id])).rejects.toThrow("Grund");
  await db.query("SELECT close_rental_without_protocol($1,'Gerät zurück, Protokoll vergessen')", [id]);
  await db.query("SELECT close_rental_without_protocol($1,'Erneuter Versuch')", [id]);
  const row = (await db.query<{ closed_manually_at: unknown }>("SELECT * FROM rental_inquiries WHERE id=$1", [id])).rows[0];
  expect(row).toMatchObject({ status: "done", closed_manually_by: actor, closed_manually_reason: "Gerät zurück, Protokoll vergessen" });
  expect(row?.closed_manually_at).toBeTruthy();
  expect((await db.query("SELECT * FROM rental_inquiry_events WHERE rental_inquiry_id=$1", [id])).rows).toHaveLength(1);
});