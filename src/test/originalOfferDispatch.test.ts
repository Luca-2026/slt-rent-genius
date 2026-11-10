import { describe, expect, it } from "vitest";
import { originalOfferDispatch } from "../../supabase/functions/resend-inquiry-offer/offer";

const inquiry = { id: "order", customer_email: "corrected@example.org", offer_number: "ANG-M-0045", offer_file_url: "https://storage.example/storage/v1/object/sign/b2b-invoices/inquiry-offers/rental/order/ANG-M-0045.pdf?token=expired", offer_payload: { version: 1, items: [{ unit_price: 100 }] } };
describe("Unveränderter Angebotsneuversand", () => {
  it("uses the saved corrected email, original number and original file without changing the offer", () => {
    const before = structuredClone(inquiry);
    expect(originalOfferDispatch(inquiry, "rental", "corrected@example.org")).toEqual({ email: "corrected@example.org", number: "ANG-M-0045", path: "inquiry-offers/rental/order/ANG-M-0045.pdf" });
    expect(inquiry).toEqual(before);
  });
  it("rejects sending to a stale address after a correction", () => {
    expect(() => originalOfferDispatch(inquiry, "rental", "wrong@example.org")).toThrow("Kundenadresse wurde geändert");
  });
  it("keeps the originally accepted offer rather than an amended AB snapshot", () => {
    expect(originalOfferDispatch({ ...inquiry, offer_number: "AB-NEW", original_accepted_offer: { offer_number: "ANG-ORIGINAL", offer_file_url: inquiry.offer_file_url } }, "rental").number).toBe("ANG-ORIGINAL");
  });
  it("supports unchanged sales offers", () => {
    expect(originalOfferDispatch({ ...inquiry, offer_file_url: "inquiry-offers/sales/order/ANG-V.pdf" }, "sales").path).toBe("inquiry-offers/sales/order/ANG-V.pdf");
  });
  it("rejects another order's PDF", () => {
    expect(() => originalOfferDispatch({ ...inquiry, offer_file_url: "inquiry-offers/rental/other/file.pdf" }, "rental")).toThrow("nicht zugeordnet");
  });
});