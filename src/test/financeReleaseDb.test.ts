import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, expect, it } from "vitest";
import { buildDatevCashCsv } from "../../supabase/functions/_shared/datev-cash-csv";
// No transport, real accounts or provider: fresh local PostgreSQL-compatible WASM only.
const db = new PGlite();
const KREFELD = "00000000-0000-0000-0000-00000000000a", BONN = "00000000-0000-0000-0000-00000000000b", ADMIN = "00000000-0000-0000-0000-00000000000c", NOOPS = "00000000-0000-0000-0000-00000000000d";
const reviewed = readFileSync("docs/prepared/0213_finance_reviewed.sql","utf8");
const day = new Date().toLocaleDateString("sv-SE",{timeZone:"Europe/Berlin"});
let baselineJournal: {amount:string}[] = [], baselineRequest = "", oldCashRequest = "", oldCashOrder = "", originalRepeatError = "";
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
  const originalGuard = (await db.query<{d:string}>("SELECT pg_get_functiondef('guard_order_refund_immutable()'::regprocedure) d")).rows[0].d;
  await db.exec(readFileSync("drizzle/prepared/0213_finance_location_scope_and_manual_cancel_refund.sql","utf8"));
  await db.query(`INSERT INTO user_roles VALUES($1,'standort_mitarbeiter'),($2,'standort_mitarbeiter'),($3,'admin')`,[KREFELD,BONN,ADMIN]);
  await db.query(`INSERT INTO staff_profiles VALUES($1,true,'krefeld'),($2,true,'bonn'),($3,true,null),($4,true,null)`,[KREFELD,BONN,ADMIN,NOOPS]);

  await db.exec(`
    CREATE FUNCTION is_staff_member(uuid) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$ SELECT can_edit_operations($1) $$;
    ALTER FUNCTION has_role(uuid,text) SECURITY DEFINER;
    ALTER FUNCTION can_edit_operations(uuid) SECURITY DEFINER;
    ALTER TABLE rental_inquiries ADD COLUMN order_code text, ADD COLUMN customer_name text, ADD COLUMN company_name text;
    CREATE TABLE sales_inquiries(id uuid PRIMARY KEY,location text,payments jsonb,order_code text,first_name text,last_name text,company_name text,billing_company text);
    ALTER TABLE inquiry_invoices ADD COLUMN location text, ADD COLUMN sales_inquiry_id uuid, ADD COLUMN payments jsonb, ADD COLUMN invoice_number text, ADD COLUMN customer_name text, ADD COLUMN company_name text;
    ALTER TABLE deposit_settlements ADD COLUMN paid_amount numeric, ADD COLUMN rent_amount numeric, ADD COLUMN deposit_held numeric, ADD COLUMN rental_credit numeric, ADD COLUMN deductions jsonb, ADD COLUMN deductions_net numeric, ADD COLUMN deductions_gross numeric, ADD COLUMN offset_amount numeric, ADD COLUMN invoice_id uuid, ADD COLUMN notes text, ADD COLUMN settled_by uuid, ADD COLUMN settled_by_name text;
    ALTER TABLE deposit_settlements ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ALTER TABLE staff_profiles ADD COLUMN first_name text, ADD COLUMN last_name text;
    CREATE TABLE auth.users(id uuid PRIMARY KEY,email text);
    CREATE TABLE b2b_return_protocols(id uuid PRIMARY KEY,rental_inquiry_id uuid);
    CREATE TABLE b2b_return_extra_charges(return_protocol_id uuid,billed boolean);
    CREATE TABLE b2b_protocol_damages(return_protocol_id uuid,billed boolean);
    GRANT USAGE ON SCHEMA auth TO authenticated,service_role;
  `);
  await db.exec(readFileSync("drizzle/migrations/0120_cash_journal.sql","utf8"));
  await db.exec(readFileSync("drizzle/migrations/0121_migration.sql","utf8"));
  const settlementSql = readFileSync("drizzle/migrations/0198_deposit_settlement_recognize_prior_stripe_refund.sql","utf8");
  // Only the real function definition; no historic production-data backfill in this fixture.
  await db.exec("DROP FUNCTION settle_deposit(uuid,jsonb,text,numeric,uuid,date,text)");
  await db.exec(settlementSql.slice(0,settlementSql.indexOf("UPDATE public.deposit_settlements s SET")));
  await db.exec(`
    ALTER TABLE deposit_settlements ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Staff can read deposit settlements" ON deposit_settlements FOR SELECT TO authenticated USING(is_staff_member(auth.uid()));
    ALTER TABLE deposit_refunds ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Staff can read deposit refunds" ON deposit_refunds FOR SELECT TO authenticated USING(is_staff_member(auth.uid()));
    ALTER TABLE credit_note_refunds ENABLE ROW LEVEL SECURITY;
    CREATE POLICY staff_read_credit_refunds ON credit_note_refunds FOR SELECT TO authenticated USING(is_staff_member(auth.uid()));
    GRANT SELECT ON deposit_settlements,deposit_refunds,credit_note_refunds TO authenticated;
  `);
  // Reproduce 1B.2 with real journal triggers before installing the reviewed replacement.
  const baseline = await order([{amount:150,label:"Bar",date:day}],"krefeld");
  const req = await reserve(baseline,4000,"cash");
  await confirm(req,"Beleg ALT",day);
  baselineJournal = (await db.query<{amount:string}>("SELECT amount::text FROM cash_journal WHERE order_code=$1",[baseline.slice(0,6)])).rows;
  baselineRequest = req;
  oldCashOrder = await order([{amount:150,label:"Bar",date:day}]);
  oldCashRequest = await reserve(oldCashOrder,4000,"cash");
  try { await db.transaction(tx=>tx.exec(readFileSync("drizzle/prepared/0213_finance_location_scope_and_manual_cancel_refund.sql","utf8"))); }
  catch(error) { originalRepeatError = error instanceof Error ? error.message : String(error); }
  // Exercise the unpatched real guard, not only the already-patched branch.
  await db.exec(originalGuard);
  await db.transaction(tx => tx.exec(reviewed));
},60000);

