import { describe, it, expect } from "vitest";
import { finalPriority, normalizePhone, priorityRank } from "@/lib/callPriority";
import { normalizeFonioPayload, safeEqual } from "../../supabase/functions/_shared/fonioPayload";
import { availabilityStatus, searchProducts, matchCaller, type LookupProduct, type CallerRow } from "../../supabase/functions/_shared/liveLookup";

describe("callPriority", () => {
  const base = { callDate: "2026-10-01" };
  it("Schaden mindestens heute", () => {
    expect(finalPriority({ ...base, aiPriority: "woche", intent: "complaint_damage", rentalStart: null }).priority).toBe("heute");
  });
  it("Mietbeginn in 48h ergibt sofort", () => {
    expect(finalPriority({ ...base, aiPriority: "woche", intent: "rental_inquiry", rentalStart: "2026-10-03" }).priority).toBe("sofort");
    expect(finalPriority({ ...base, aiPriority: "woche", intent: "rental_inquiry", rentalStart: "2026-10-10" }).priority).toBe("heute");
  });
  it("Info bleibt Info, höhere KI-Priorität bleibt", () => {
    expect(finalPriority({ ...base, aiPriority: "info", intent: "info", rentalStart: null }).priority).toBe("info");
    expect(finalPriority({ ...base, aiPriority: "sofort", intent: "info", rentalStart: null }).priority).toBe("sofort");
  });
  it("Reihenfolge", () => { expect(priorityRank("sofort")).toBeLessThan(priorityRank("info")); });
  it("Telefonnummern normalisieren", () => {
    expect(normalizePhone("+49 2151 4179904")).toBe(normalizePhone("02151 / 417 990 4"));
    expect(normalizePhone("123")).toBeNull();
  });
});

describe("fonio payload", () => {
  it("liest verschachtelte und alternative Feldnamen", () => {
    const c = normalizeFonioPayload({ context: { id: "abc" }, callerNumber: "+4915112345678", summary: "Kunde will Bagger", audioLink: "https://x.y/a.mp3", duration: "125", transcript: [{ role: "user", text: "Hallo" }, { role: "assistant", text: "Hi" }] });
    expect(c.externalId).toBe("abc");
    expect(c.callerPhone).toBe("+4915112345678");
    expect(c.transcript).toBe("user: Hallo\nassistant: Hi");
    expect(c.durationSeconds).toBe(125);
    expect(c.recordingUrl).toBe("https://x.y/a.mp3");
  });
  it("verwirft unsichere Aufnahme-Links", () => {
    expect(normalizeFonioPayload({ audioLink: "javascript:alert(1)" }).recordingUrl).toBeNull();
  });
  it("Schlüsselvergleich", () => { expect(safeEqual("a", "a")).toBe(true); expect(safeEqual("a", "ab")).toBe(false); });
});

describe("live lookup", () => {
  const rows: LookupProduct[] = [
    { slug: "mb18", name: "Minibagger 1,8 t", model_name: null, category: "Erdbewegung", subcategory: null, rentware_code: { krefeld: "X" }, price_per_day: "129 €", price_weekend: null, price_per_month: null, price_unit_label: null },
    { slug: "mb6", name: "Minibagger 6 t", model_name: null, category: "Erdbewegung", subcategory: null, rentware_code: null, price_per_day: null, price_weekend: null, price_per_month: null, price_unit_label: null },
    { slug: "rp", name: "Rüttelplatte", model_name: null, category: "Verdichtung", subcategory: null, rentware_code: null, price_per_day: "49 €", price_weekend: null, price_per_month: null, price_unit_label: null },
  ];
  it("findet passende Größe zuerst", () => {
    const r = searchProducts(rows, "Minibagger 1,8 Tonnen", "krefeld");
    expect(r[0].slug).toBe("mb18");
    expect(r[0].preise.tag).toBe("129 €");
  });
  it("ohne Preis: auf Anfrage", () => {
    expect(searchProducts(rows, "Minibagger 6 t", null)[0].preis_hinweis).toBe("Preis auf Anfrage");
  });
  it("nichts Passendes", () => { expect(searchProducts(rows, "Hüpfburg", null)).toEqual([]); });
  it("Verfügbarkeitsstatus", () => {
    expect(availabilityStatus(null, 0, 1)).toBe("unbekannt");
    expect(availabilityStatus(5, 5, 1)).toBe("ausgebucht");
    expect(availabilityStatus(5, 4, 1)).toBe("knapp");
    expect(availabilityStatus(10, 0, 1)).toBe("verfuegbar");
  });
});

describe("Anrufererkennung (Inbound Webhook)", () => {
  const rows: CallerRow[] = [
    { first_name: "Luca", last_name: "Sandhoff", company_name: "SLT", location: "krefeld", phone: "02151 / 417 990 4" },
  ];
  it("erkennt bekannten Kunden trotz Formatierung", () => {
    const c = matchCaller(rows, "+49 2151 4179904");
    expect(c.bekannt).toBe(true);
    expect(c.name).toBe("Luca Sandhoff");
    expect(c.firma).toBe("SLT");
    expect(c.standort).toBe("Krefeld");
  });
  it("unbekannte Nummer bleibt unbekannt", () => {
    expect(matchCaller(rows, "+49 151 99999999").bekannt).toBe(false);
    expect(matchCaller(rows, null).bekannt).toBe(false);
  });
});

import { priorityDisplayLabel } from "@/lib/callPriority";
describe("priorityDisplayLabel", () => {
  const now = new Date("2026-10-18T08:00:00+02:00");
  it("Heute am Anruftag", () => expect(priorityDisplayLabel("heute", "2026-10-18T06:30:00+02:00", now)).toBe("Heute"));
  it("Gestern am Folgetag", () => expect(priorityDisplayLabel("heute", "2026-10-17T23:30:00+02:00", now)).toBe("Gestern"));
  it("Datum danach", () => expect(priorityDisplayLabel("heute", "2026-10-15T10:00:00+02:00", now)).toBe("Seit 15.10."));
  it("Diese Woche nur in der Anrufwoche", () => {
    expect(priorityDisplayLabel("woche", "2026-10-13T10:00:00+02:00", new Date("2026-10-16T10:00:00+02:00"))).toBe("Diese Woche");
    expect(priorityDisplayLabel("woche", "2026-10-13T10:00:00+02:00", new Date("2026-10-20T08:00:00+02:00"))).toBe("Woche vom 12.10.");
  });
  it("Sofort bleibt", () => expect(priorityDisplayLabel("sofort", "2026-10-01T10:00:00+02:00", now)).toBe("Sofort"));
});
