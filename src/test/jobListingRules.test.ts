import { describe, expect, it } from "vitest";
import { jobListings } from "../components/karriere/jobData";

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
});