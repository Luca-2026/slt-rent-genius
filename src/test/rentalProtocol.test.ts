import { describe, expect, it } from "vitest";
import {
  MAX_PROTOCOL_PHOTOS, acceptedPhotoCount, formatPhotoTimestamp, isProtocolCandidate,
  photoTakenAt, protocolItemsFromInquiry, remainingPhotoSlots,
} from "@/lib/rentalProtocol";
import { isReturnOverdue, isRunningRental, isUpcomingRental, matchesInquiryListFilter } from "@/lib/inquiryStatus";

describe("Foto-Limit", () => {
  it("erlaubt genau 15 Fotos", () => {
    expect(MAX_PROTOCOL_PHOTOS).toBe(15);
    expect(remainingPhotoSlots(0)).toBe(15);
    expect(remainingPhotoSlots(15)).toBe(0);
    expect(remainingPhotoSlots(20)).toBe(0);
    expect(acceptedPhotoCount(12, 5)).toBe(3);
    expect(acceptedPhotoCount(15, 1)).toBe(0);
    expect(acceptedPhotoCount(0, 15)).toBe(15);
  });
  it("Zeitstempel", () => {
    expect(formatPhotoTimestamp("2026-09-30T18:15:00Z")).toBe("30.09.2026, 20:15 Uhr");
    const now = Date.parse("2026-09-30T18:00:00Z");
    expect(photoTakenAt(Date.parse("2026-09-30T17:00:00Z"), now)).toBe("2026-09-30T17:00:00.000Z");
    expect(photoTakenAt(undefined, now)).toBe("2026-09-30T18:00:00.000Z");
    expect(photoTakenAt(now + 3_600_000, now)).toBe("2026-09-30T18:00:00.000Z");
  });
});

describe("Artikel aus dem Auftrag", () => {
  it("nimmt das Angebot, sonst die Anfrage", () => {
    const fromOffer = protocolItemsFromInquiry({
      offer_payload: { items: [{ product_name: "Weißweinglas Brunelli, 25er Set", articles: 2, quantity: 2, description: "20.10.2026 – 21.10.2026 · 2 × 25er Set = 50 Stück" }] },
    });
    expect(fromOffer).toEqual([{ name: "Weißweinglas Brunelli, 25er Set", quantity: 2, detail: "2 × 25er Set = 50 Stück" }]);
    const mixed = protocolItemsFromInquiry({ offer_payload: { items: [{ product_name: "Stehtisch", quantity: 1, description: "20.10.2026 · 2 × 25er Set = 50 Stück" }] } });
    expect(mixed[0].detail).toBeNull();
    const fromReq = protocolItemsFromInquiry({ requested_items: [{ product_name: "Stehtisch", quantity: 3 }] });
    expect(fromReq).toEqual([{ name: "Stehtisch", quantity: 3, detail: null }]);
    expect(protocolItemsFromInquiry({ product_name: "Bagger", quantity: 1 })).toEqual([{ name: "Bagger", quantity: 1, detail: null }]);
  });
});

describe("Auftragsauswahl", () => {
  const acc = { status: "accepted", order_confirmed_at: "2026-09-30T10:00:00Z" };
  it("Übergabe nur ohne bestehende Übergabe", () => {
    expect(isProtocolCandidate(acc, "delivery", { handedOver: false, returned: false })).toBe(true);
    expect(isProtocolCandidate(acc, "delivery", { handedOver: true, returned: false })).toBe(false);
    expect(isProtocolCandidate({ status: "offer_sent" }, "delivery", { handedOver: false, returned: false })).toBe(false);
  });
  it("Rückgabe nur nach Übergabe und ohne Rückgabe", () => {
    expect(isProtocolCandidate(acc, "return", { handedOver: true, returned: false })).toBe(true);
    expect(isProtocolCandidate(acc, "return", { handedOver: false, returned: false })).toBe(false);
    expect(isProtocolCandidate(acc, "return", { handedOver: true, returned: true })).toBe(false);
  });
});

describe("Laufende Mietvorgänge nach Zeitraum", () => {
  const today = "2026-09-30";
  const base = { status: "accepted", order_confirmed_at: "2026-09-29T10:00:00Z" };
  it("Miete 20.–21.10. ist bevorstehend, nicht laufend", () => {
    const r = { ...base, start_date: "2026-10-20", end_date: "2026-10-21" };
    expect(isRunningRental(r, today)).toBe(false);
    expect(isUpcomingRental(r, today)).toBe(true);
    expect(matchesInquiryListFilter(r, "running", today)).toBe(false);
    expect(matchesInquiryListFilter(r, "upcoming", today)).toBe(true);
  });
  it("Mietbeginn heute oder vorbei = laufend", () => {
    expect(isRunningRental({ ...base, start_date: "2026-09-30 08:00" }, today)).toBe(true);
    expect(isRunningRental({ ...base, start_date: "2026-09-25", end_date: "2026-10-05" }, today)).toBe(true);
  });
  it("Frühe Übergabe zählt als laufend", () => {
    expect(isRunningRental({ ...base, start_date: "2026-10-20", handed_over: true }, today)).toBe(true);
  });
  it("Mietende überschritten = Rückgabe überfällig", () => {
    expect(isReturnOverdue({ ...base, start_date: "2026-09-20", end_date: "2026-09-25" }, today)).toBe(true);
    expect(isReturnOverdue({ ...base, start_date: "2026-09-20", end_date: "2026-09-30" }, today)).toBe(false);
  });
  it("ohne Auftragsbestätigung nie laufend", () => {
    expect(isRunningRental({ status: "accepted", start_date: "2026-09-01" }, today)).toBe(false);
  });
});
