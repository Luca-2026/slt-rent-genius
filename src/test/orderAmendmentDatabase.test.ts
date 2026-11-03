import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll,afterAll,describe,it,expect } from "vitest";
let db:PGlite;
const id="11111111-1111-4111-8111-111111111111";
const payload={items:[{product_name:"Test",quantity:1,articles:1,unit_price:100,discount_percent:0,rental_start:"2026-11-10",rental_end:"2026-11-20"}],deposit:100,totals:{grossAmount:119},payment_terms:"vorkasse"};
beforeAll(async()=>{
 db=new PGlite();
 await db.exec(`CREATE ROLE authenticated; CREATE ROLE anon; CREATE ROLE service_role; CREATE SCHEMA auth;
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT '22222222-2222-4222-8222-222222222222'::uuid $$;
 CREATE FUNCTION public.can_edit_operations(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
 CREATE FUNCTION public.is_staff_member(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;
 CREATE TABLE rental_inquiries(id uuid primary key,status text,offer_number text,offer_payload jsonb,offer_total_gross numeric,start_date date,end_date date,offer_file_url text,offer_sent_at timestamptz,offer_accepted_at timestamptz,order_confirmation_number text,order_confirmation_file_url text,availability_pending boolean);
 CREATE TABLE deposit_settlements(rental_inquiry_id uuid);
 CREATE TABLE offer_payment_links(inquiry_id uuid,inquiry_table text,status text,stripe_session_id text,updated_at timestamptz);
 CREATE TABLE b2b_managed_products(id uuid,slug text);
 CREATE TABLE b2b_instance_allocations(rental_inquiry_id uuid);
 CREATE TABLE rental_inquiry_events(rental_inquiry_id uuid,event text,details jsonb,user_id uuid);
 CREATE FUNCTION check_availability(uuid) RETURNS jsonb LANGUAGE sql AS $$ SELECT '{"all_available":true}'::jsonb $$;
 CREATE FUNCTION confirm_order(uuid,jsonb) RETURNS jsonb LANGUAGE sql AS $$ SELECT '{"mode":"confirm"}'::jsonb $$;`);
 await db.exec(readFileSync("drizzle/migrations/0115_rental_order_amendment_versions.sql","utf8"));
 await db.exec(readFileSync("drizzle/migrations/0116_order_amendment_consistency_guards.sql","utf8"));
 await db.query(`INSERT INTO rental_inquiries(id,status,offer_number,offer_payload,offer_total_gross,start_date,end_date) VALUES($1,'accepted','ANG-ORIGINAL',$2,59.5,'2026-11-01','2026-11-02')`,[id,JSON.stringify({...payload,items:[{...payload.items[0],unit_price:50}],totals:{grossAmount:59.5}})]);
});
afterAll(async()=>{await db.close();});
describe("Gesicherte Auftragsfassungen",()=>{
 it("ändert Auftrag, bewahrt Original und synchronisiert Mietzeit ohne neue Angebotsnummer",async()=>{
  await db.query("SELECT save_rental_order_amendment($1,0,$2,'Telefonisch vereinbart',now())",[id,JSON.stringify(payload)]);
  const {rows}=await db.query<any>("SELECT offer_number,offer_total_gross,original_accepted_offer,order_revision,start_date::text,end_date::text FROM rental_inquiries WHERE id=$1",[id]);
  expect(rows[0].offer_number).toBe("ANG-ORIGINAL");expect(Number(rows[0].offer_total_gross)).toBe(119);expect(Number(rows[0].original_accepted_offer.offer_total_gross)).toBe(59.5);expect(rows[0].order_revision).toBe(1);expect(rows[0].end_date).toBe("2026-11-20");
 });
 it("sperrt veraltete parallele Änderung",async()=>{await expect(db.query("SELECT save_rental_order_amendment($1,0,$2,'Telefonisch vereinbart',now())",[id,JSON.stringify(payload)])).rejects.toThrow(/inzwischen/);});
 it("sperrt nachträgliches Überschreiben der Historie",async()=>{await expect(db.exec("UPDATE rental_order_revisions SET agreement_note='Geändert'")).rejects.toThrow(/unveränderlich/);});
 it("sperrt manipulierte Summen",async()=>{await expect(db.query("SELECT save_rental_order_amendment($1,1,$2,'Telefonisch vereinbart',now())",[id,JSON.stringify({...payload,totals:{grossAmount:1}})])).rejects.toThrow(/Summe|summe/);});
 it("sperrt bei bereits abgerechneter Kaution",async()=>{await db.query("INSERT INTO deposit_settlements VALUES($1)",[id]);await expect(db.query("SELECT save_rental_order_amendment($1,1,$2,'Telefonisch vereinbart',now())",[id,JSON.stringify(payload)])).rejects.toThrow(/Kaution/);});
});