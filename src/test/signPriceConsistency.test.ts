import { describe, expect, it } from "vitest";
import { displayPrice } from "@/lib/priceDisplay";
import { signCartRentalNet, signSetupAddressKey } from "@/lib/signCartPackage";
import { signRentalGrossCents } from "../../supabase/functions/_shared/sign-direct-booking";
import type { RentalCartItem } from "@/lib/rentalCart";

const config = { enabled: true, standardGrossCents: 4900, sorglosGrossCents: 19900, sorglosOuterGrossCents: 29900, depositCents: 10000, maxRentalDays: 100 } as never;
const euro = (cents: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(cents / 100);
const iso = (offset: number) => new Date(Date.UTC(2027, 0, 4) + offset * 86400000).toISOString().slice(0, 10);
const zone = { sign_zone_street: "Hafenstraße 1", sign_zone_postal_code: "47809", sign_zone_city: "Krefeld" };
const item = (pkg: "standard" | "sorglos", days: number, quantity: number, setupCents?: number): RentalCartItem => ({
  id: "x", product_slug: "halteverbotsschilder-set", product_name: "Halteverbotsschilder-Set", location: "krefeld", quantity,
  start_date: iso(0), start_time: "08:00", end_date: iso(days - 1), end_time: "08:00", selected_addons: [], use_saturday: false, use_sunday: false,
  sign_package: pkg, ...(pkg === "sorglos" ? { ...zone, sign_setup_gross_cents: setupCents, sign_setup_quote_key: signSetupAddressKey("krefeld", { zoneStreet: zone.sign_zone_street, zonePostalCode: zone.sign_zone_postal_code, zoneCity: zone.sign_zone_city }) } : {}),
});

describe("Schilderpreise: Warenkorb = Abschluss = Datenbank", () => {
  it("zeigt im Warenkorb für jeden Tag 1–100, 1–10 Sets und alle drei Pakete denselben Bruttobetrag wie der Abschluss", () => {
    const mismatches: string[] = [];
    for (const [pkg, base] of [["standard", 4900], ["sorglos", 19900], ["sorglos", 29900]] as const) {
      for (let days = 1; days <= 100; days++) for (let quantity = 1; quantity <= 10; quantity++) {
        const checkout = (signRentalGrossCents(base, days) ?? 0) * quantity;
        const cart = displayPrice(signCartRentalNet(config, item(pkg, days, quantity, base)), "private");
        if (cart !== euro(checkout)) mismatches.push(`${pkg}/${base}/${days}T/${quantity}: ${cart} ≠ ${euro(checkout)}`);
      }
    }
    expect(mismatches).toEqual([]);
  });

  it("berechnet die vom Kunden gemeldeten Fälle exakt", () => {
    expect(signRentalGrossCents(4900, 24)).toBe(11760); // 24 Tage → 117,60 €
    expect(signRentalGrossCents(4900, 10)).toBe(4900);
    expect(signRentalGrossCents(4900, 11)).toBe(5390);
    // frühere Reservierung: 10 Tage + 1 Zusatzschild 5 € + 100 € Kaution = 154 €
    expect((signRentalGrossCents(4900, 10) ?? 0) + 500 + 10000).toBe(15400);
  });
});

import { signSetupQuotePatch } from "@/lib/signCartPackage";
describe("Rundum-Sorglos-Preis bleibt nach Adressauswahl erhalten", () => {
  it("stellt den Aufstellpreis wieder her, wenn die Adresse gleich bleibt, der gespeicherte Preis aber gelöscht wurde", () => {
    const base = item("sorglos", 24, 1, 19900);
    const cleared = { ...base, sign_setup_gross_cents: undefined, sign_setup_quote_key: undefined };
    const patch = signSetupQuotePatch(cleared, { key: base.sign_setup_quote_key ?? "", cents: 19900 });
    expect(patch).toEqual({ sign_setup_quote_key: base.sign_setup_quote_key, sign_setup_gross_cents: 19900 });
    expect(displayPrice(signCartRentalNet(config, { ...cleared, ...patch }), "private")).toBe(euro(47760));
  });
  it("ändert nichts, wenn der Preis schon stimmt (keine Endlosschleife)", () => {
    const base = item("sorglos", 24, 1, 19900);
    expect(signSetupQuotePatch(base, { key: base.sign_setup_quote_key ?? "", cents: 19900 })).toBeNull();
    expect(signSetupQuotePatch(item("standard", 5, 1), { key: "x", cents: 19900 })).toBeNull();
  });
});

import { cartQuoteTotal } from "@/lib/rentalCart";
describe("Gesamtsumme im Warenkorb = Summe der Positionen", () => {
  it("rundet die Gesamtsumme erst nach der Umsatzsteuer (24 Tage Sorglos: 477,60 €, nicht 477,59 €)", () => {
    const mismatches: string[] = [];
    for (const base of [4900, 19900, 29900]) for (let days = 1; days <= 100; days++) for (let quantity = 1; quantity <= 10; quantity++) {
      const net = signCartRentalNet(config, item(base === 4900 ? "standard" : "sorglos", days, quantity, base));
      const total = displayPrice(cartQuoteTotal([{ rental_net: net, addons: [] }]), "private");
      if (total !== euro((signRentalGrossCents(base, days) ?? 0) * quantity)) mismatches.push(`${base}/${days}/${quantity}: ${total}`);
    }
    expect(mismatches).toEqual([]);
  });
});
