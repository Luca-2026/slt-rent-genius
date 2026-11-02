import { describe, expect, it } from "vitest";
import { followupSequence, OFFER_FOLLOWUP_INTERVAL_MS } from "../../supabase/functions/_shared/offer-followup";
const start = "2026-11-02T10:00:00Z";
const end = "2026-11-12T10:00:00Z";
describe("Angebotsnachfrage alle zwei Tage", () => {
  it("hat genau 48 Stunden Abstand", () => expect(OFFER_FOLLOWUP_INTERVAL_MS).toBe(172800000));
  it("sendet nicht vor 48 Stunden", () => expect(followupSequence(start, null, end, new Date("2026-11-04T09:59:59Z"))).toBeNull());
  it("erste Nachfrage exakt nach 48 Stunden", () => expect(followupSequence(start, null, end, new Date("2026-11-04T10:00:00Z"))).toBe(1));
  it("wiederholt erst 48 Stunden nach tatsächlichem Versand", () => expect(followupSequence(start, "2026-11-04T10:15:00Z", end, new Date("2026-11-06T10:14:59Z"))).toBeNull());
  it("zweite Nachfrage nach weiteren zwei Tagen", () => expect(followupSequence(start, "2026-11-04T10:15:00Z", end, new Date("2026-11-06T10:15:00Z"))).toBe(2));
  it("endet exakt an Gültigkeitsgrenze oder Mietbeginn", () => expect(followupSequence(start, null, "2026-11-04T10:00:00Z", new Date("2026-11-04T10:00:00Z"))).toBeNull());
  it("erinnert nicht ohne erfolgreich versandtes Angebot", () => expect(followupSequence(null, null, end, new Date("2026-11-06T10:00:00Z"))).toBeNull());
});