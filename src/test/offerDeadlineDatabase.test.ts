import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, describe, it, expect } from "vitest";

let db: PGlite;
const id = "11111111-1111-4111-8111-111111111111";
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE TABLE rental_inquiries(id uuid PRIMARY KEY, offer_number text, status text, offer_payload jsonb, start_date text, start_time text, end_date text, end_time text);
    CREATE TABLE sales_inquiries(id uuid, offer_number text, status text);
    CREATE TABLE offer_acceptance_links(id uuid PRIMARY KEY,inquiry_table text,inquiry_id uuid,offer_number text,status text,valid_until date,expires_at timestamptz,created_at timestamptz,dispatched_at timestamptz,accepted_channel text,decline_reason text,decline_note text,declined_at timestamptz);
    CREATE TABLE rental_inquiry_events(rental_inquiry_id uuid,event text,details jsonb);
    CREATE FUNCTION slt_try_date(text) RETURNS date LANGUAGE sql AS $$ SELECT NULLIF($1,'')::date $$;`);
  await db.exec(readFileSync("drizzle/migrations/0169_allow_newly_sent_started_rental_offer_acceptance.sql", "utf8"));
  const guards = readFileSync("drizzle/migrations/0161_signed_handover_confirms_rental_order.sql", "utf8").split("CREATE OR REPLACE FUNCTION public.bind_signed_rental_handover")[0];
  await db.exec(guards);
  await db.exec("CREATE TRIGGER decision_guard BEFORE UPDATE ON offer_acceptance_links FOR EACH ROW EXECUTE FUNCTION guard_offer_link_decision()");
});
afterAll(async () => { await db.close(); });
async function fixture(sent = "2026-11-07T12:07:26Z", startTime: string | null = "08:00", valid = "2026-11-21") {
  await db.exec("DELETE FROM offer_acceptance_links; DELETE FROM rental_inquiries");
  await db.query("INSERT INTO rental_inquiries VALUES($1,'ANG-M-2026-11-0045','offer_sent',$2,'2026-11-07',$3,'2026-11-09','09:00')", [id, JSON.stringify({ items: [{ rental_start: "2026-11-07", rental_start_time: startTime, rental_end: "2026-11-09", rental_end_time: "09:00" }, { period_free: true }] }), startTime]);
  await db.query("INSERT INTO offer_acceptance_links(id,inquiry_table,inquiry_id,offer_number,status,valid_until,created_at,dispatched_at) VALUES($1,'rental_inquiries',$1,'ANG-M-2026-11-0045','active',$2,$3,$3)", [id, valid, sent]);
}
async function deadline() {
  const { rows } = await db.query<{ deadline: Date }>("SELECT offer_link_deadline(l) deadline FROM offer_acceptance_links l");
  return new Date(rows[0].deadline).toISOString();
}
describe("Same-day offers and shared online/onsite acceptance guard", () => {
  it("#6BFUJH sent 12:07 UTC after 08:00 Berlin stays valid until Nov 9 09:00 Berlin", async () => {
    await fixture(); expect(await deadline()).toBe("2026-11-09T08:00:00.000Z");
  });
  it("missing start time does not instantly expire a freshly sent offer", async () => {
    await fixture(undefined, null); expect(await deadline()).toBe("2026-11-09T08:00:00.000Z");
  });
  it("future rentals still expire at the agreed start", async () => {
    await fixture("2026-11-06T12:00:00Z"); expect(await deadline()).toBe("2026-11-07T07:00:00.000Z");
  });
  it("explicit shorter expiry remains authoritative", async () => {
    await fixture(); await db.exec("UPDATE offer_acceptance_links SET expires_at='2026-11-07T15:00:00Z'");
    expect(await deadline()).toBe("2026-11-07T15:00:00.000Z");
  });
  for (const channel of ["online", "onsite"]) {
    it(`accepts freshly sent current offer through ${channel} guard`, async () => {
      await fixture();
      await db.exec("UPDATE rental_inquiries SET offer_payload=jsonb_set(offer_payload,'{items,0,rental_end}','\"2099-11-09\"'::jsonb); UPDATE offer_acceptance_links SET valid_until='2099-11-21'");
      await db.query("UPDATE offer_acceptance_links SET status='accepted',accepted_channel=$1", [channel]);
      const { rows } = await db.query<{ status: string }>("SELECT status FROM offer_acceptance_links");
      expect(rows[0].status).toBe("accepted");
    });
    it(`rejects genuinely expired offers through ${channel} guard`, async () => {
      await fixture(); await db.exec("UPDATE offer_acceptance_links SET expires_at='2000-01-01'");
      await expect(db.query("UPDATE offer_acceptance_links SET status='accepted',accepted_channel=$1", [channel])).rejects.toThrow("nicht mehr gültig");
    });
  }
  it("rejects a superseded offer even with future validity", async () => {
    await fixture(); await db.exec("UPDATE rental_inquiries SET offer_number='NEW'; UPDATE offer_acceptance_links SET expires_at='2099-01-01'");
    await expect(db.exec("UPDATE offer_acceptance_links SET status='accepted'")).rejects.toThrow("nicht mehr gültig");
  });
  for (const status of ["expired", "declined"]) {
    it(`does not reopen ${status} links`, async () => {
      await fixture(); await db.query("UPDATE offer_acceptance_links SET status=$1", [status]);
      await deadline();
      const { rows } = await db.query<{ status: string }>("SELECT status FROM offer_acceptance_links");
      expect(rows[0].status).toBe(status);
    });
  }
});