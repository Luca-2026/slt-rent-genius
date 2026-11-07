import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
let db: PGlite;
const actor = "22222222-2222-4222-8222-222222222222";
const id = "11111111-1111-4111-8111-111111111111";
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`CREATE ROLE authenticated; CREATE ROLE anon; CREATE ROLE service_role; CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT (current_setting('request.jwt.claims',true)::jsonb->>'sub')::uuid $$;
    CREATE FUNCTION can_edit_operations(uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT $1='${actor}'::uuid $$;
    CREATE TABLE rental_inquiries(id uuid PRIMARY KEY,status text,offer_number text,offer_payload jsonb,closed_manually_at timestamptz,offer_accepted_at timestamptz,order_confirmed_at timestamptz);
    CREATE TABLE offer_acceptance_links(id uuid PRIMARY KEY,inquiry_table text,inquiry_id uuid,offer_number text,status text,created_at timestamptz,accepted_at timestamptz,signer_name text,signature_data text,agb_accepted boolean,accepted_channel text,accepted_user_agent text,decline_reason text,decline_note text,declined_at timestamptz);
    CREATE TABLE sales_inquiries(id uuid,offer_number text,status text);
    CREATE TABLE rental_inquiry_events(rental_inquiry_id uuid,event text,details jsonb,user_id uuid);
    CREATE TABLE b2b_delivery_notes(id uuid PRIMARY KEY,rental_inquiry_id uuid,customer_signed_at timestamptz,signature_data text,agb_accepted boolean,protocol_data jsonb);
    CREATE FUNCTION offer_link_deadline(offer_acceptance_links) RETURNS timestamptz LANGUAGE sql AS $$ SELECT now()-interval '1 day' $$;
    CREATE FUNCTION confirm_order(uuid,jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$ BEGIN
      IF NOT can_edit_operations(auth.uid()) THEN RAISE EXCEPTION 'Keine Berechtigung'; END IF;
      IF (SELECT offer_payload->>'unavailable' FROM rental_inquiries WHERE id=$1)='true' THEN RAISE EXCEPTION 'Gerät nicht verfügbar'; END IF;
      UPDATE rental_inquiries SET order_confirmed_at=now() WHERE id=$1;
      RETURN '{"allocations":1}'::jsonb; END $$;`);
  await db.exec(readFileSync("drizzle/migrations/0161_signed_handover_confirms_rental_order.sql", "utf8"));
  await db.exec("CREATE TRIGGER decision_guard BEFORE UPDATE ON offer_acceptance_links FOR EACH ROW EXECUTE FUNCTION guard_offer_link_decision()");
});
afterAll(async () => { await db.close(); });
async function reset(unavailable = false) {
  await db.exec("DELETE FROM b2b_delivery_notes; DELETE FROM rental_inquiry_events; DELETE FROM offer_acceptance_links; DELETE FROM rental_inquiries");
  await db.query("INSERT INTO rental_inquiries(id,status,offer_number,offer_payload) VALUES($1,'offer_sent','ANG-TEST',$2)", [id, JSON.stringify({ items: [{}], unavailable })]);
  await db.query("INSERT INTO offer_acceptance_links(id,inquiry_table,inquiry_id,offer_number,status,created_at) VALUES($1,'rental_inquiries',$1,'ANG-TEST','active',now())", [id]);
}
async function sign() {
  return db.query("INSERT INTO b2b_delivery_notes VALUES($1,$1,now(),'data:image/png;base64,test',true,$2)", [id, JSON.stringify({ created_by: actor, customer_signer_name: "Testkunde", items_confirmed: true })]);
}
describe("Verbindliche Übergabe ohne vorherige AB", () => {
  it("nimmt aktuelles Angebot per Übergabe an und bestätigt den Auftrag atomar auch nach Mietbeginn", async () => {
    await reset(); await sign();
    const { rows } = await db.query<{ status: string; confirmed: boolean; channel: string }>("SELECT r.status,r.order_confirmed_at IS NOT NULL confirmed,l.accepted_channel channel FROM rental_inquiries r JOIN offer_acceptance_links l ON l.inquiry_id=r.id");
    expect(rows[0]).toEqual({ status: "accepted", confirmed: true, channel: "onsite" });
  });
  it("rollt Annahme und Protokoll bei nicht verfügbarem Gerät zurück", async () => {
    await reset(true); await expect(sign()).rejects.toThrow("Gerät nicht verfügbar");
    const { rows } = await db.query<{ status: string; count: number }>("SELECT status,(SELECT count(*)::int FROM b2b_delivery_notes) count FROM rental_inquiries");
    expect(rows[0]).toEqual({ status: "offer_sent", count: 0 });
  });
  it("verhindert zweite Übergabe ohne zweite Bestätigung", async () => {
    await reset(); await sign(); await expect(sign()).rejects.toThrow("bereits vorhanden");
    const { rows } = await db.query<{ count: number }>("SELECT count(*)::int count FROM rental_inquiry_events WHERE event='order_bound_by_handover'");
    expect(rows[0].count).toBe(1);
  });
  it("lässt öffentliche Annahme abgelaufener Angebote weiterhin nicht zu", async () => {
    await reset(); await expect(db.exec("UPDATE offer_acceptance_links SET status='accepted',accepted_channel='online'")).rejects.toThrow("nicht mehr gültig");
  });
});