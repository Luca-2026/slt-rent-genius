import { describe, it, expect } from "vitest";
import { segmentOf, matchesSegment, matchesPortalRegistration, parseSegmentFilter } from "@/lib/customerSegment";

describe("customerSegment", () => {
  it("erkennt Portalkunden an Quelle oder Profil", () => {
    expect(segmentOf({ source: "b2b_portal", customer_kind: "business" })).toBe("portal");
    expect(segmentOf({ customer_kind: "business", b2b_profile_id: "x" })).toBe("portal");
  });
  it("unterscheidet Privat und Geschäftskunde", () => {
    expect(segmentOf({ customer_kind: "business", source: "product_booking" })).toBe("business");
    expect(segmentOf({ customer_kind: "b2b" })).toBe("business");
    expect(segmentOf({ customer_kind: "private" })).toBe("private");
    expect(segmentOf({ customer_kind: null })).toBe("private");
  });
  it("filtert korrekt", () => {
    expect(matchesSegment("portal", "all")).toBe(true);
    expect(matchesSegment("portal", "business")).toBe(true);
    expect(matchesSegment("portal", "private")).toBe(false);
    expect(matchesSegment("business", "business")).toBe(true);
  });
  it("liest nur gültige URL-Werte", () => {
    expect(parseSegmentFilter("portal")).toBe("business");
    expect(parseSegmentFilter("quatsch")).toBe("all");
    expect(parseSegmentFilter(null)).toBe("all");
  });
  it("zeigt im Portalfilter ausschließlich Kunden mit verknüpftem B2B-Profil", () => {
    expect(matchesPortalRegistration({ b2b_profile_id: "profil-1" }, true)).toBe(true);
    expect(matchesPortalRegistration({ b2b_profile_id: null }, true)).toBe(false);
    expect(matchesPortalRegistration({}, true)).toBe(false);
  });
  it("schränkt ohne Portalfilter die normalen Geschäftskunden nicht ein", () => {
    expect(matchesPortalRegistration({ b2b_profile_id: null }, false)).toBe(true);
    expect(matchesPortalRegistration({ b2b_profile_id: "profil-1" }, false)).toBe(true);
  });
});
