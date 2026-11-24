import { describe, expect, it } from "vitest";
import { canPrepareSignBooking, initialSignBookingLocation, sortSignBookings, signOutstandingCents } from "@/lib/signBookingOverview";

const booking = (id: string, start_date: string, end_date = start_date, status = "paid") => ({ id, start_date, end_date, status });
describe("Staff sign booking overview", () => {
  it("shows only the extra 6 euros after a 39 euro package and 100 euro deposit have been paid", () => {
    const inquiry = { offer_total_gross: 45, offer_payload: { deposit: 100 }, payments: [{ amount: 139 }] };
    expect(signOutstandingCents(inquiry)).toBe(600);
    expect(signOutstandingCents({ ...inquiry, payments: [{ amount: 139 }, { amount: 6 }] })).toBe(0);
    expect(signOutstandingCents()).toBeNull();
  });
  it("defaults to the actual employee/admin branch", () => {
    expect(initialSignBookingLocation("Bonn")).toBe("bonn");
    expect(initialSignBookingLocation("Mülheim an der Ruhr")).toBe("muelheim");
    expect(initialSignBookingLocation("krefeld")).toBe("krefeld");
    expect(initialSignBookingLocation(null)).toBe("all");
  });
  it("puts the next upcoming orders first without mutating the source", () => {
    const rows = [booking("past", "2026-11-01"), booking("later", "2026-11-20"), booking("ongoing", "2026-11-14", "2026-11-18"), booking("next", "2026-11-17"), booking("today", "2026-11-16")];
    expect(sortSignBookings(rows, "2026-11-16").map(b => b.id)).toEqual(["today", "next", "later", "ongoing", "past"]);
    expect(rows[0].id).toBe("past");
  });
  it("keeps completed and cancelled records in history and prevents preparation changes", () => {
    const done = { ...booking("done", "2026-11-17"), inquiry: { status: "done" } };
    const cancelled = { ...booking("cancelled", "2026-11-17"), cancelled_at: "2026-11-16" };
    expect(canPrepareSignBooking(done)).toBe(false);
    expect(canPrepareSignBooking(cancelled)).toBe(false);
    expect(sortSignBookings([done, cancelled, booking("next", "2026-11-18")], "2026-11-16")[0].id).toBe("next");
  });
  it("does not infer a return or closure from an elapsed rental end", () => {
    expect(canPrepareSignBooking(booking("late-return", "2026-11-01", "2026-11-10"))).toBe(true);
  });
});