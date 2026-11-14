import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const db = new PGlite();
const first = readFileSync("drizzle/migrations/0186_rental_order_cancellation_workflow.sql", "utf8");
const next = readFileSync("drizzle/migrations/0187_rental_cancellation_atomic_guards.sql", "utf8");
const corrected = readFileSync("drizzle/migrations/0188_cancellation_sign_task_completion_guard.sql", "utf8");
beforeAll(async () => {
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE SCHEMA auth;
    CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$SELECT 'service_role'::text$$;
    CREATE FUNCTION public.can_edit_operations(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT true$$;
    CREATE FUNCTION public.has_role(uuid,text) RETURNS boolean LANGUAGE sql AS $$SELECT true$$;
    CREATE FUNCTION public.slt_stock_location(text) RETURNS text LANGUAGE sql AS $$SELECT $1$$;
    CREATE TABLE rental_inquiries(id uuid primary key, updated_at timestamptz, status text, location text, b2b_reservation_id uuid, installment_enabled boolean);
    CREATE TABLE sign_bookings(id uuid primary key,inquiry_id uuid,status text);
    CREATE TABLE staff_profiles(user_id uuid,is_active boolean,location text);
    CREATE TABLE inquiry_invoices(id uuid primary key,rental_inquiry_id uuid,status text,invoice_kind text,gross_amount numeric);
    CREATE TABLE b2b_delivery_notes(rental_inquiry_id uuid,reservation_id uuid,status text);
    CREATE TABLE b2b_transport_orders(rental_inquiry_id uuid,status text);
    CREATE TABLE b2b_managed_products(id uuid primary key,slug text);
    CREATE TABLE b2b_instance_allocations(rental_inquiry_id uuid,managed_product_id uuid);
    CREATE TABLE staff_todo_lists(id uuid primary key,sign_booking_id uuid,status text,completed_at timestamptz);
    CREATE TABLE staff_todo_items(list_id uuid,sign_step text,is_done boolean);
    CREATE TABLE b2b_reservations(id uuid,inquiry_id uuid,status text);
    CREATE TABLE offer_payment_links(inquiry_id uuid,inquiry_table text,status text,updated_at timestamptz);
    CREATE TABLE offer_acceptance_links(inquiry_id uuid,inquiry_table text,status text);
    CREATE TABLE rental_inquiry_events(rental_inquiry_id uuid,event text,details jsonb,user_id uuid);
    ${first} ${next} ${corrected}
  `);
}, 30000);
afterAll(async () => db.close());
const actor = "61389d69-7188-4834-b74b-44b9051046f8";
const stamp = "2026-11-14T12:00:00Z";
const snapshot = { reason: "Individuell vereinbart", invoice_items: [], totals: { grossAmount: 70 } };
const confirm = (id: string, expected = stamp) => db.query("SELECT confirm_rental_cancellation($1,$2,$3,$4)", [id, actor, expected, JSON.stringify(snapshot)]);
describe("Atomarer Stornoabschluss", () => {
  it("speichert Storno, sperrt Links, gibt Belegung frei und protokolliert den tatsächlichen Mitarbeiter", async () => {
    const id = "10000000-0000-4000-8000-000000000001";
    await db.exec(`INSERT INTO rental_inquiries VALUES('${id}','${stamp}','accepted','bonn',null,true,null,null); INSERT INTO b2b_instance_allocations VALUES('${id}',null); INSERT INTO offer_payment_links VALUES('${id}','rental_inquiries','active',now()); INSERT INTO offer_acceptance_links VALUES('${id}','rental_inquiries','active');`);
    await confirm(id);
    expect((await db.query<{ status: string }>("SELECT status FROM rental_inquiries WHERE id=$1", [id])).rows[0]?.status).toBe("cancelled");
    expect((await db.query("SELECT * FROM b2b_instance_allocations WHERE rental_inquiry_id=$1", [id])).rows).toHaveLength(0);
    expect((await db.query<{ status: string }>("SELECT status FROM offer_payment_links WHERE inquiry_id=$1", [id])).rows[0]?.status).toBe("superseded");
    expect((await db.query<{ user_id: string }>("SELECT user_id FROM rental_inquiry_events WHERE rental_inquiry_id=$1", [id])).rows[0]?.user_id).toBe(actor);
    await confirm(id);
    expect((await db.query("SELECT * FROM rental_inquiry_events WHERE rental_inquiry_id=$1", [id])).rows).toHaveLength(1);
    await expect(db.exec(`UPDATE rental_inquiries SET status='accepted' WHERE id='${id}'`)).rejects.toThrow("unveränderlich");
    await expect(db.exec(`INSERT INTO inquiry_invoices VALUES('20000000-0000-4000-8000-000000000001','${id}','draft','invoice',71)`)).rejects.toThrow("entspricht nicht");
  });
  it("weist veraltete Daten einmal zurück, ohne einen Storno zu speichern", async () => {
    const id = "10000000-0000-4000-8000-000000000002";
    await db.exec(`INSERT INTO rental_inquiries VALUES('${id}','${stamp}','accepted','bonn',null,true,null,null)`);
    await expect(confirm(id,"2026-11-13T12:00:00Z")).rejects.toThrow("neu laden");
    expect((await db.query<{ status: string }>("SELECT status FROM rental_inquiries WHERE id=$1",[id])).rows[0]?.status).toBe("accepted");
  });
  it("schließt bestehende Rechnungen von einer zweiten Stornoforderung aus", async () => {
    const id = "10000000-0000-4000-8000-000000000003";
    await db.exec(`INSERT INTO rental_inquiries VALUES('${id}','${stamp}','accepted','bonn',null,true,null,null); INSERT INTO inquiry_invoices VALUES('20000000-0000-4000-8000-000000000003','${id}','open','invoice',100)`);
    await expect(confirm(id)).rejects.toThrow("Korrekturabrechnung");
  });
  it("behält bereits ausgegebene Schilder in der Belegung", async () => {
    const id = "10000000-0000-4000-8000-000000000004";
    const sign = "30000000-0000-4000-8000-000000000004";
    const list = "40000000-0000-4000-8000-000000000004";
    await db.exec(`INSERT INTO rental_inquiries VALUES('${id}','${stamp}','accepted','bonn',null,true,null,null); INSERT INTO sign_bookings VALUES('${sign}','${id}','paid',null); INSERT INTO staff_todo_lists VALUES('${list}','${sign}','sent',null); INSERT INTO staff_todo_items VALUES('${list}','handover',true)`);
    await expect(confirm(id)).rejects.toThrow("ausgegebene Schilder");
    expect((await db.query<{ status: string }>("SELECT status FROM sign_bookings WHERE id=$1",[sign])).rows[0]?.status).toBe("paid");
  });
});