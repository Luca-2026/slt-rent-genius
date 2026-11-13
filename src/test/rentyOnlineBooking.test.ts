import { describe, expect, it } from "vitest";
import { signBookingRedirect } from "../../supabase/functions/public-chat/online-booking-policy";

describe("Renty Halteverbot online buchen", () => {
  it("Komplettset mit Aufstellung/Abholung ohne Beantragung geht nach Bonn", () => {
    const result = signBookingRedirect([{ product_name: "Halteverbotsschilder-Komplettset inklusive Aufstellung und Abholung, ohne Beantragung" }], "bonn");
    expect(result?.online_booking_required).toBe(true);
    expect(result?.ok).toBe(false);
    expect(result?.booking_urls).toEqual(["https://www.slt-rental.de/mieten/bonn/absperrtechnik/halteverbotsschilder-set/"]);
  });
  it("erkennt die Artikel-URL auch bei freier Bezeichnung", () => {
    expect(signBookingRedirect([{ product_name: "Komplettpaket", product_url: "https://www.slt-rental.de/mieten/krefeld/absperrtechnik/halteverbotsschilder-set/" }], "krefeld")?.online_booking_required).toBe(true);
  });
  it("gemischte Schilderanfrage kann die Sperre nicht umgehen", () => {
    expect(signBookingRedirect([{ product_name: "Bagger" }, { product_name: "Halteverbotszone mit Aufstellung" }], "bonn")?.ok).toBe(false);
  });
  it("andere Absperrartikel und Bagger bleiben manuell anfragbar", () => {
    expect(signBookingRedirect([{ product_name: "Bauzaun" }, { product_name: "VZ 123, RA2" }, { product_name: "2t Minibagger" }], "bonn")).toBeNull();
  });
});