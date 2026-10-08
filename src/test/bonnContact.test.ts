import { describe, expect, it } from "vitest";
import { bonnDirectContact } from "@/data/bonnContact";

describe("Bonn direct contact", () => {
  it("uses the provided phone number with its international WhatsApp destination", () => {
    expect(bonnDirectContact.phone).toBe("01575 7151584");
    expect(bonnDirectContact.whatsappUrl).toBe("https://wa.me/4915757151584");
  });
});