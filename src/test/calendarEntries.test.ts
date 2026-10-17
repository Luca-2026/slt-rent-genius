import { describe, expect, it } from "vitest";
import {
  buildCalendarEntries,
  dayCells,
  deviceAvailability,
  effectiveEnd,
  effectiveStart,
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
  product_name: "Minibagger 2t",
  quantity: 1,
  requested_items: null,
  offer_payload: null,
};

describe("calendarEntries", () => {
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
    expect(isCalendarRelevant("rejected")).toBe(false);
    expect(isCalendarRelevant("new")).toBe(false);
    expect(isCalendarRelevant("offer_sent")).toBe(false);
    expect(buildCalendarEntries([{ ...base, status: "rejected" }], new Set(), new Set())).toHaveLength(0);
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
