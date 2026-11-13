import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Sign booking business rejections", () => {
  it("returns a non-retryable capacity rejection instead of a serialization retry", async () => {
    const db = new PGlite();
    try {
      await db.exec(`CREATE FUNCTION public.reserve_sign_booking(uuid,text,jsonb,text) RETURNS jsonb LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Nicht genügend Sets für diesen Zeitraum verfügbar' USING ERRCODE='40001'; END $$;
      CREATE FUNCTION public.guard_sign_inventory() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Nicht genügend Halteverbotsschilder-Sets verfügbar' USING ERRCODE='40001'; END $$;`);
      await db.exec(readFileSync("/tmp/sign-booking-rejection.sql", "utf8"));
      await expect(db.query("SELECT reserve_sign_booking(NULL,NULL,NULL,NULL)")).rejects.toMatchObject({ code: "23514" });
      const row = (await db.query<{proconfig: string[]}>("SELECT proconfig FROM pg_proc WHERE proname='reserve_sign_booking'")).rows[0];
      expect(row?.proconfig).toContain("lock_timeout=2s");
      await db.exec("CREATE TABLE stock_probe(id int); CREATE TRIGGER stock_guard BEFORE INSERT ON stock_probe FOR EACH ROW EXECUTE FUNCTION guard_sign_inventory();");
      await expect(db.exec("INSERT INTO stock_probe VALUES(1)")).rejects.toMatchObject({ code: "23514" });
    } finally { await db.close(); }
  });
});