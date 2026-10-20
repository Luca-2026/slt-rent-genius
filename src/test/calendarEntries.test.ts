import { describe, expect, it } from "vitest";
import {
  buildCalendarEntries,
  dayCells,
  deviceAvailability,
  earliestFreeFrom,
  effectiveEnd,
  effectiveStart,
  hasInvalidRentalPeriod,
  isCalendarRelevant,
  rangesOverlap,
  weekDays,
  weekStart,
} from "@/lib/calendarEntries";

const base = {
  id: "i1",
  status: "accepted",
  start_date: "2026-10-20",
  start_time: "08:00:00",
  end_date: "2026-10-22",
  end_time: "17:30:00",
  location: "krefeld",
  customer_name: "Max Müller",
  company_name: null,
  order_code: "C48T6Q",
  order_confirmed_at: "2026-10-16T09:00:00Z",
  product_name: "Minibagger 2t",
  quantity: 1,
  requested_items: null,
  offer_payload: null,
};

describe("calendarEntries", () => {
  it("Linus Hauser: Ausgabe am 20.10., falsches Ende 13.10. ist kein Rückgabetermin", () => {
    const row = { ...base, end_date: "2026-10-13", offer_payload: { items: [{ rental_start: "2026-10-20", rental_end: "2026-10-13" }] } };
    expect(hasInvalidRentalPeriod(row)).toBe(true);
    expect(effectiveEnd(row)).toBeNull();
    expect(buildCalendarEntries([row], new Set(), new Set()).map((e) => [e.kind, e.date])).toEqual([["pickup", "2026-10-20"]]);
    expect(hasInvalidRentalPeriod(base)).toBe(false);
  });
  it("erzeugt Übergabe und Rückgabe mit Uhrzeit, Kunde und Auftrags-ID", () => {
    const entries = buildCalendarEntries([base], new Set(), new Set());
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({ kind: "pickup", date: "2026-10-20", time: "08:00", orderCode: "C48T6Q", customer: "Max Müller", protocolSigned: false });
    expect(entries[1]).toMatchObject({ kind: "return", date: "2026-10-22", time: "17:30", protocolSigned: false });
  });

  it("markiert unterschriebene Protokolle", () => {
    const entries = buildCalendarEntries([base], new Set(["i1"]), new Set(["i1"]));
    expect(entries[0].protocolSigned).toBe(true);
    expect(entries[1].protocolSigned).toBe(true);
  });

  it("ignoriert abgelehnte und offene Anfragen", () => {
    expect(isCalendarRelevant("rejected", "2026-10-16T09:00:00Z")).toBe(false);
    expect(isCalendarRelevant("new", "2026-10-16T09:00:00Z")).toBe(false);
    expect(isCalendarRelevant("offer_sent", "2026-10-16T09:00:00Z")).toBe(false);
    expect(buildCalendarEntries([{ ...base, status: "rejected" }], new Set(), new Set())).toHaveLength(0);
  });

  it("zeigt nur Aufträge mit versandter Auftragsbestätigung", () => {
    // Angenommen, aber noch keine Auftragsbestätigung → nicht im Kalender
    expect(isCalendarRelevant("accepted", null)).toBe(false);
    expect(isCalendarRelevant("accepted", "")).toBe(false);
    expect(isCalendarRelevant("accepted", "2026-10-16T09:00:00Z")).toBe(true);
    expect(isCalendarRelevant("done", "2026-10-16T09:00:00Z")).toBe(true);
    expect(buildCalendarEntries([{ ...base, order_confirmed_at: null }], new Set(), new Set())).toHaveLength(0);
  });

  it("nutzt abweichende Positionsdaten aus dem Angebot (frühester Beginn, spätestes Ende)", () => {
    const inq = {
      ...base,
      offer_payload: { items: [{ rental_start: "2026-10-19", rental_end: "2026-10-21" }, { rental_start: "2026-10-21", rental_end: "2026-10-25" }] },
    };
    expect(effectiveStart(inq)).toBe("2026-10-19");
    expect(effectiveEnd(inq)).toBe("2026-10-25");
  });

  it("listet gebündelte Artikel mit Stückzahl", () => {
    const inq = { ...base, requested_items: [{ product_name: "Bagger", quantity: 2 }, { product_name: "Anhänger", quantity: 1 }] };
    const entries = buildCalendarEntries([inq], new Set(), new Set());
    expect(entries[0].itemsLabel).toBe("2× Bagger, Anhänger");
  });

  it("Wochenstart ist Montag, Woche hat 7 Tage", () => {
    // 17.10.2026 ist ein Samstag
    const start = weekStart(new Date(2026, 9, 17));
    expect(start.getDay()).toBe(1);
    const days = weekDays(new Date(2026, 9, 17));
    expect(days).toHaveLength(7);
    expect(days[0]).toBe("2026-10-12");
    expect(days[6]).toBe("2026-10-18");
  });

  it("erkennt Zeitraum-Überschneidungen", () => {
    expect(rangesOverlap("2026-10-01", "2026-10-10", "2026-10-05", "2026-10-12")).toBe(true);
    expect(rangesOverlap("2026-10-01", "2026-10-10", "2026-10-10", "2026-10-12")).toBe(false);
    expect(rangesOverlap("2026-10-01", "2026-10-10", "2026-09-01", "2026-09-30")).toBe(false);
  });

  it("deviceAvailability: belegt, frei bis, frei", () => {
    const now = "2026-10-17T10:00:00";
    const busy = deviceAvailability([{ from_at: "2026-10-15T08:00:00", to_at: "2026-10-20T17:00:00" }], now);
    expect(busy).toMatchObject({ state: "busy", busyUntil: "2026-10-20T17:00:00" });
    const freeUntil = deviceAvailability([{ from_at: "2026-10-20T08:00:00", to_at: "2026-10-22T17:00:00" }], now);
    expect(freeUntil).toMatchObject({ state: "free_until", freeUntil: "2026-10-20T08:00:00" });
    expect(deviceAvailability([], now)).toEqual({ state: "free" });
    // Vergangene Belegungen zählen nicht
    expect(deviceAvailability([{ from_at: "2026-10-01T08:00:00", to_at: "2026-10-05T17:00:00" }], now)).toEqual({ state: "free" });
    // Belegt mit Folgebelegung nennt beide
    const both = deviceAvailability(
      [
        { from_at: "2026-10-15T08:00:00", to_at: "2026-10-18T17:00:00" },
        { from_at: "2026-10-25T08:00:00", to_at: "2026-10-27T17:00:00" },
      ],
      now,
    );
    expect(both).toMatchObject({ state: "busy", busyUntil: "2026-10-18T17:00:00" });
    expect(both.state === "busy" && both.next?.from_at).toBe("2026-10-25T08:00:00");
  });

  it("dayCells: markiert belegte Kalendertage", () => {
    const cells = dayCells([{ from_at: "2026-10-18T08:00:00", to_at: "2026-10-20T17:00:00" }], "2026-10-17", 7);
    expect(cells).toEqual([false, true, true, true, false, false, false]);
    expect(dayCells([], "2026-10-17", 3)).toEqual([false, false, false]);
  });
});

describe("earliestFreeFrom", () => {
  const now = "2026-10-17T10:00:00";
  it("null, wenn mindestens ein Gerät sofort frei ist", () => {
    expect(earliestFreeFrom([{ allocations: [] }, { allocations: [{ from_at: "2026-10-15T08:00:00", to_at: "2026-10-20T17:00:00" }] }], now)).toBeNull();
  });
  it("frühestes Ende, wenn alle belegt sind", () => {
    expect(
      earliestFreeFrom(
        [
          { allocations: [{ from_at: "2026-10-15T08:00:00", to_at: "2026-10-25T17:00:00" }] },
          { allocations: [{ from_at: "2026-10-16T08:00:00", to_at: "2026-10-20T17:00:00" }] },
        ],
        now,
      ),
    ).toBe("2026-10-20T17:00:00");
  });
});