afterAll(() => db.close());
async function order(payments: unknown[], location = "krefeld") {
  const id=crypto.randomUUID();
  await db.query("INSERT INTO rental_inquiries(id,location,payments,offer_payload,offer_total_gross,cancelled_at,cancellation_payload,order_code) VALUES($1,$2,$3,$4,50,now(),$5,$6)",[id,location,JSON.stringify(payments),JSON.stringify({deposit:100,totals:{grossAmount:50}}),JSON.stringify({totals:{grossAmount:50}}),id.slice(0,6)]);
  return id;
}
async function reserve(inq:string,cents:number,method="transfer",actor=KREFELD) {
  const id=crypto.randomUUID();
  await db.query("SELECT reserve_order_refund($1,$2,$3,$4,0,$5,'[]'::jsonb)",[id,inq,actor,cents,method]);
  return id;
}
const confirm=(id:string,ref:string|null,paid:string|null,actor=KREFELD)=>db.query("SELECT confirm_manual_order_refund($1,$2,$3,$4::date)",[id,actor,ref,paid]);
const row=async(id:string)=>(await db.query<{status:string;paid_out_on:string|null}>("SELECT status,paid_out_on::text FROM order_refund_requests WHERE id=$1",[id])).rows[0];
const service=()=>db.exec("RESET ROLE; SELECT set_config('test.role','service_role',false),set_config('test.uid','',false)");
const bank=()=>order([{amount:150,label:"Überweisung",date:day}]);

