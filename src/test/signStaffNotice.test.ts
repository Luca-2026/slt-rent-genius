import { describe, expect, it } from "vitest";
import { signStaffNotice } from "../../supabase/functions/sign-booking-worker/staff-notice";
const b = { package: "standard", quantity: 2, location: "bonn", start_date: "2026-11-09", end_date: "2026-11-16", permit_valid_from: "2026-11-12", permit_valid_until: "2026-11-14", permit_issued_on: "2026-11-02", total_cents: 17800 };
describe("Halteverbot staff notice", () => {
  it("subject carries the booking reference", () => expect(signStaffNotice(b, { order_code: "PWUZQQ" }, "https://app.slt-rental.de/x", false).subject).toBe("Neue Buchung Halteverbotsschilder #PWUZQQ"));
  it("shows the labelling period for standard bookings", () => expect(signStaffNotice(b, { order_code: "A" }, "l", false).html).toContain("12.11.2026 – 14.11.2026"));
});
