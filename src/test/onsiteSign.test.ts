import { describe, expect, it } from "vitest";
import { acceptanceChannelLabel, canSignOfferOnSite } from "@/lib/onsiteSign";

describe("canSignOfferOnSite", () => {
  it("erlaubt Vor-Ort-Unterschrift nur mit versendetem Angebot und offener Annahme", () => {
    expect(canSignOfferOnSite({ offerNumber: "ANG-M-2026-10-0041-2", status: "offer_sent", alreadyAccepted: false })).toBe(true);
    expect(canSignOfferOnSite({ offerNumber: "ANG-M-2026-10-0041-2", status: "in_progress", alreadyAccepted: false })).toBe(true);
  });
  it("sperrt ohne Angebot, nach Annahme und bei abgeschlossenen Vorgängen", () => {
    expect(canSignOfferOnSite({ offerNumber: null, status: "offer_sent", alreadyAccepted: false })).toBe(false);
    expect(canSignOfferOnSite({ offerNumber: "ANG-1", status: "offer_sent", alreadyAccepted: true })).toBe(false);
    expect(canSignOfferOnSite({ offerNumber: "ANG-1", status: "accepted", alreadyAccepted: true })).toBe(false);
    expect(canSignOfferOnSite({ offerNumber: "ANG-1", status: "rejected", alreadyAccepted: false })).toBe(false);
    expect(canSignOfferOnSite({ offerNumber: "ANG-1", status: "done", alreadyAccepted: false })).toBe(false);
  });
});

describe("acceptanceChannelLabel", () => {
  it("unterscheidet online und vor Ort", () => {
    expect(acceptanceChannelLabel("onsite")).toBe("vor Ort unterschrieben");
    expect(acceptanceChannelLabel("online")).toBe("online angenommen");
    expect(acceptanceChannelLabel(null)).toBe("online angenommen");
  });
});
