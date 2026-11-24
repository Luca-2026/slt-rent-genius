import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, expect, it } from "vitest";
import type { RevenueReport } from "@/lib/revenueReport";

const db = new PGlite();
const admin = "10000000-0000-0000-0000-000000000001";
const ralf = "10000000-0000-0000-0000-000000000002";
const krefeld = "10000000-0000-0000-0000-000000000003";
const staff = "10000000-0000-0000-0000-000000000004";
const inactive = "10000000-0000-0000-0000-000000000005";
const superadmin = "10000000-0000-0000-0000-000000000006";
const source = "20000000-0000-0000-0000-000000000001";
const payload = (net: number, name = "Maschine") => ({ offer_number: "ANG-M-1", totals: { netAmount: net, grossAmount: Math.round(net * 119) / 100 }, items: [{ product_name: name, quantity: 1, unit_price: net }] });
beforeAll(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT coalesce(nullif(current_setting('request.jwt.claim.role',true),''),'service_role') $$;
    CREATE TABLE user_roles(user_id uuid,role text);
    CREATE FUNCTION has_role(p uuid,r text) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$ SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id=p AND role=r) $$;
    CREATE FUNCTION is_super_admin(p uuid) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$ SELECT has_role(p,'admin') OR has_role(p,'super_admin') $$;
    CREATE TABLE staff_profiles(user_id uuid,location text,is_active boolean);
    GRANT USAGE ON SCHEMA public,auth TO authenticated,anon,service_role;
    GRANT SELECT ON staff_profiles TO authenticated;
    CREATE TABLE b2b_managed_products(id uuid,slug text,name text,category text);
    CREATE TABLE new_machines(slug text,name text,category text);
    CREATE TABLE used_machines(slug text,manufacturer text,model text,category text);
    CREATE TABLE rental_inquiries(id uuid primary key,location text,offer_number text,offer_payload jsonb,original_accepted_offer jsonb,offer_accepted_at timestamptz,email_sent boolean,order_revision integer default 0,cancelled_at timestamptz,status text,order_code text,customer_name text,customer_kind text,offer_file_url text);
    CREATE TABLE sales_inquiries(LIKE rental_inquiries INCLUDING ALL);
    CREATE TABLE offer_acceptance_links(id uuid,inquiry_table text,inquiry_id uuid,offer_number text,gross_amount numeric,dispatched_at timestamptz,accepted_at timestamptz,created_at timestamptz default now());
    CREATE TABLE rental_order_revisions(id uuid,rental_inquiry_id uuid,version integer,snapshot jsonb,agreed_at timestamptz);
    CREATE TABLE sales_order_revisions(id uuid,sales_inquiry_id uuid,version integer,snapshot jsonb,agreed_at timestamptz);
    CREATE TABLE b2b_reservations(id uuid,inquiry_id uuid,location text,order_code text);
    CREATE TABLE b2b_offers(id uuid,reservation_id uuid,offer_number text,issuing_location text,net_amount numeric,delivery_cost numeric,email_sent boolean,email_sent_at timestamptz,accepted_at timestamptz,status text,file_url text);
    CREATE TABLE inquiry_invoices(id uuid primary key,invoice_number text,invoice_date date,status text,invoice_kind text,inquiry_type text,rental_inquiry_id uuid,sales_inquiry_id uuid,location text,net_amount numeric,file_url text,file_path text);
    CREATE TABLE b2b_invoices(id uuid primary key,invoice_number text,invoice_date date,status text,invoice_kind text,reservation_id uuid,source_offer_id uuid,net_amount numeric,file_url text);
    CREATE TABLE inquiry_invoice_items(id uuid,invoice_id uuid,product_name text,total_price numeric);
    CREATE TABLE b2b_invoice_items(LIKE inquiry_invoice_items);
    CREATE TABLE b2b_offer_items(id uuid,offer_id uuid,product_name text,total_price numeric);`);
  for (const file of ["0202_revenue_events_schema.sql", "0203_revenue_capture_events.sql", "0204_protected_revenue_reports.sql", "0205_revenue_document_access.sql", "0206_revenue_preserve_pdf_and_offer_deltas.sql", "0207_revenue_pdf_version_evidence.sql", "0208_revenue_ignore_unproven_breakdowns.sql"]) await db.exec(readFileSync(`drizzle/migrations/${file}`, "utf8"));
  await db.exec(`INSERT INTO inquiry_invoices(id,invoice_date,status,invoice_kind,inquiry_type,location,net_amount)
    VALUES('c0000000-0000-0000-0000-000000000001','2025-12-01','open','invoice','rental','muelheim',145);`);
  await db.exec(readFileSync("drizzle/migrations/0209_revenue_separate_reporting_locations.sql", "utf8"));
  await db.query("INSERT INTO user_roles VALUES($1,'admin'),($2,'niederlassungsleiter'),($3,'niederlassungsleiter'),($4,'standort_mitarbeiter'),($5,'niederlassungsleiter')", [admin, ralf, krefeld, staff, inactive]);
  await db.query("INSERT INTO user_roles VALUES($1,'super_admin')", [superadmin]);
  await db.query("INSERT INTO staff_profiles VALUES($1,'bonn',true),($2,'Mülheim an der Ruhr',true),($3,'bonn',true),($4,'bonn',false)", [ralf, krefeld, staff, inactive]);
  await db.query("INSERT INTO rental_inquiries(id,location,status,order_code,offer_number,offer_payload,email_sent) VALUES($1,'bonn','new','6ZHACN','ANG-M-1',$2,false)", [source, JSON.stringify(payload(100))]);
}, 30000);
afterAll(() => db.close());
async function identity(id: string | null, role = "authenticated") {
  await db.query("SELECT set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claim.role',$2,false)", [id ?? "", role]);
}
async function report(location = "all", stage = "invoiced", from = "2026-11-01", to = "2026-11-30", offset = 0) {
  return (await db.query<{ r: RevenueReport }>("SELECT get_revenue_report($1::date,$2::date,'all',$3,$4,'all','all',$5) r", [from, to, stage, location, offset])).rows[0]?.r;
}
it("unmailed offers and previews do not count; confirmed delivery counts once even after resend", async () => {
  await db.exec("RESET ROLE"); await identity(null, "service_role");
  expect((await db.query("SELECT * FROM revenue_events WHERE stage='offered'")).rows).toHaveLength(0);
  await db.query("INSERT INTO offer_acceptance_links VALUES($1,'rental_inquiries',$2,'ANG-M-1',119,NULL,NULL,'2026-11-23T23:30:00Z')", [source, source]);
  expect((await db.query("SELECT * FROM revenue_events WHERE stage='offered'")).rows).toHaveLength(0);
  await db.query("UPDATE offer_acceptance_links SET dispatched_at='2026-11-23T23:30:00Z' WHERE id=$1", [source]);
  await db.query("UPDATE offer_acceptance_links SET dispatched_at='2026-11-25T10:00:00Z' WHERE id=$1", [source]);
  const row = (await db.query<{ net: number; day: string }>("SELECT net_amount::float AS net,event_date::text AS \"day\" FROM revenue_events WHERE stage='offered'")).rows[0];
  expect(row).toEqual({ net: 100, day: "2026-11-24" });
});
it("authoritative link acceptance counts even before inquiry persistence and survives completion", async () => {
  await db.query("UPDATE offer_acceptance_links SET accepted_at='2026-11-24T10:00:00Z' WHERE id=$1", [source]);
  await db.query("UPDATE rental_inquiries SET status='done' WHERE id=$1", [source]);
  expect((await db.query<{ n: number }>("SELECT sum(net_amount)::float n FROM revenue_events WHERE stage='accepted'")).rows[0]?.n).toBe(100);
});
it("accepted amendments count only the difference at the agreed date", async () => {
  await db.query("INSERT INTO rental_order_revisions VALUES($1,$1,0,$2,'2026-11-24T10:00:00Z')", [source, JSON.stringify({ offer_payload: payload(100) })]);
  await db.query("INSERT INTO rental_order_revisions VALUES($1,$1,1,$2,'2026-11-25T10:00:00Z')", [source, JSON.stringify({ offer_payload: payload(160) })]);
  expect((await db.query<{ n: number }>("SELECT net_amount::float n FROM revenue_events WHERE event_kind='Änderung 1'")).rows[0]?.n).toBe(60);
  await identity(ralf);
  expect((await report("bonn", "accepted", "2026-11-24", "2026-11-24"))?.summary.accepted.net).toBe(100);
  expect((await report("bonn", "accepted", "2026-11-25", "2026-11-25"))?.summary.accepted.net).toBe(60);
});
it("invoice draft excluded; installment plus final plus credit do not duplicate revenue", async () => {
  await identity(null, "service_role");
  await db.exec(`INSERT INTO inquiry_invoices(id,invoice_number,invoice_date,status,invoice_kind,inquiry_type,location,net_amount) VALUES
    ('30000000-0000-0000-0000-000000000001','RE-M-1','2026-11-24','draft','invoice','rental','bonn',999),
    ('30000000-0000-0000-0000-000000000002','RE-M-2','2026-11-24','open','installment','rental','bonn',40),
    ('30000000-0000-0000-0000-000000000003','RE-M-3','2026-11-24','paid','final','rental','bonn',60),
    ('30000000-0000-0000-0000-000000000004','GS-M-1','2026-11-25','paid','credit_note','rental','bonn',-20),
    ('30000000-0000-0000-0000-000000000005','RE-V-1','2026-11-24','open','invoice','sales','krefeld',200);`);
  await db.exec("INSERT INTO inquiry_invoice_items VALUES('30000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','Kaution',150),('30000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000002','Miete',40)");
  await identity(ralf); const r = await report();
  expect(r?.summary.invoiced.net).toBe(80);
  expect(r?.entries).toHaveLength(3);
  expect(r?.by_article.some(x => x.label === "Kaution")).toBe(false);
  expect(r?.by_category.reduce((sum, x) => sum + x.revenue, 0)).toBe(80);
  expect(r?.trend.reduce((sum, x) => sum + x.net, 0)).toBe(80);
});
it("branch managers receive no other-branch totals, rows or categories", async () => {
  await identity(ralf); await db.exec("SET ROLE authenticated");
  expect((await report())?.summary.invoiced.net).toBe(80);
  expect((await report())?.entries.every(x => x.location === "bonn")).toBe(true);
  expect((await db.query<{ location: string }>("SELECT location FROM revenue_events")).rows.every(x => x.location === "bonn")).toBe(true);
  await expect(report("krefeld")).rejects.toMatchObject({ code: "42501" });
  await expect(db.query("SELECT get_revenue_document('inquiry_invoices:30000000-0000-0000-0000-000000000005:invoiced:invoice')")).rejects.toMatchObject({ code: "42501" });
  await db.exec("RESET ROLE");
});
it("admins see both branches while Krefeld managers consolidate Mülheim", async () => {
  await identity(admin); expect((await report())?.summary.invoiced.net).toBe(280);
  expect((await report())?.summary.invoiced.rental).toBe(80);
  expect((await report())?.summary.invoiced.sales).toBe(200);
  await identity(krefeld); expect((await report())?.summary.invoiced.net).toBe(200);
});
it.each([staff, inactive, null])("blocks unauthorized identity %s", async id => {
  await identity(id); await expect(report()).rejects.toMatchObject({ code: "42501" });
});
it("authenticated callers cannot write fabricated events or call privileged capture helpers", async () => {
  await identity(ralf); await db.exec("SET ROLE authenticated");
  await expect(db.exec("INSERT INTO revenue_events(id) VALUES('fake')")).rejects.toMatchObject({ code: "42501" });
  await expect(db.query("SELECT capture_inquiry_revenue('{}','rental_inquiries',true)")).rejects.toMatchObject({ code: "42501" });
  await db.exec("RESET ROLE");
});
it("pagination never truncates totals beyond the 1000-row API default", async () => {
  await identity(null, "service_role");
  await db.exec(`INSERT INTO revenue_events(id,source_table,source_id,stage,business,event_date,location,segment,event_kind,net_amount,lines)
    SELECT 'bulk-'||g,'inquiry_invoices','30000000-0000-0000-0000-000000000002','invoiced','rental','2026-10-01','bonn','private','invoice',1,'[{"name":"Miete","category":"Ohne Kategorie","net":1}]' FROM generate_series(1,1005) g;`);
  await identity(ralf); const r = await report("all", "invoiced", "2026-10-01", "2026-10-01", 1000);
  expect(r?.summary.invoiced.net).toBe(1005); expect(r?.entries).toHaveLength(5); expect(r?.total_count).toBe(1005);
});
it("storno keeps historical accepted volume and subtracts only on cancellation date", async () => {
  await identity(null, "service_role"); await db.query("UPDATE rental_inquiries SET cancelled_at='2026-11-26T10:00:00Z' WHERE id=$1", [source]);
  await identity(ralf); expect((await report("all", "accepted", "2026-11-24", "2026-11-24"))?.summary.accepted.net).toBe(100);
  expect((await report("all", "accepted", "2026-11-26", "2026-11-26"))?.summary.accepted.net).toBe(-160);
});
it("new inquiry offer revisions count the delta, not another full quote, and freeze the PDF", async () => {
  await identity(null, "service_role");
  const id = "40000000-0000-0000-0000-000000000001";
  await db.query("INSERT INTO rental_inquiries(id,location,offer_number,offer_payload,email_sent,offer_file_url) VALUES($1,'bonn','ANG-R1',$2,false,'original.pdf')", [id, JSON.stringify({ ...payload(100), offer_number: "ANG-R1" })]);
  await db.query("INSERT INTO offer_acceptance_links(id,inquiry_table,inquiry_id,offer_number,gross_amount,dispatched_at,created_at) VALUES($1,'rental_inquiries',$1,'ANG-R1',119,'2026-09-01','2026-09-01')", [id]);
  await db.query("UPDATE rental_inquiries SET offer_number='ANG-R2',offer_payload=$2,offer_file_url='revised.pdf' WHERE id=$1", [id, JSON.stringify({ ...payload(150), offer_number: "ANG-R2" })]);
  await db.query("INSERT INTO offer_acceptance_links(id,inquiry_table,inquiry_id,offer_number,gross_amount,dispatched_at,created_at) VALUES('40000000-0000-0000-0000-000000000002','rental_inquiries',$1,'ANG-R2',178.5,'2026-09-02','2026-09-02')", [id]);
  const events = (await db.query<{ net: number; url: string }>("SELECT net_amount::float AS net,document_url AS url FROM revenue_events WHERE source_id=$1 ORDER BY event_date", [id])).rows;
  expect(events).toEqual([{ net: 100, url: "original.pdf" }, { net: 50, url: "revised.pdf" }]);
  await identity(ralf);
  expect((await db.query<{ doc: { url: string } }>("SELECT get_revenue_document($1) doc", [`rental_inquiries:${id}:offered:Versand ANG-R1`])).rows[0]?.doc.url).toBe("original.pdf");
});
it("portal quote edits count deltas while unchanged resends count once", async () => {
  await identity(null, "service_role");
  const id = "50000000-0000-0000-0000-000000000001";
  await db.query("INSERT INTO b2b_offers(id,offer_number,issuing_location,net_amount,email_sent,email_sent_at) VALUES($1,'ANG-B1','bonn',200,true,'2026-08-01')", [id]);
  await db.query("UPDATE b2b_offers SET email_sent_at='2026-08-02' WHERE id=$1", [id]);
  await db.query("UPDATE b2b_offers SET net_amount=250,email_sent_at='2026-08-03' WHERE id=$1", [id]);
  expect((await db.query<{ net: number }>("SELECT net_amount::float AS net FROM revenue_events WHERE source_id=$1 ORDER BY event_date", [id])).rows).toEqual([{ net: 200 }, { net: 50 }]);
});
it("sales acceptance and later amendment stay in sales rather than rental", async () => {
  await identity(null, "service_role");
  const id = "60000000-0000-0000-0000-000000000001";
  await db.query("INSERT INTO sales_inquiries(id,location,offer_number,offer_payload,offer_accepted_at) VALUES($1,'krefeld','ANG-V1',$2,'2026-07-01')", [id, JSON.stringify(payload(500))]);
  await db.query("INSERT INTO sales_order_revisions VALUES($1,$1,0,$2,'2026-07-01')", [id, JSON.stringify({ offer_payload: payload(500) })]);
  await db.query("INSERT INTO sales_order_revisions VALUES($1,$1,1,$2,'2026-07-02')", [id, JSON.stringify({ offer_payload: payload(450) })]);
  const events = (await db.query<{ net: number; business: string }>("SELECT net_amount::float AS net,business FROM revenue_events WHERE source_id=$1 ORDER BY event_date", [id])).rows;
  expect(events).toEqual([{ net: 500, business: "sales" }, { net: -50, business: "sales" }]);
});
it("undocumented old offer values remain unknown and cannot be reconstructed with 19 percent VAT", async () => {
  await identity(null, "service_role");
  const id = "70000000-0000-0000-0000-000000000001";
  await db.query("INSERT INTO rental_inquiries(id,location,offer_number,offer_payload,offer_file_url) VALUES($1,'bonn','ANG-new',$2,'new.pdf')", [id, JSON.stringify(payload(500))]);
  await db.query("INSERT INTO offer_acceptance_links(id,inquiry_table,inquiry_id,offer_number,gross_amount,dispatched_at) VALUES($1,'rental_inquiries',$1,'ANG-old',119,'2026-06-01')", [id]);
  const event = (await db.query<{ net_amount: number | null; warning: string; document_url: string | null; lines: unknown[] }>("SELECT net_amount,warning,document_url,lines FROM revenue_events WHERE source_id=$1", [id])).rows[0];
  expect(event?.net_amount).toBeNull();
  expect(event?.warning).toContain("Nettobetrag nicht eindeutig belegt");
  expect(event?.document_url).toBeNull();
  expect(event?.lines).toEqual([]);
});
it("acceptance after an amendment retains the original accepted number and PDF", async () => {
  await identity(null, "service_role");
  const id = "80000000-0000-0000-0000-000000000001";
  await db.query("INSERT INTO rental_inquiries(id,location,offer_number,offer_payload,offer_file_url,original_accepted_offer,order_revision) VALUES($1,'bonn','ANG-later',$2,'later.pdf',$3,1)", [id, JSON.stringify(payload(160)), JSON.stringify({ offer_number: "ANG-original", offer_file_url: "accepted-original.pdf", offer_payload: { totals: { netAmount: 100, grossAmount: 119 }, items: [] } })]);
  await db.query("INSERT INTO offer_acceptance_links(id,inquiry_table,inquiry_id,offer_number,gross_amount,accepted_at) VALUES($1,'rental_inquiries',$1,'ANG-original',119,'2026-05-01')", [id]);
  expect((await db.query<{ document_number: string; document_url: string; net: number }>("SELECT document_number,document_url,net_amount::float AS net FROM revenue_events WHERE source_id=$1", [id])).rows).toEqual([{ document_number: "ANG-original", document_url: "accepted-original.pdf", net: 100 }]);
});
it("legacy breakdowns without a proven net amount cannot distort category totals", async () => {
  await identity(null, "service_role");
  await db.exec(`INSERT INTO revenue_events(id,source_table,source_id,stage,business,event_date,location,segment,event_kind,net_amount,lines)
    VALUES('unknown-breakdown','rental_inquiries','70000000-0000-0000-0000-000000000001','offered','rental','2026-04-01','bonn','private','Versand unknown',NULL,'[{"name":"Unproven","category":"Unknown category","net":-100}]'),
    ('known-breakdown','rental_inquiries','70000000-0000-0000-0000-000000000001','offered','rental','2026-04-01','bonn','private','Versand known',100,'[{"name":"Known","category":"Known category","net":100}]');`);
  await identity(ralf);
  const r = await report("all", "offered", "2026-04-01", "2026-04-01");
  expect(r?.summary.offered.net).toBe(100);
  expect(r?.summary.offered.unknown).toBe(1);
  expect(r?.by_category.reduce((sum, item) => sum + item.revenue, 0)).toBe(100);
  expect(r?.by_article.some(item => item.label === "Unproven")).toBe(false);
  expect(r?.categories).toEqual(["Known category"]);
  const filtered = (await db.query<{ r: RevenueReport }>("SELECT get_revenue_report('2026-04-01','2026-04-01','all','offered','all','all','Unknown category',0) AS r")).rows[0]?.r;
  expect(filtered?.entries[0]?.net_amount).toBeNull();
});
it("cancelled originals and their credits retain both documentary PDFs without a double revenue deduction", async () => {
  await identity(null, "service_role");
  await db.exec(`INSERT INTO inquiry_invoices(id,invoice_number,invoice_date,status,invoice_kind,inquiry_type,location,net_amount,file_url)
    VALUES('90000000-0000-0000-0000-000000000001','RE-original','2026-03-01','cancelled','invoice','rental','bonn',100,'original-invoice.pdf'),
    ('90000000-0000-0000-0000-000000000002','GS-original','2026-03-02','paid','credit_note','rental','bonn',-100,'original-credit.pdf');`);
  await identity(ralf);
  const r = await report("all", "invoiced", "2026-03-01", "2026-03-31");
  expect(r?.summary.invoiced.net).toBe(0);
  expect(r?.total_count).toBe(2);
  expect((await db.query<{ doc: { url: string } }>("SELECT get_revenue_document('inquiry_invoices:90000000-0000-0000-0000-000000000001:invoiced:invoice') doc")).rows[0]?.doc.url).toBe("original-invoice.pdf");
});
it("Krefeld and Mülheim revenue remain individually filterable without changing the organizational total", async () => {
  await identity(null, "service_role");
  await db.exec(`INSERT INTO inquiry_invoices(id,invoice_date,status,invoice_kind,inquiry_type,location,net_amount) VALUES
    ('a0000000-0000-0000-0000-000000000001','2026-02-01','open','invoice','rental','krefeld',200),
    ('a0000000-0000-0000-0000-000000000002','2026-02-01','open','invoice','rental','Mülheim an der Ruhr',145),
    ('a0000000-0000-0000-0000-000000000003','2026-02-01','open','invoice','rental','bonn',300);`);
  await identity(admin);
  expect((await report("krefeld", "invoiced", "2026-02-01", "2026-02-01"))?.summary.invoiced.net).toBe(200);
  const m = await report("muelheim", "invoiced", "2026-02-01", "2026-02-01");
  expect(m?.summary.invoiced.net).toBe(145);
  expect(m?.entries.map(e => e.location)).toEqual(["muelheim"]);
  expect((await report("all", "invoiced", "2026-02-01", "2026-02-01"))?.by_location.map(b => b.key).sort()).toEqual(["bonn", "krefeld", "muelheim"]);
  await identity(krefeld);
  expect((await report("all", "invoiced", "2026-02-01", "2026-02-01"))?.summary.invoiced.net).toBe(345);
});
it("Ralf sees only Bonn and cannot request either Krefeld or Mülheim", async () => {
  await identity(ralf); await db.exec("SET ROLE authenticated");
  expect((await report("all", "invoiced", "2026-02-01", "2026-02-01"))?.summary.invoiced.net).toBe(300);
  await expect(report("muelheim")).rejects.toMatchObject({ code: "42501" });
  await expect(report("krefeld")).rejects.toMatchObject({ code: "42501" });
  const visible = (await db.query<{ location: string; reporting_location: string | null }>("SELECT location,reporting_location FROM revenue_events")).rows;
  expect(visible.every(e => e.location === "bonn" && (e.reporting_location === "bonn" || e.reporting_location === null))).toBe(true);
  await db.exec("RESET ROLE");
});
it("superadmins without a separate admin role can evaluate Ralf's Bonn and every site", async () => {
  await identity(superadmin); await db.exec("SET ROLE authenticated");
  expect((await report("bonn", "invoiced", "2026-02-01", "2026-02-01"))?.summary.invoiced.net).toBe(300);
  expect((await report("muelheim", "invoiced", "2026-02-01", "2026-02-01"))?.summary.invoiced.net).toBe(145);
  expect((await report("krefeld", "invoiced", "2026-02-01", "2026-02-01"))?.summary.invoiced.net).toBe(200);
  expect((await db.query<{ n: number }>("SELECT count(*)::int n FROM revenue_events WHERE reporting_location='muelheim' AND event_date='2026-02-01'")).rows[0]?.n).toBe(1);
  await db.exec("RESET ROLE");
});
it("Mülheim sent and accepted offers retain their separate site when captured", async () => {
  await identity(null, "service_role");
  const id = "b0000000-0000-0000-0000-000000000001";
  await db.query("INSERT INTO rental_inquiries(id,location,offer_number,offer_payload) VALUES($1,'Mülheim','ANG-MH',$2)", [id, JSON.stringify({ ...payload(120), offer_number: "ANG-MH" })]);
  await db.query("INSERT INTO offer_acceptance_links(id,inquiry_table,inquiry_id,offer_number,gross_amount,dispatched_at,accepted_at) VALUES($1,'rental_inquiries',$1,'ANG-MH',142.8,'2026-01-02','2026-01-03')", [id]);
  await identity(admin);
  const r = await report("muelheim", "offered", "2026-01-01", "2026-01-31");
  expect(r?.summary.offered.net).toBe(120);
  expect(r?.summary.accepted.net).toBe(120);
  expect(r?.entries[0]?.location).toBe("muelheim");
  expect((await report("krefeld", "offered", "2026-01-01", "2026-01-31"))?.total_count).toBe(0);
});
it("existing Mülheim invoices gain a separate site without changing their amount or organizational scope", async () => {
  await identity(admin);
  const row = (await db.query<{ location: string; reporting_location: string; net: number }>("SELECT location,reporting_location,net_amount::float net FROM revenue_events WHERE source_id='c0000000-0000-0000-0000-000000000001'")).rows[0];
  expect(row).toEqual({ location: "krefeld", reporting_location: "muelheim", net: 145 });
  expect((await report("muelheim", "invoiced", "2025-12-01", "2025-12-01"))?.summary.invoiced.net).toBe(145);
});