it("reproduces original 1B.2 missing cash-journal payout and preserves the old financial evidence",async()=>{
  expect(baselineJournal).toEqual([{amount:"150.00"}]);
  expect(originalRepeatError).toContain("guard: Ankerstelle nicht gefunden");
  expect(await row(baselineRequest)).toEqual({status:"succeeded",paid_out_on:day});
});
it("reviewed artifact is repeatable with real settlement definition, rows and all policies intact",async()=>{
  const before=(await db.query<{d:string}>("SELECT pg_get_functiondef('settle_deposit(uuid,jsonb,text,numeric,uuid,date,text)'::regprocedure) d")).rows[0].d;
  await db.transaction(tx=>tx.exec(reviewed));
  const after=(await db.query<{d:string}>("SELECT pg_get_functiondef('settle_deposit(uuid,jsonb,text,numeric,uuid,date,text)'::regprocedure) d")).rows[0].d;
  expect(after).toBe(before);
  expect(after.split("public.can_manage_rental_finance(_uid,_inq.location)")).toHaveLength(2);
  expect(await row(baselineRequest)).toEqual({status:"succeeded",paid_out_on:day});
});
it("cash cancellation fails closed even with an existing cash voucher; no duplicate journal or successful status",async()=>{
  const inq=oldCashOrder, id=oldCashRequest;
  await expect(reserve(await order([{amount:150,label:"Bar",date:day}]),1000,"cash")).rejects.toThrow("Kassenperiodenfreigabe");
  await db.query("INSERT INTO cash_journal(source_table,source_id,kind,amount,payment_date,reference,order_code,cash_register) VALUES('rental_inquiries',$1,'deposit_payout',-40,$2,'ALREADY-PAID',$3,'krefeld')",[inq,day,inq.slice(0,6)]);
  await expect(confirm(id,"ALREADY-PAID",day)).rejects.toThrow("Kassenperiodenfreigabe");
  expect((await row(id)).status).toBe("creating");
  expect((await db.query("SELECT * FROM cash_journal WHERE source_id=$1",[inq])).rows).toHaveLength(2);
});
it("bank partial and full refund, multiple receipts, queued retries and original-payment cap; no cash booking",async()=>{
  const inq=await order([{amount:75,label:"Überweisung",date:day},{amount:75,label:"Bank",date:day}]);
  const id=await reserve(inq,4000);
  await Promise.all([confirm(id,"SEPA-40",day),confirm(id,"SEPA-40",day)]);
  expect(await row(id)).toEqual({status:"succeeded",paid_out_on:day});
  expect((await db.query("SELECT * FROM rental_inquiry_events WHERE rental_inquiry_id=$1 AND event='refund_completed'",[inq])).rows).toHaveLength(1);
  await expect(confirm(id,"DIFFERENT",day)).rejects.toThrow("anderem");
  await expect(reserve(inq,6001)).rejects.toThrow();
  const rest=await reserve(inq,6000); await confirm(rest,"SEPA-60",day);
  await expect(reserve(inq,1)).rejects.toThrow();
  expect((await db.query("SELECT * FROM cash_journal WHERE order_code=$1",[inq.slice(0,6)])).rows).toHaveLength(0);
});
it("date/reference validation and legacy direct RPC cannot bypass recorded evidence",async()=>{
  const id=await reserve(await bank(),1000);
  for(const [ref,date] of [[null,day],["",day],["AB",day],["A".repeat(201),day],["SEPA",null],["SEPA","2999-01-01"],["SEPA","2000-01-01"]]) await expect(confirm(id,ref,date)).rejects.toThrow();
  await expect(db.query("SELECT confirm_order_refund_manual($1,$2,'OLD')",[id,KREFELD])).rejects.toThrow("Alter Bestätigungsweg gesperrt");
  expect((await row(id)).status).toBe("creating");
});
it("audit persistence failure rolls back completion atomically; retry retains one evidence",async()=>{
  const id=await reserve(await bank(),1000);
  await db.exec("CREATE FUNCTION fail_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'isolated audit failure'; END $$; CREATE TRIGGER fail_audit BEFORE INSERT ON rental_inquiry_events FOR EACH ROW EXECUTE FUNCTION fail_audit()");
  await expect(confirm(id,"SEPA-10",day)).rejects.toThrow("isolated audit failure");
  expect(await row(id)).toEqual({status:"creating",paid_out_on:null});
  await db.exec("DROP TRIGGER fail_audit ON rental_inquiry_events");
  await confirm(id,"SEPA-10",day); expect((await row(id)).status).toBe("succeeded");
});
it("authority revoked or order moved before confirmation denies the old actor; admin retains cross-location",async()=>{
  const inq=await bank(),id=await reserve(inq,1000);
  await db.query("UPDATE rental_inquiries SET location='bonn' WHERE id=$1",[inq]);
  await expect(confirm(id,"SEPA",day)).rejects.toThrow("Standortberechtigung");
  await db.query("UPDATE staff_profiles SET is_active=false WHERE user_id=$1",[BONN]);
  await expect(confirm(id,"SEPA",day,BONN)).rejects.toThrow("Standortberechtigung");
  await db.query("UPDATE staff_profiles SET is_active=true WHERE user_id=$1",[BONN]);
  await confirm(id,"SEPA",day,ADMIN); expect((await row(id)).status).toBe("succeeded");
});
it("changed original-payment method and duplicate paid settlement block confirmation",async()=>{
  const inq=await bank(),id=await reserve(inq,1000);
  await db.query("UPDATE rental_inquiries SET payments=$2 WHERE id=$1",[inq,JSON.stringify([{amount:150,label:"Bar",date:day}])]);
  await expect(confirm(id,"SEPA",day)).rejects.toThrow("ursprüngliche Zahlungsart");
  await db.query("UPDATE rental_inquiries SET payments=$2 WHERE id=$1",[inq,JSON.stringify([{amount:150,label:"Überweisung",date:day}])]);
  await db.query("INSERT INTO deposit_settlements(id,rental_inquiry_id,balance,payout_status,payout_method) VALUES($1,$2,100,'paid','transfer')",[crypto.randomUUID(),inq]);
  await expect(confirm(id,"SEPA",day)).rejects.toThrow("anderweitig erstattet");
  expect((await row(id)).status).toBe("creating");
});
it("real normal cash settlement posts exactly once with existing register/date/DATEV mapping; Bank/Stripe never cash",async()=>{
  await db.exec(`SELECT set_config('test.uid','${KREFELD}',false)`);
  const inq=await order([{amount:150,label:"Bar",date:day}]);
  await db.query("SELECT settle_deposit($1,'[]'::jsonb,'cash',100)",[inq]);
  await expect(db.query("SELECT settle_deposit($1,'[]'::jsonb,'cash',100)",[inq])).rejects.toThrow("bereits abgerechnet");
  const entries=(await db.query<{amount:string;payment_date:string;order_code:string;cash_register:string;source_id:string}>("SELECT amount::text,payment_date::text,order_code,cash_register,source_id FROM cash_journal WHERE order_code=$1 ORDER BY amount DESC",[inq.slice(0,6)])).rows;
  expect(entries.map(e=>e.amount)).toEqual(["150.00","-100.00"]); expect(entries.every(e=>e.cash_register==="krefeld"&&e.payment_date===day)).toBe(true);
  const csv=buildDatevCashCsv(entries.map(e=>({amount:Number(e.amount),paymentDate:e.payment_date,orderCode:e.order_code,register:e.cash_register})));
  const lines=csv.trim().split("\r\n"); expect(lines[2].split(";")[1]).toBe("-100,00"); expect(lines[2].split(";")[8]).toBe(inq.slice(0,6));
  await expect(db.query("UPDATE cash_journal SET amount=0 WHERE source_id=$1",[entries[1].source_id])).rejects.toThrow("unveränderlich");
  await expect(db.query("DELETE FROM cash_journal WHERE source_id=$1",[entries[1].source_id])).rejects.toThrow("unveränderlich");
  for(const method of ["transfer","stripe"]) {const other=await bank(); await db.query("SELECT settle_deposit($1,'[]'::jsonb,$2,100)",[other,method]); expect((await db.query("SELECT * FROM cash_journal WHERE order_code=$1",[other.slice(0,6)])).rows).toHaveLength(0);}
  await service();
});
it("actual authenticated SELECT RLS separates Bonn/Krefeld/Mülheim; multiple profiles and revoked rights",async()=>{
  const a=await bank(),b=await order([{amount:150,label:"Überweisung"}],"bonn"),m=await order([{amount:150,label:"Überweisung"}],"muelheim");
  const sids=[crypto.randomUUID(),crypto.randomUUID(),crypto.randomUUID()];
  for(const [idx,inq] of [a,b,m].entries()) await db.query("INSERT INTO deposit_settlements(id,rental_inquiry_id,balance,payout_method,payout_status) VALUES($1,$2,100,'transfer','pending')",[sids[idx],inq]);
  await db.exec(`SELECT set_config('test.role','authenticated',false),set_config('test.uid','${KREFELD}',false); SET ROLE authenticated`);
  expect((await db.query("SELECT id FROM deposit_settlements WHERE id=ANY($1::uuid[])",[sids])).rows).toEqual([{id:sids[0]}]);
  await expect(confirm(crypto.randomUUID(),"BAD",day)).rejects.toThrow("permission denied");
  await service(); await db.query("INSERT INTO staff_profiles(user_id,is_active,location) VALUES($1,true,'bonn')",[KREFELD]);
  await db.exec(`SELECT set_config('test.uid','${KREFELD}',false); SET ROLE authenticated`);
  expect((await db.query("SELECT id FROM deposit_settlements WHERE id=ANY($1::uuid[]) ORDER BY id",[sids])).rows).toHaveLength(2);
  await service(); await db.query("DELETE FROM user_roles WHERE user_id=$1",[KREFELD]);
  await db.exec(`SELECT set_config('test.uid','${KREFELD}',false); SET ROLE authenticated`);
  expect((await db.query("SELECT id FROM deposit_settlements WHERE id=ANY($1::uuid[])",[sids])).rows).toHaveLength(0);
  await service(); await db.query("INSERT INTO user_roles VALUES($1,'standort_mitarbeiter')",[KREFELD]);
  await db.exec(`SELECT set_config('test.uid','${ADMIN}',false); SET ROLE authenticated`);
  expect((await db.query("SELECT id FROM deposit_settlements WHERE id=ANY($1::uuid[])",[sids])).rows).toHaveLength(3);
  await service();
});
it("journal failure rolls back real cash settlement and its audit, preserving the received payment",async()=>{
  await db.exec(`SELECT set_config('test.uid','${KREFELD}',false)`);
  const inq=await order([{amount:150,label:"Bar",date:day}]);
  await db.exec("CREATE FUNCTION fail_journal() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'isolated journal failure'; END $$; CREATE TRIGGER fail_journal BEFORE INSERT ON cash_journal FOR EACH ROW EXECUTE FUNCTION fail_journal()");
  await expect(db.query("SELECT settle_deposit($1,'[]'::jsonb,'cash',100)",[inq])).rejects.toThrow("isolated journal failure");
  expect((await db.query("SELECT * FROM deposit_settlements WHERE rental_inquiry_id=$1",[inq])).rows).toHaveLength(0);
  expect((await db.query("SELECT * FROM rental_inquiry_events WHERE rental_inquiry_id=$1 AND event='deposit_settled'",[inq])).rows).toHaveLength(0);
  expect((await db.query("SELECT * FROM cash_journal WHERE source_id=$1",[inq])).rows).toHaveLength(1);
  await db.exec("DROP TRIGGER fail_journal ON cash_journal");
  await service();
});
it("payment correction is an append-only counter-entry; invoice initial copied receipts never double-book cash",async()=>{
  const inq=await order([{amount:150,label:"Bar",date:day,reference:"ORIGINAL"}]);
  const inv=crypto.randomUUID();
  await db.query("INSERT INTO inquiry_invoices(id,rental_inquiry_id,location,invoice_number,payments) VALUES($1,$2,'krefeld','TEST-RE',$3)",[inv,inq,JSON.stringify([{amount:150,label:"Bar",date:day,reference:"ORIGINAL"}])]);
  expect((await db.query("SELECT * FROM cash_journal WHERE source_id=$1",[inv])).rows).toHaveLength(0);
  await db.query("UPDATE rental_inquiries SET payments='[]' WHERE id=$1",[inq]);
  const rows=(await db.query<{kind:string;amount:string;reference:string}>("SELECT kind,amount::text,reference FROM cash_journal WHERE source_id=$1 ORDER BY logged_at,amount DESC",[inq])).rows;
  expect(rows).toEqual([{kind:"payment",amount:"150.00",reference:"ORIGINAL"},{kind:"payment_removed",amount:"-150.00",reference:"ORIGINAL"}]);
});
it("existing register resolver combines only the cash register, not location permission",async()=>{
  const rows=(await db.query<{loc:string;reg:string|null}>("SELECT x loc,cash_register_for_location(x) reg FROM unnest(ARRAY['krefeld','bonn','Mülheim an der Ruhr','unknown']) x")).rows;
  expect(rows).toEqual([{loc:"krefeld",reg:"krefeld"},{loc:"bonn",reg:"bonn"},{loc:"Mülheim an der Ruhr",reg:"krefeld"},{loc:"unknown",reg:null}]);
  await db.exec(`SELECT set_config('test.uid','${BONN}',false)`);
  expect((await db.query<{v:boolean}>("SELECT can_manage_rental_finance(auth.uid(),'muelheim') v")).rows[0].v).toBe(false);
  await service();
});
it("legacy settlement completion cannot duplicate a confirmed combined deposit payout",async()=>{
  const inq=await bank(),sid=crypto.randomUUID();
  await db.query("INSERT INTO deposit_settlements(id,rental_inquiry_id,balance,payout_method,payout_status) VALUES($1,$2,100,'transfer','pending')",[sid,inq]);
  const id=await reserve(inq,10000); await confirm(id,"SEPA-100",day);
  await db.exec(`SELECT set_config('test.uid','${KREFELD}',false)`);
  await expect(db.query("SELECT mark_deposit_payout_done($1)",[sid])).rejects.toThrow("Gemeinsame Kautionserstattung");
  expect((await db.query<{v:string}>("SELECT payout_status v FROM deposit_settlements WHERE id=$1",[sid])).rows[0].v).toBe("pending");
  const other=await bank(),otherReq=await reserve(other,10000); await confirm(otherReq,"SEPA-OTHER",day);
  await expect(db.query("SELECT settle_deposit($1,'[]'::jsonb,'transfer',100)",[other])).rejects.toThrow("Gemeinsame Kautionserstattung");
  expect((await row(otherReq)).status).toBe("succeeded");
  await service();
});
it("safe rollback disables confirmations without deleting evidence; reinstall remains compatible",async()=>{
  const id=await reserve(await bank(),1000);
  await db.transaction(tx=>tx.exec(readFileSync("docs/prepared/0213_finance_safe_rollback.sql","utf8")));
  await expect(confirm(id,"SEPA",day)).rejects.toThrow("vorübergehend gesperrt");
  expect((await row(id)).status).toBe("creating");
  expect(await row(baselineRequest)).toEqual({status:"succeeded",paid_out_on:day});
  await db.transaction(tx=>tx.exec(reviewed));
  await confirm(id,"SEPA",day); expect((await row(id)).status).toBe("succeeded");
});
