import { describe, expect, it } from "vitest";
import { getLocationWhatsAppContact } from "@/data/locationWhatsAppContacts";

describe("Location WhatsApp contacts", () => {
  it("routes Krefeld to Benedikt's provided international number", () => {
    expect(getLocationWhatsAppContact("krefeld")).toEqual({
      name: "Benedikt Nöchel",
      phone: "+49 15789150872",
      whatsappUrl: "https://wa.me/4915789150872",
    });
  });
  it("keeps Bonn's contact separate", () => {
    expect(getLocationWhatsAppContact("Bonn")?.whatsappUrl).toBe("https://wa.me/4915757151584");
  });
  it("does not assign a personal contact to other locations", () => {
    expect(getLocationWhatsAppContact("muelheim")).toBeNull();
  });
});