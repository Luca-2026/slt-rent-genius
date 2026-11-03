import { describe, it, expect } from "vitest";
import { bookingContactErrors, BOOKING_CONTACT_FIELDS } from "../../supabase/functions/_shared/booking-contact";
import { readCartDraft, writeCartDraft } from "@/components/rental/useCartDraft";
const contact = { name: "Luca Test", email: "luca@sandhoff.org", phone: "0123456789", street: "Teststraße 1", postalCode: "47807", city: "Krefeld" };
describe("Verpflichtende Buchungsdaten", () => {
  for (const field of BOOKING_CONTACT_FIELDS) it(`sperrt ohne ${field}`, () => { expect(bookingContactErrors({ ...contact, [field]: "   " })[field]).toBeDefined(); });
  it("akzeptiert vollständige Kontaktdaten", () => { expect(bookingContactErrors(contact)).toEqual({}); });
  it("sperrt ungültige E-Mail, Telefon und fehlende Hausnummer", () => {
    expect(bookingContactErrors({ ...contact, email: "abc", phone: "abc", street: "Teststraße" })).toMatchObject({ email: expect.any(String), phone: expect.any(String), street: expect.any(String) });
  });
});
describe("Kontaktdaten innerhalb der Warenkorbfrist", () => {
  const empty = { ...contact, name: "" };
  it("stellt nach Zurückgehen, Schließen und Neuladen Daten desselben Warenkorbs wieder her", () => {
    const deadline = Date.now() + 900000;
    writeCartDraft("test", "same-cart", deadline, contact);
    expect(readCartDraft("test", "same-cart", deadline, empty)).toEqual(contact);
  });
  it("übernimmt nichts in einen anderen Warenkorb", () => {
    expect(readCartDraft("test", "new-cart", Date.now() + 900000, empty)).toEqual(empty);
  });
  it("stellt abgelaufene Daten nicht wieder her", () => {
    const deadline = Date.now() + 100;
    writeCartDraft("test", "expired", deadline, contact);
    expect(readCartDraft("test", "expired", Date.now() - 1, empty)).toEqual(empty);
  });
});