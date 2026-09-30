import { describe, it, expect } from "vitest";
import { needsAction, parseActionFilter, registrationDate } from "@/lib/customerActions";

const base = { status: "approved", credit_limit_requested_at: null, deletion_requested_at: null, credit_limit: 0 };
describe("customerActions", () => {
  it("erkennt offene Freischaltung", () => {
    expect(needsAction({ ...base, status: "pending" }, "freigabe")).toBe(true);
    expect(needsAction(base, "freigabe")).toBe(false);
  });
  it("Kreditlimit-Antrag offen bis Limit vergeben", () => {
    const req = { ...base, credit_limit_requested_at: "2026-09-01" };
    expect(needsAction(req, "kreditlimit")).toBe(true);
    expect(needsAction({ ...req, credit_limit: 5000 }, "kreditlimit")).toBe(false);
    expect(needsAction({ ...req, status: "rejected" }, "kreditlimit")).toBe(false);
  });
  it("Löschantrag und Sammelfilter", () => {
    const del = { ...base, deletion_requested_at: "2026-09-01" };
    expect(needsAction(del, "loeschung")).toBe(true);
    expect(needsAction(del, "alle")).toBe(true);
    expect(needsAction(base, "alle")).toBe(false);
  });
  it("Filter-Parsing und Registrierungsdatum", () => {
    expect(parseActionFilter("kreditlimit")).toBe("kreditlimit");
    expect(parseActionFilter("quatsch")).toBe("none");
    expect(registrationDate({ created_at: "2026-09-10" }, { created_at: "2026-03-01" })).toBe("2026-03-01");
    expect(registrationDate({ created_at: "2026-09-10" }, null)).toBe("2026-09-10");
  });
});
describe("registrationDate für übernommene Kunden", () => {
  it("nimmt die erste Anfrage, wenn sie vor der Anlage liegt", () => {
    expect(registrationDate({ created_at: "2026-09-30" }, null, "2026-04-02")).toBe("2026-04-02");
    expect(registrationDate({ created_at: "2026-01-01" }, null, "2026-04-02")).toBe("2026-01-01");
  });
});
