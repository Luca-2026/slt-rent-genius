import { describe, it, expect } from "vitest";
import { cartDeliveryQuote } from "../../supabase/functions/_shared/delivery-tariffs";

describe("cartDeliveryQuote – teuerster Artikel bestimmt den Liefertarif", () => {
  it("2,7t Bagger + 10 Stehtische nutzt Tarif C des Baggers (Lieferung + Abholung)", () => {
    const q = cartDeliveryQuote([
      { category: "moebel-zelte", product_name: "Stehtisch", quantity: 10 },
      { category: "erdbewegung", product_name: "2,7t Minibagger", quantity: 1 },
    ], 15);
    expect(q).toMatchObject({ status: "priced", tarif: "C", product_name: "2,7t Minibagger", two_machines: false, brutto: 260 });
  });
  it("nur Eventartikel nutzt Tarif A", () => {
    expect(cartDeliveryQuote([{ category: "moebel-zelte", product_name: "Stehtisch", quantity: 10 }], 10)).toMatchObject({ status: "priced", tarif: "A", brutto: 160 });
  });
  it("zwei Maschinen erhalten den Maschinen-Aufschlag des höchsten Tarifs", () => {
    expect(cartDeliveryQuote([{ category: "erdbewegung", product_name: "2t Minibagger", quantity: 2 }], 5)).toMatchObject({ tarif: "B", two_machines: true, brutto: 195 });
  });
  it("Geräte über 3 t sind Tieflader und damit auf Anfrage", () => {
    expect(cartDeliveryQuote([{ category: "erdbewegung", product_name: "6t Minibagger", quantity: 1 }, { category: "werkzeuge", product_name: "Rüttelplatte", quantity: 1 }], 10)).toMatchObject({ status: "on_request", reason: "tieflader" });
  });
  it("über 50 km ist auf Anfrage", () => {
    expect(cartDeliveryQuote([{ category: "werkzeuge", product_name: "Steinsäge", quantity: 1 }], 55)).toMatchObject({ status: "on_request", reason: "distance" });
  });
});
