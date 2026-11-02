import { describe, expect, it } from "vitest";
import { getReviewUrl } from "@/components/reviews/GoogleReviews";

describe("Standortbezogene Bewertungslinks", () => {
  it("verwendet den vorhandenen Krefelder Standort", () => {
    expect(getReviewUrl(" Krefeld ")).toBe("https://search.google.com/local/writereview?placeid=ChIJRyajcmSxuEcRAHvlWgXfF5c");
  });
  it("verwendet den vorhandenen Bonner Standort", () => {
    expect(getReviewUrl("BONN")).toBe("https://search.google.com/local/writereview?placeid=ChIJf2ituEblvkcRUGua8HYhHCA");
  });
  it("erfindet keinen Link für Mülheim oder unbekannte Standorte", () => {
    expect(getReviewUrl("Mülheim an der Ruhr")).toBeUndefined();
    expect(getReviewUrl("muelheim")).toBeUndefined();
    expect(getReviewUrl("unknown")).toBeUndefined();
  });
});