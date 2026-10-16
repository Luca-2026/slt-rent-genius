import { describe, it, expect } from "vitest";
import { callDateLabel } from "@/lib/callDateLabel";

// Jetzt: Fr 16.10.2026, 00:30 Uhr Berlin (= 15.10. 22:30 UTC)
const now = new Date("2026-10-15T22:30:00Z");

describe("callDateLabel", () => {
  it("Anruf von gestern 23:30 (Berlin) zeigt nicht Heute", () => {
    // 15.10. 23:30 Berlin = 21:30 UTC, nur eine Stunde vor „jetzt“
    expect(callDateLabel("2026-10-15T21:30:00Z", now)).toBe("Gestern, 23:30");
  });
  it("Anruf nach Mitternacht Berlin ist Heute, obwohl UTC noch Vortag", () => {
    expect(callDateLabel("2026-10-15T22:10:00Z", now)).toBe("Heute, 00:10");
  });
  it("innerhalb von 7 Tagen mit Wochentag", () => {
    expect(callDateLabel("2026-10-13T08:00:00Z", now)).toBe("Di, 13.10., 10:00");
  });
  it("ab sieben Tagen mit Jahr", () => {
    expect(callDateLabel("2026-10-09T08:00:00Z", now)).toBe("09.10.2026, 10:00");
  });
});
