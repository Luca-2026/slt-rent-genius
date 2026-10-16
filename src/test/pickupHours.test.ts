import { describe, it, expect } from "vitest";
import { getLocationInfoById, pickupTimeOptions, pickupWindowForDate } from "@/data/locationData";

// W3: Abhol-/Rückgabezeiten je Standort (Quelle: locationData.ts pickupHours)
describe("pickupWindowForDate / pickupTimeOptions", () => {
  const krefeld = getLocationInfoById("krefeld")!;
  const bonn = getLocationInfoById("bonn")!;
  const muelheim = getLocationInfoById("muelheim")!;

  it("Krefeld werktags 08:00–18:00, samstags 10:00–14:30", () => {
    // 16.10.2026 = Freitag, 17.10.2026 = Samstag
    expect(pickupWindowForDate(krefeld, "2026-10-16")).toEqual({ open: "08:00", close: "18:00" });
    expect(pickupWindowForDate(krefeld, "2026-10-17")).toEqual({ open: "10:00", close: "14:30" });
  });

  it("Bonn werktags 07:00–18:00, samstags 08:00–17:30", () => {
    expect(pickupWindowForDate(bonn, "2026-10-16")).toEqual({ open: "07:00", close: "18:00" });
    expect(pickupWindowForDate(bonn, "2026-10-17")).toEqual({ open: "08:00", close: "17:30" });
  });

  it("Sonntag ist an allen Standorten geschlossen", () => {
    // 18.10.2026 = Sonntag
    expect(pickupWindowForDate(krefeld, "2026-10-18")).toBeNull();
    expect(pickupWindowForDate(bonn, "2026-10-18")).toBeNull();
  });

  it("Mülheim hat kein festes Fenster (Abholung nach Vereinbarung)", () => {
    expect(pickupWindowForDate(muelheim, "2026-10-16")).toBeNull();
  });

  it("Uhrzeiten in 30-Minuten-Schritten inkl. Ende", () => {
    const opts = pickupTimeOptions({ open: "10:00", close: "14:30" });
    expect(opts[0]).toBe("10:00");
    expect(opts[opts.length - 1]).toBe("14:30");
    expect(opts).toContain("10:30");
    expect(opts).not.toContain("15:00");
    expect(opts.length).toBe(10);
  });

  it("ohne Datum oder Standort kein Fenster", () => {
    expect(pickupWindowForDate(krefeld, null)).toBeNull();
    expect(pickupWindowForDate(null, "2026-10-16")).toBeNull();
    expect(pickupWindowForDate(krefeld, "kein-datum")).toBeNull();
  });
});

// W2: Rückgabedatum darf nicht vor dem Abholdatum liegen (gleiche Regel wie im Formular und in der Edge Function)
describe("Datumsreihenfolge der Mietanfrage", () => {
  const invalid = (start: string, end: string) => Boolean(start && end && end < start);

  it("Ende vor Beginn ist ungültig", () => {
    expect(invalid("2026-10-20", "2026-10-19")).toBe(true);
  });
  it("gleicher Tag und späteres Ende sind gültig", () => {
    expect(invalid("2026-10-20", "2026-10-20")).toBe(false);
    expect(invalid("2026-10-20", "2026-10-21")).toBe(false);
  });
});
