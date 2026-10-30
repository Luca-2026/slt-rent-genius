import { describe, expect, it } from "vitest";
import { initialRentalInquiryFilters } from "@/lib/rentalInquiryFilters";
import { matchesInquiryListFilter } from "@/lib/inquiryStatus";

describe("rental inquiry entry filters", () => {
  it("starts Bonn employees with all unclaimed open Bonn inquiries", () => {
    const filters = initialRentalInquiryFilters("", false, "Bonn");
    expect(filters?.get("standort")).toBe("bonn");
    expect(filters?.get("status")).toBe("unprocessed");
    expect(filters?.has("meine")).toBe(false);
    expect(matchesInquiryListFilter({ status: "new", assigned_to: null }, "unprocessed")).toBe(true);
    expect(matchesInquiryListFilter({ status: "done" }, "unprocessed")).toBe(false);
  });
  it("uses each employee's branch, including Mülheim an der Ruhr", () => {
    expect(initialRentalInquiryFilters("", false, "Krefeld")?.get("standort")).toBe("krefeld");
    expect(initialRentalInquiryFilters("", false, "Mülheim an der Ruhr")?.get("standort")).toBe("muelheim");
  });
  it("keeps explicit filters and detail return state untouched", () => {
    expect(initialRentalInquiryFilters("?status=all&standort=krefeld", false, "Bonn")).toBeNull();
    expect(initialRentalInquiryFilters("", true, "Bonn")).toBeNull();
  });
  it("does not invent a branch for employees without one", () => {
    expect(initialRentalInquiryFilters("", false, null)?.get("status")).toBe("unprocessed");
    expect(initialRentalInquiryFilters("", false, null)?.has("standort")).toBe(false);
  });
});