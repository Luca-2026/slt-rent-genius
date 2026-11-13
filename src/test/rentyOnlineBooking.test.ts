import { describe, expect, it, vi } from "vitest";
import { signBookingRedirect } from "../../supabase/functions/public-chat/online-booking-policy";
vi.mock("https://esm.sh/@supabase/supabase-js@2.57.4", () => ({ createClient: vi.fn() }));
vi.mock("../../supabase/functions/_shared/inquiry-store.ts", () => ({ saveRentalInquiry: vi.fn(), rentalInquiryLink: vi.fn() }));

describe("Renty Halteverbot online buchen", () => {
  it("der echte Sender blockiert Schilder vor Pflichtfeldprüfung und jeglicher Speicherung", async () => {
    // Keep Deno-only server dependencies outside the browser's TypeScript graph.
    const senderPath = "../../supabase/functions/public-chat/renty-inquiry.ts";
    const storePath = "../../supabase/functions/_shared/inquiry-store.ts";
    const { submitInquiry } = await import(/* @vite-ignore */ senderPath);
    const { saveRentalInquiry } = await import(/* @vite-ignore */ storePath);
    const result = await submitInquiry({ location: "bonn", items: [{ product_name: "Halteverbotsschilder-Komplettset inklusive Aufstellung und Abholung, ohne Beantragung", quantity: 1, product_url: null }] }, { ip: "test", transcript: "Genehmigung vorhanden" });
    expect(result).toMatchObject({ ok: false, online_booking_required: true });
    expect(saveRentalInquiry).not.toHaveBeenCalled();
  });
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