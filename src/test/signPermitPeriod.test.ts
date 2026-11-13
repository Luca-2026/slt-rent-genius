import { describe, expect, it } from "vitest";
import { signPermitPeriodError, SIGN_PERMIT_HOURS } from "../../supabase/functions/_shared/sign-permit-period";
const now = Date.parse("2026-11-06T10:00:00Z");
const ok = { permitValidFrom: "2026-11-10", permitValidUntil: "2026-11-12", permitIssuedOn: "2026-11-02" };
describe("Standard sign permit period", () => {
  it("offers exactly 24 full hours", () => { expect(SIGN_PERMIT_HOURS).toHaveLength(24); expect(SIGN_PERMIT_HOURS[0]).toBe("00:00"); expect(SIGN_PERMIT_HOURS[23]).toBe("23:00"); });
  it("accepts same-day 08:00–18:00", () => expect(signPermitPeriodError({ ...ok, permitValidUntil: ok.permitValidFrom, permitValidFromTime: "08:00", permitValidUntilTime: "18:00" }, "2026-11-08", "2026-11-14", now)).toBeNull());
  it("rejects partial hours", () => expect(signPermitPeriodError({ ...ok, permitValidFromTime: "08:30", permitValidUntilTime: "18:00" }, "2026-11-08", "2026-11-14", now)).not.toBeNull());
  it("requires both times when time selection is used", () => expect(signPermitPeriodError({ ...ok, permitValidFromTime: "08:00", permitValidUntilTime: "" }, "2026-11-08", "2026-11-14", now)).not.toBeNull());
  it("rejects reversed times on the same day", () => expect(signPermitPeriodError({ ...ok, permitValidUntil: ok.permitValidFrom, permitValidFromTime: "18:00", permitValidUntilTime: "08:00" }, "2026-11-08", "2026-11-14", now)).not.toBeNull());
  it("accepts a permit period inside the rental period", () => expect(signPermitPeriodError(ok, "2026-11-08", "2026-11-14", now)).toBeNull());
  it("requires all three dates", () => expect(signPermitPeriodError({ ...ok, permitIssuedOn: "" }, "2026-11-08", "2026-11-14", now)).not.toBeNull());
  it("rejects an end before the start", () => expect(signPermitPeriodError({ ...ok, permitValidUntil: "2026-11-09" }, "2026-11-08", "2026-11-14", now)).not.toBeNull());
  it("rejects a future issue date", () => expect(signPermitPeriodError({ ...ok, permitIssuedOn: "2026-11-07" }, "2026-11-08", "2026-11-14", now)).not.toBeNull());
  it("rejects a permit period outside the rental period", () => expect(signPermitPeriodError(ok, "2026-11-11", "2026-11-14", now)).not.toBeNull());
});
