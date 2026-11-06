import { describe, expect, it } from "vitest";
import { signPermitPeriodError } from "../../supabase/functions/_shared/sign-permit-period";
const now = Date.parse("2026-11-06T10:00:00Z");
const ok = { permitValidFrom: "2026-11-10", permitValidUntil: "2026-11-12", permitIssuedOn: "2026-11-02" };
describe("Standard sign permit period", () => {
  it("accepts a permit period inside the rental period", () => expect(signPermitPeriodError(ok, "2026-11-08", "2026-11-14", now)).toBeNull());
  it("requires all three dates", () => expect(signPermitPeriodError({ ...ok, permitIssuedOn: "" }, "2026-11-08", "2026-11-14", now)).not.toBeNull());
  it("rejects an end before the start", () => expect(signPermitPeriodError({ ...ok, permitValidUntil: "2026-11-09" }, "2026-11-08", "2026-11-14", now)).not.toBeNull());
  it("rejects a future issue date", () => expect(signPermitPeriodError({ ...ok, permitIssuedOn: "2026-11-07" }, "2026-11-08", "2026-11-14", now)).not.toBeNull());
  it("rejects a permit period outside the rental period", () => expect(signPermitPeriodError(ok, "2026-11-11", "2026-11-14", now)).not.toBeNull());
});
