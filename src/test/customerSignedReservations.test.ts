import { describe, expect, it } from "vitest";
import { customerSignedReservationIds, isRunningReservation } from "@/lib/inquiryStatus";

describe("Kundenübergabe in alten Portalansichten", () => {
  it("zählt direkte und angebotsverknüpfte Kundenunterschriften, keine Mitarbeiterprotokolle", () => {
    const ids = customerSignedReservationIds([
      { status: "signed", reservation_id: "direct" },
      { status: "signed", reservation_id: null, offer_id: "offer" },
      { status: "signed_staff_only", reservation_id: "staff-only" },
      { status: "pending_customer_signature", reservation_id: "pending" },
      { status: "draft", reservation_id: "draft" },
      { status: null, reservation_id: "unknown" },
      { status: "signed", reservation_id: null, offer_id: "missing" },
    ], [{ id: "offer", reservation_id: "linked" }]);
    expect([...ids]).toEqual(["direct", "linked"]);
  });
  it("keine Übergabe bedeutet keine aktive Miete", () => {
    expect(customerSignedReservationIds([], [{ id: "offer", reservation_id: "late" }]).size).toBe(0);
  });
  it("historische active-Flags reichen nicht, erledigte Datensätze bleiben erledigt", () => {
    expect(isRunningReservation({ id: "late", status: "active" }, new Set())).toBe(false);
    expect(isRunningReservation({ id: "late", status: "confirmed" }, new Set())).toBe(false);
    expect(isRunningReservation({ id: "late", status: "confirmed" }, new Set(["late"]))).toBe(true);
    expect(isRunningReservation({ id: "late", status: "active" }, new Set(["late"]))).toBe(true);
    expect(isRunningReservation({ id: "late", status: "completed" }, new Set(["late"]))).toBe(false);
    expect(isRunningReservation({ id: "late", status: "cancelled" }, new Set(["late"]))).toBe(false);
  });
});