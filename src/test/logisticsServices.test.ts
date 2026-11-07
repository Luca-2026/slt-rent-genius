import { describe, expect, it } from "vitest";
import { logisticsService, migrateServiceCosts, serviceUnit } from "@/components/b2b/inquiries/logisticsServices";
import { lineTotal } from "@/components/b2b/inquiries/offerMath";

describe("optional setup and dismantle services", () => {
  it("charges personnel hours independently of rental duration", () => {
    const line = logisticsService("setup", "personnel_hours", 2.5, 40);
    expect(lineTotal(line)).toBe(100);
    expect(line.period_free).toBe(true);
    expect(serviceUnit(line)).toBe("personnel_hours");
  });
  it("supports a separate dismantle daily flat rate", () => {
    const line = logisticsService("dismantle", "daily", 2, 180);
    expect(lineTotal(line)).toBe(360);
    expect(serviceUnit(line)).toBe("daily");
  });
  it("migrates legacy costs once without doubling existing service lines", () => {
    const lines = migrateServiceCosts([], 100, 50);
    expect(lines.reduce((sum, line) => sum + lineTotal(line), 0)).toBe(150);
    expect(migrateServiceCosts(lines, 100, 50)).toHaveLength(2);
  });
});