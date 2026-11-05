import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, expect, it } from "vitest";

const db = new PGlite();
beforeAll(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
    CREATE TABLE rental_additional_payouts(id uuid);
    CREATE TABLE rental_additional_payout_events(id uuid);`);
  await db.exec(readFileSync("drizzle/migrations/0139_retire_rental_additional_compensation.sql", "utf8"));
}, 30000);
afterAll(() => db.close());
it("even privileged callers cannot create compensation beyond the original payment", async () => {
  await expect(db.query("SELECT request_rental_additional_payout($1,12376,'Ausfall','TEST','TEST')", [crypto.randomUUID()])).rejects.toThrow("eingestellt");
});
it("retired compensation cannot be approved or marked paid", async () => {
  await expect(db.query("SELECT decide_rental_additional_payout($1,true,'TEST')", [crypto.randomUUID()])).rejects.toThrow("eingestellt");
  await expect(db.query("SELECT complete_rental_additional_payout($1,'TEST')", [crypto.randomUUID()])).rejects.toThrow("eingestellt");
});
it("staff and anonymous callers have no execution grant for retired payouts", async () => {
  for (const role of ["anon", "authenticated"]) {
    const result = await db.query<{ allowed: boolean }>("SELECT has_function_privilege($1,'request_rental_additional_payout(uuid,integer,text,text,text)','EXECUTE') AS allowed", [role]);
    expect(result.rows[0]?.allowed).toBe(false);
  }
});