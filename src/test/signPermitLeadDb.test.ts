import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
const db = new PGlite();
beforeAll(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE TABLE sign_bookings(snapshot jsonb,package text,permit_path text,start_date date,permit_mode text,terms_accepted_at timestamptz,terms_version text,terms_document_hash text);`);
  const sql = readFileSync("drizzle/migrations/0112_sign_permit_lead_and_terms_evidence.sql", "utf8");
  await db.exec(sql.slice(0, sql.indexOf("ALTER TABLE")));
  await db.exec(sql.slice(sql.indexOf("CREATE OR REPLACE FUNCTION public.guard_sign_booking_requirements"), sql.indexOf("DO $patch$")));
  await db.exec(readFileSync("drizzle/migrations/0211_sign_existing_permit_72_hour_lead.sql", "utf8"));
}, 30000);
afterAll(() => db.close());
const request = { termsAccepted: true, termsVersion: "2026-05", customerKind: "private", termsDocumentHash: "770d16fa42d287aa23d556309b1afeb7ec93d6ab7fb7a97f1dbe7c46fd3d4864", permitMode: "existing" };
async function insert(hours: number, path: string | null = "isolated/permit.pdf") {
  return db.query(`INSERT INTO sign_bookings(snapshot,package,permit_path,start_date)
    SELECT jsonb_build_object('request',$1::jsonb||jsonb_build_object('start_time',to_char(local,'HH24:MI'))),'sorglos',$2,local::date
    FROM (SELECT date_trunc('minute',now() AT TIME ZONE 'Europe/Berlin')+make_interval(hours=>$3::int) AS local) t RETURNING permit_mode`, [JSON.stringify(request),path,hours]);
}
describe("72-hour existing permit database guard", () => {
  it("accepts an existing permit at 73 hours, within the previously blocked 72–96-hour range", async () => {
    expect((await insert(73)).rows[0]).toEqual({ permit_mode: "existing" });
  });
  it("rejects 71 hours and still requires the uploaded permit", async () => {
    await expect(insert(71)).rejects.toThrow(/72 Stunden/);
    await expect(insert(73,null)).rejects.toThrow(/hochgeladen/);
  });
});