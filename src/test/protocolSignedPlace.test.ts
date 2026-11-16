import { describe, expect, it } from "vitest";
import { protocolSignedPlace } from "../../supabase/functions/_shared/protocol-signed-place";
describe("handover signature place", () => {
  it("uses delivery city rather than the branch", () => expect(protocolSignedPlace("delivery", undefined, { delivery_requested: true, delivery_city: "Düsseldorf" }, "Mülheim an der Ruhr")).toBe("Düsseldorf"));
  it("keeps a manually entered place", () => expect(protocolSignedPlace("delivery", " Baustelle Essen ", { delivery_requested: true, delivery_city: "Düsseldorf" }, "Mülheim an der Ruhr")).toBe("Baustelle Essen"));
  it("does not replace a deliberately removed place", () => expect(protocolSignedPlace("delivery", "", { delivery_requested: true, delivery_city: "Düsseldorf" }, "Mülheim an der Ruhr")).toBe(""));
  it("does not invent a place for delivery without a city", () => expect(protocolSignedPlace("delivery", undefined, { delivery_requested: true, delivery_city: null }, "Mülheim an der Ruhr")).toBe(""));
  it("retains pickup branch defaults", () => expect(protocolSignedPlace("delivery", undefined, { delivery_requested: false }, "Bonn")).toBe("Bonn"));
  it("leaves returns unchanged", () => expect(protocolSignedPlace("return", "Essen", { delivery_requested: true, delivery_city: "Essen" }, "Bonn")).toBe("Bonn"));
});