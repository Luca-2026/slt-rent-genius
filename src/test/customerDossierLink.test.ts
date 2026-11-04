import { describe, expect, it } from "vitest";
import { customerDossierPath, customerDossierReturnPath, customerDossierUrl } from "@/lib/customerDossierLink";

describe("direct customer dossier links", () => {
  it("targets the persisted customer in read-only overview mode", () => {
    expect(customerDossierPath("crm-123")).toBe("/b2b/kundendaten?kunde=crm-123&aktion=ansehen");
  });
  it("uses only the public portal domain in emails", () => {
    expect(customerDossierUrl("crm-123")).toBe("https://app.slt-rental.de/b2b/kundendaten?kunde=crm-123&aktion=ansehen");
  });
  it("preserves the exact customer after login", () => {
    expect(customerDossierReturnPath(customerDossierPath("crm-123"))).toBe(customerDossierPath("crm-123"));
  });
  it("rejects external and unrelated destinations", () => {
    for (const value of [null, "https://evil.example", "//evil.example", "/b2b/start", "/b2b/kundendaten?kunde=crm-123&aktion=bearbeiten", "/b2b/kundendaten?aktion=ansehen"]) {
      expect(customerDossierReturnPath(value)).toBeNull();
    }
  });
});