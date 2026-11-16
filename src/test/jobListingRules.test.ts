import { describe, expect, it } from "vitest";
import { jobListings } from "../components/karriere/jobData";
import { SLT_JOBPOSTING_JSONLD } from "../components/SEO";
import { ALL_ROUTES } from "../data/seo-routes-rental";

describe("recruitment terms", () => {
  it("offers the delivery minijob at exactly 20 EUR gross per hour", () => {
    const job = jobListings.find((entry) => entry.id === "lieferfahrer");
    expect(job?.salaryMin).toBe(20);
    expect(job?.salaryMax).toBe(20);
    expect(job?.salaryUnit).toBe("HOUR");
  });
  it("classifies the delivery role as a minijob rather than full time", () => {
    const job = jobListings.find((entry) => entry.id === "lieferfahrer");
    expect(job?.minijob).toBe(true);
    expect(job?.employmentType).toEqual(["PART_TIME"]);
  });
  it.each(["lieferfahrer"])("offers %s equally at Bonn and Krefeld", (id) => {
    const job = jobListings.find((entry) => entry.id === id);
    expect(job?.locations.map((location) => location.city).sort()).toEqual(["Bonn", "Krefeld"]);
    expect(job?.specificFields.find((field) => field.id === "preferredLocation")?.options).toEqual(expect.arrayContaining(["Bonn", "Krefeld"]));
  });
  it("removes the sales vacancy", () => {
    expect(jobListings.some((job) => job.id === "vertrieb")).toBe(false);
  });
  it("offers the new operational vacancy only in Bonn", () => {
    const job = jobListings.find((entry) => entry.id === "standortmitarbeiter-bonn");
    expect(job?.locations.map((location) => location.city)).toEqual(["Bonn"]);
    expect(job?.specificFields.find((field) => field.id === "preferredLocation")?.options).toEqual(["Bonn"]);
  });
  it("requires a BE licence answer for the Bonn vacancy", () => {
    const job = jobListings.find((entry) => entry.id === "standortmitarbeiter-bonn");
    expect(job?.askDriversLicense).toBe(true);
    expect(job?.specificFields.find((field) => field.id === "driversLicense")?.required).toBe(true);
  });
  it("publishes the Bonn base salary at 3500 EUR gross per month, excluding the variable bonus", () => {
    const job = jobListings.find((entry) => entry.id === "standortmitarbeiter-bonn");
    expect(job?.salaryMin).toBe(3500);
    expect(job?.salaryMax).toBe(3500);
    expect(job?.salaryUnit).toBe("MONTH");
    if (!job) throw new Error("Missing Bonn vacancy");
    const expected = {
      "@type": "MonetaryAmount",
      currency: "EUR",
      value: { "@type": "QuantitativeValue", minValue: 3500, maxValue: 3500, unitText: "MONTH" },
    };
    const live = SLT_JOBPOSTING_JSONLD({
      title: job.title,
      description: job.description,
      datePosted: job.datePosted ?? "",
      employmentType: job.employmentType,
      identifier: job.id,
      url: `https://www.slt-rental.de/karriere/${job.slug}/`,
      locations: job.locations,
      baseSalary: { min: job.salaryMin ?? 0, max: job.salaryMax ?? 0, unitText: job.salaryUnit ?? "YEAR" },
    });
    expect(live.baseSalary).toEqual(expected);
    const route = ALL_ROUTES.find((entry) => entry.path === `/karriere/${job.slug}/`);
    expect(JSON.stringify(route)).toContain(JSON.stringify(expected));
  });
});