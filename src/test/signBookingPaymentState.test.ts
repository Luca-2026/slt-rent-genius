import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
const db = new PGlite();
const migration = readFileSync("drizzle/migrations/0107_sign_booking_payment_alias_fix.sql", "utf8");
const start = migration.indexOf("CREATE OR REPLACE FUNCTION public.sign_booking_payment_state()");
const end = migration.indexOf("END; $$;", start) + "END; $$;".length;
beforeAll(async () => {
  await db.exec(`CREATE TABLE rental_inquiries(id uuid PRIMARY KEY,payments jsonb); CREATE TABLE sign_bookings(id uuid PRIMARY KEY,inquiry_id uuid,status text,expires_at timestamptz,total_cents int,confirmed_at timestamptz); CREATE TABLE rental_inquiry_events(rental_inquiry_id uuid,event text,details jsonb); ${migration.slice(start,end)} CREATE TRIGGER payment_state AFTER UPDATE OF payments ON rental_inquiries FOR EACH ROW EXECUTE FUNCTION sign_booking_payment_state();`);
}, 30000);
afterAll(() => db.close());
async function fixture(status = "reserved", expired = false) {
  const id = crypto.randomUUID();
  await db.query("INSERT INTO rental_inquiries VALUES($1,'[]')", [id]);
  await db.query("INSERT INTO sign_bookings VALUES($1,$1,$2,now()+$3::interval,14900,NULL)", [id, status, expired ? "-1 second" : "24 hours"]);
  return id;
}
async function pay(id: string, amount: number) {
  await db.query("UPDATE rental_inquiries SET payments=$2::jsonb WHERE id=$1", [id, JSON.stringify([{ amount, label: "Banküberweisung", reference: "Test" }])]);
  const result = await db.query<{ status: string }>("SELECT status FROM sign_bookings WHERE id=$1", [id]);
  return result.rows[0]?.status;
}
describe("Stored sign-booking payment transitions", () => {
  it("confirms only the complete 49 euro rental plus 100 euro deposit", async () => {
    const id = await fixture();
    expect(await pay(id, 148.99)).toBe("reserved");
    expect(await pay(id, 149)).toBe("paid");
  });
  it("does not confirm an overpayment of one cent", async () => {
    expect(await pay(await fixture(), 149.01)).toBe("review");
  });
  it("routes a payment received after the 24-hour deadline to review, never confirmation", async () => {
    expect(await pay(await fixture("reserved", true), 149)).toBe("review");
  });
  it("never reactivates a released booking after late payment", async () => {
    expect(await pay(await fixture("expired", true), 149)).toBe("review");
  });
  it("rejects negative and fractional-cent payments", async () => {
    const id = await fixture();
    await expect(pay(id, -149)).rejects.toThrow("positive centgenaue");
    await expect(pay(id, 149.001)).rejects.toThrow("positive centgenaue");
  });
});