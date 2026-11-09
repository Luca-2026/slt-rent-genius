import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, expect, it } from "vitest";

const db = new PGlite();
const ralf = "dd269ead-0314-4021-ba6a-05f1e5075e6b";
beforeAll(async () => {
  await db.exec(`
    CREATE ROLE authenticated;
    CREATE SCHEMA auth;
    CREATE SCHEMA storage;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT current_setting('test.user_id')::uuid $$;
    CREATE TYPE public.app_role AS ENUM ('admin','niederlassungsleiter','user');
    CREATE TABLE public.user_roles(user_id uuid, role public.app_role);
    CREATE TABLE public.staff_profiles(user_id uuid, is_active boolean);
    CREATE FUNCTION public.has_role(actor uuid, requested public.app_role) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=actor AND role=requested) $$;
    CREATE TABLE storage.objects(bucket_id text, name text);
    GRANT USAGE ON SCHEMA storage, auth TO authenticated;
    GRANT SELECT ON storage.objects, public.staff_profiles TO authenticated;
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    INSERT INTO storage.objects VALUES ('b2b-invoices','inquiry-offers/rental/customer/offer.pdf'), ('b2b-documents','customer/private.pdf'), ('bewerbungen','application.pdf');
    INSERT INTO public.user_roles VALUES ('${ralf}','niederlassungsleiter');
    INSERT INTO public.staff_profiles VALUES ('${ralf}',true);
    SELECT set_config('test.user_id','${ralf}',false);
  `);
  await db.exec(readFileSync("drizzle/migrations/0174_branch_manager_customer_document_read.sql", "utf8"));
}, 30000);
afterAll(() => db.close());

it("Ralf as active branch manager can read customer offers, ABs and protocols in b2b-invoices only", async () => {
  await db.exec("SET ROLE authenticated");
  try {
    expect((await db.query("SELECT bucket_id FROM storage.objects")).rows).toEqual([{ bucket_id: "b2b-invoices" }]);
  } finally { await db.exec("RESET ROLE"); }
});

it("ordinary customers cannot read another customer's documents", async () => {
  await db.exec("SELECT set_config('test.user_id','00000000-0000-0000-0000-000000000001',false); SET ROLE authenticated");
  try { expect((await db.query("SELECT * FROM storage.objects")).rows).toEqual([]); }
  finally { await db.exec(`RESET ROLE; SELECT set_config('test.user_id','${ralf}',false)`); }
});

it("inactive branch managers get no extra document access", async () => {
  await db.exec(`UPDATE public.staff_profiles SET is_active=false WHERE user_id='${ralf}'; SET ROLE authenticated`);
  try { expect((await db.query("SELECT * FROM storage.objects")).rows).toEqual([]); }
  finally { await db.exec("RESET ROLE"); }
});