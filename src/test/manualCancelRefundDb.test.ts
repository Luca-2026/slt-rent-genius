import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, expect, it } from "vitest";
// Isolated in-memory DB only. Applies the prepared (not production-applied) migration 0213.
const db = new PGlite();
const KREFELD = "00000000-0000-0000-0000-00000000000a", BONN = "00000000-0000-0000-0000-00000000000b", ADMIN = "00000000-0000-0000-0000-00000000000c", NOOPS = "00000000-0000-0000-0000-00000000000d";
beforeAll(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('test.uid',true),'')::uuid $$;
    CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT coalesce(nullif(current_setting('test.role',true),''),'service_role') $$;
    CREATE TABLE user_roles(user_id uuid,role text);
    CREATE FUNCTION has_role(uuid,text) RETURNS boolean LANGUAGE sql AS $$ SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id=$1 AND role=$2) $$;
    CREATE FUNCTION can_edit_operations(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id=$1 AND role IN ('admin','standort_mitarbeiter','niederlassungsleiter')) $$;
    CREATE FUNCTION slt_normalize_location(_raw text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT CASE WHEN _raw IS NULL OR btrim(_raw)='' THEN NULL WHEN lower(_raw) LIKE '%bonn%' THEN 'bonn' WHEN lower(_raw) LIKE '%lheim%' OR lower(_raw) LIKE '%mulheim%' THEN 'muelheim' WHEN lower(_raw) LIKE '%krefeld%' THEN 'krefeld' ELSE lower(btrim(_raw)) END $$;
    CREATE FUNCTION slt_stock_location(text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT slt_normalize_location($1) $$;
    CREATE TABLE staff_profiles(user_id uuid,is_active boolean,location text);
    CREATE TABLE rental_inquiries(id uuid PRIMARY KEY,location text,payments jsonb,offer_payload jsonb,offer_total_gross numeric,cancelled_at timestamptz,cancellation_payload jsonb);
    CREATE TABLE rental_inquiry_events(id uuid DEFAULT gen_random_uuid(),rental_inquiry_id uuid,event text,details jsonb,user_id uuid);
    CREATE TABLE inquiry_invoices(id uuid PRIMARY KEY,rental_inquiry_id uuid,invoice_kind text,status text,paid_amount numeric,gross_amount numeric,parent_invoice_id uuid,deducted_installments jsonb);
    CREATE TABLE deposit_settlements(id uuid PRIMARY KEY,rental_inquiry_id uuid,balance numeric,payout_status text,payout_method text,payout_date date);
    CREATE FUNCTION deposit_payout_verified(uuid,bigint) RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
    CREATE TABLE offer_payment_links(id uuid PRIMARY KEY,inquiry_id uuid,inquiry_table text,payment_intent_id text,status text,paid_cents integer,deposit_cents integer);
    CREATE TABLE deposit_refunds(id uuid PRIMARY KEY,link_id uuid,amount_cents integer,status text,stripe_refund_id text);
    CREATE TABLE credit_note_refunds(id uuid PRIMARY KEY,credit_note_id uuid,amount_cents integer,allocations jsonb,status text);
    -- Stand-in carrying the real anchor line of settle_deposit (0198) so 0213's guarded patch is exercised.
    CREATE FUNCTION settle_deposit(_inquiry_id uuid,_deductions jsonb,_payout_method text,_expected_balance numeric,_invoice_id uuid DEFAULT NULL,_payout_date date DEFAULT NULL,_notes text DEFAULT NULL) RETURNS void LANGUAGE plpgsql AS $f$ DECLARE _uid uuid:=auth.uid(); _inq rental_inquiries; BEGIN SELECT * INTO _inq FROM rental_inquiries WHERE id=_inquiry_id;
IF NOT FOUND THEN RAISE EXCEPTION 'Mietanfrage nicht gefunden'; END IF; END $f$;
  `);
  for (const file of ["0141_serialize_shared_original_payment_refunds","0147_durable_external_stripe_refund_receipts","0165_pre_invoice_rental_refund_and_issue_lock","0166_include_order_refunds_in_execution_reconciliation","0167_fix_order_refund_allocation_completion_guard","0168_protect_order_refund_allocation_terminal_states","0189_combined_order_refund_requests","0190_combined_refund_capacity_and_invoice_evidence","0191_freeze_combined_refund_claims_and_scope_execution","0192_combined_refund_lock_order_and_execution_gate"]) await db.exec(readFileSync(`drizzle/migrations/${file}.sql`,"utf8"));
  await db.exec(readFileSync("drizzle/prepared/0213_finance_location_scope_and_manual_cancel_refund.sql","utf8"));
  await db.query(`INSERT INTO user_roles VALUES($1,'standort_mitarbeiter'),($2,'standort_mitarbeiter'),($3,'admin')`,[KREFELD,BONN,ADMIN]);
  await db.query(`INSERT INTO staff_profiles VALUES($1,true,'krefeld'),($2,true,'bonn'),($3,true,null),($4,true,null)`,[KREFELD,BONN,ADMIN,NOOPS]);
},60000);
afterAll(() => db.close());
const asService = () => db.exec("SELECT set_config('test.role','service_role',false), set_config('test.uid','',false)");
async function cancelledOrder(payments: unknown[], location = "krefeld") {
  const id = crypto.randomUUID();
  // Paid 150 €: 50 € cancellation total (rent first), 100 € deposit held.
  await db.query("INSERT INTO rental_inquiries VALUES($1,$2,$3,$4,50,now(),$5)",[id,location,JSON.stringify(payments),JSON.stringify({deposit:100,totals:{grossAmount:50}}),JSON.stringify({totals:{grossAmount:50}})]);
  return id;
}
const reserve = (inq: string, actor: string, cents: number, method = "cash", id = crypto.randomUUID()) => db.query("SELECT reserve_order_refund($1,$2,$3,$4,0,$5,'[]'::jsonb)",[id,inq,actor,cents,method]).then(() => id);
const confirm = (id: string, actor: string, ref: string | null, day: string | null) => db.query("SELECT confirm_manual_order_refund($1,$2,$3,$4::date)",[id,actor,ref,day]);
const totals = async (inq: string) => (await db.query<{t:{deposit_available:number;deposit_used:number;pending:boolean}}>("SELECT order_refund_totals($1) t",[inq])).rows[0].t;
const today = () => new Date().toLocaleDateString("sv-SE",{timeZone:"Europe/Berlin"});

it("cash: partial pending → evidence → remainder, never above held deposit", async () => {
  await asService();
  const inq = await cancelledOrder([{amount:150,label:"Bar"}]);
  expect((await totals(inq)).deposit_available).toBe(10000);
  await expect(reserve(inq, BONN, 4000)).rejects.toThrow("Standortberechtigung");
  const first = await reserve(inq, KREFELD, 4000);
  expect((await totals(inq)).pending).toBe(true);
  await expect(reserve(inq, KREFELD, 1000)).rejects.toThrow();            // no parallel second claim
  await expect(confirm(first, KREFELD, "", today())).rejects.toThrow("Auszahlungsnachweis");
  await expect(confirm(first, KREFELD, "Kasse 7", null)).rejects.toThrow("Auszahlungsdatum");
  await expect(confirm(first, KREFELD, "Kasse 7", "2999-01-01")).rejects.toThrow("Zukunft");
  await expect(confirm(first, KREFELD, "Kasse 7", "2000-01-01")).rejects.toThrow("vor dem Erstattungsauftrag");
  await expect(confirm(first, BONN, "Kasse 7", today())).rejects.toThrow("Standortberechtigung");
  await confirm(first, KREFELD, "Kasse 7", today());
  await confirm(first, KREFELD, "Kasse 7", today());                       // lost-result retry is idempotent
  await expect(confirm(first, KREFELD, "Kasse 8", today())).rejects.toThrow("anderem Nachweis");
  const events = await db.query<{details:{paid_on:string;reference:string;method:string}}>("SELECT details FROM rental_inquiry_events WHERE rental_inquiry_id=$1 AND event='refund_completed'",[inq]);
  expect(events.rows).toHaveLength(1); expect(events.rows[0].details).toMatchObject({ reference:"Kasse 7", method:"cash", paid_on: today() });
  const row = (await db.query<{paid_out_on:string;status:string}>("SELECT paid_out_on::text,status FROM order_refund_requests WHERE id=$1",[first])).rows[0];
  expect(row).toEqual({ paid_out_on: today(), status: "succeeded" });
  await expect(db.query("UPDATE order_refund_requests SET paid_out_on='2026-01-01' WHERE id=$1",[first])).rejects.toThrow("unveränderlich");
  expect(await totals(inq)).toMatchObject({ deposit_available: 6000, deposit_used: 4000, pending: false });
  await expect(reserve(inq, KREFELD, 6001)).rejects.toThrow();
  const rest = await reserve(inq, ADMIN, 6000);                           // central admin across locations
  await confirm(rest, ADMIN, "Kasse 9", today());
  expect((await totals(inq)).deposit_available).toBe(0);
  await expect(reserve(inq, KREFELD, 1)).rejects.toThrow();
});
it("bank: transfer only for bank receipts; cash label or mixed is refused", async () => {
  await asService();
  const bank = await cancelledOrder([{amount:150,label:"Überweisung"}]);
  await expect(reserve(bank, KREFELD, 10000, "cash")).rejects.toThrow("ursprüngliche Zahlungsart");
  const id = await reserve(bank, KREFELD, 10000, "transfer");
  await confirm(id, KREFELD, "SEPA Ref 123", today());
  const mixed = await cancelledOrder([{amount:75,label:"Bar"},{amount:75,label:"Überweisung"}]);
  await expect(reserve(mixed, KREFELD, 100, "cash")).rejects.toThrow();
  await expect(reserve(mixed, KREFELD, 100, "transfer")).rejects.toThrow();
});
it("no deposit actually received → nothing refundable", async () => {
  await asService();
  const inq = await cancelledOrder([{amount:50,label:"Bar"}]);
  expect((await totals(inq)).deposit_available).toBe(0);
  await expect(reserve(inq, KREFELD, 100)).rejects.toThrow();
});
it("direct calls as authenticated user are refused; staff without location refused", async () => {
  await asService();
  const inq = await cancelledOrder([{amount:150,label:"Bar"}]);
  const id = await reserve(inq, KREFELD, 1000);
  await db.exec(`SELECT set_config('test.role','authenticated',false), set_config('test.uid','${KREFELD}',false)`);
  await expect(confirm(id, KREFELD, "Kasse 1", today())).rejects.toThrow("Nicht berechtigt");
  await asService();
  await db.query("INSERT INTO user_roles VALUES($1,'standort_mitarbeiter')",[NOOPS]);
  await expect(confirm(id, NOOPS, "Kasse 1", today())).rejects.toThrow("Standortberechtigung");
  await db.query("DELETE FROM user_roles WHERE user_id=$1",[KREFELD]);           // revoked before confirmation
  await expect(confirm(id, KREFELD, "Kasse 1", today())).rejects.toThrow("Standortberechtigung");
  await db.query("INSERT INTO user_roles VALUES($1,'standort_mitarbeiter')",[KREFELD]);
  await confirm(id, KREFELD, "Kasse 1", today());
});
it("stripe requests can never be confirmed manually", async () => {
  await asService();
  const inq = await cancelledOrder([{amount:150,label:"Bar"}]);
  const id = crypto.randomUUID();
  await db.query("ALTER TABLE order_refund_requests DISABLE TRIGGER USER");
  await db.query("INSERT INTO order_refund_requests(id,inquiry_id,deposit_cents,payout_method,created_by) VALUES($1,$2,100,'stripe',$3)",[id,inq,KREFELD]);
  await db.query("ALTER TABLE order_refund_requests ENABLE TRIGGER USER");
  await expect(confirm(id, KREFELD, "Kasse 1", today())).rejects.toThrow("Providerbeleg");
});
it("deposit settlement and payout completion are bound to the order location", async () => {
  const inq = await cancelledOrder([{amount:150,label:"Bar"}], "bonn"), sid = crypto.randomUUID();
  await db.query("INSERT INTO deposit_settlements VALUES($1,$2,100,'pending','cash',null)",[sid,inq]);
  await db.exec(`SELECT set_config('test.role','authenticated',false), set_config('test.uid','${KREFELD}',false)`);
  await expect(db.query("SELECT mark_deposit_payout_done($1)",[sid])).rejects.toThrow("Standortberechtigung");
  await expect(db.query("SELECT settle_deposit($1,'[]'::jsonb,'cash',0)",[inq])).rejects.toThrow("Standortberechtigung");
  await db.exec(`SELECT set_config('test.uid','${BONN}',false)`);
  await db.query("SELECT mark_deposit_payout_done($1)",[sid]);
  await db.query("SELECT settle_deposit($1,'[]'::jsonb,'cash',0)",[inq]);
  await asService();
});
