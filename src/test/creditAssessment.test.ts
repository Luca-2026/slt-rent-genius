import { describe, it, expect } from "vitest";
import { canManageCreditChecks, creditAssessmentSchema, findCreditCustomerMatches } from "@/lib/creditAssessment";
import { visibleGroups } from "@/components/b2b/StaffNav";

describe("Bonitätsprüfung", () => {
  const business = { id: "1", customer_kind: "b2b", company_name: "Müller & Söhne GmbH", first_name: null, last_name: null, postal_code: "53111", city: "Bonn" };
  it("findet Firmen unabhängig von Umlauten und Satzzeichen", () => {
    expect(findCreditCustomerMatches([business], "Muller & Sohne").map((c) => c.id)).toEqual(["1"]);
  });
  it("priorisiert den passenden Standort bei gleichnamigen Firmen ohne automatische Zuordnung", () => {
    const other = { ...business, id: "2", postal_code: "47798", city: "Krefeld" };
    expect(findCreditCustomerMatches([other, business], "Müller", "53111", "Bonn").map((c) => c.id)).toEqual(["1", "2"]);
  });
  it("schließt Privatkunden und zu kurze Suchbegriffe aus", () => {
    expect(findCreditCustomerMatches([{ ...business, customer_kind: "b2c" }], "Müller")).toEqual([]);
    expect(findCreditCustomerMatches([business], "Mü")).toEqual([]);
  });
  it("erlaubt Admins und aktiven Niederlassungsleitern den Zugriff", () => {
    expect(canManageCreditChecks(true, false, false)).toBe(true);
    expect(canManageCreditChecks(false, true, true)).toBe(true);
  });
  it("sperrt Standortmitarbeiter, Kunden und inaktive Niederlassungsleiter", () => {
    expect(canManageCreditChecks(false, false, true)).toBe(false);
    expect(canManageCreditChecks(false, false, false)).toBe(false);
    expect(canManageCreditChecks(false, true, false)).toBe(false);
  });
  it("zeigt den Bonitätsbereich nur mit passendem Recht", () => {
    const paths = (admin: boolean, credit: boolean) => visibleGroups(admin, true, credit).flatMap((g) => g.items.map((i) => i.path));
    expect(paths(false, false)).not.toContain("/b2b/bonitaetspruefung");
    expect(paths(false, true)).toContain("/b2b/bonitaetspruefung");
    expect(paths(true, false)).toContain("/b2b/bonitaetspruefung");
  });
  it("bewahrt eine CreditSafe-Empfehlung über 2.000 EUR ohne Kreditvergabe", () => {
    const result = creditAssessmentSchema.parse({ company_name: "Test Einzelunternehmen", rating: "A", recommended_limit: 5000, notes: "" });
    expect(result.recommended_limit).toBe(5000);
    expect(result).not.toHaveProperty("credit_limit");
  });
  it("akzeptiert null Euro und lehnt negative oder fehlende Ergebnisse ab", () => {
    expect(creditAssessmentSchema.safeParse({ company_name: "Test", rating: null, recommended_limit: 0, notes: "" }).success).toBe(true);
    expect(creditAssessmentSchema.safeParse({ company_name: "Test", rating: null, recommended_limit: -1, notes: "" }).success).toBe(false);
    expect(creditAssessmentSchema.safeParse({ company_name: "Test", rating: null, recommended_limit: null, notes: "" }).success).toBe(false);
  });
});