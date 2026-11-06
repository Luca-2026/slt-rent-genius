import { describe, expect, it } from "vitest";
import { isMyTask } from "@/lib/myTasks";

const sign = (location: string) => ({ assigned_to: null, status: "sent", location });

describe("isMyTask", () => {
  it("shows unassigned Krefeld sign work to Krefeld staff", () => {
    expect(isMyTask(sign("krefeld"), "u1", "krefeld")).toBe(true);
  });
  it("hides Krefeld sign work from Bonn staff", () => {
    expect(isMyTask(sign("krefeld"), "u1", "bonn")).toBe(false);
  });
  it("routes Mülheim tasks to Krefeld staff", () => {
    expect(isMyTask(sign("muelheim"), "u1", "krefeld")).toBe(true);
  });
  it("does not show tasks assigned to someone else", () => {
    expect(isMyTask({ assigned_to: "u2", status: "sent", location: "bonn" }, "u1", "bonn")).toBe(false);
  });
  it("always shows tasks assigned to me", () => {
    expect(isMyTask({ assigned_to: "u1", status: "sent", location: "bonn" }, "u1", null)).toBe(true);
  });
  it("hides done tasks", () => {
    expect(isMyTask({ ...sign("bonn"), status: "done" }, "u1", "bonn")).toBe(false);
  });
});

describe("home calendar window", () => {
  it("covers today plus next working days, skipping Sunday as a working day", async () => {
    const { workingDayWindowEnd } = await import("@/lib/calendarEntries");
    // Fr 06.11.2026 → Fr, Sa, Mo
    expect(workingDayWindowEnd("2026-11-06", 3)).toBe("2026-11-09");
    // Mo 09.11.2026 → Mo, Di, Mi
    expect(workingDayWindowEnd("2026-11-09", 3)).toBe("2026-11-11");
  });
  it("lists Friday, Saturday and Monday as the three dashboard days on a Friday", async () => {
    const { workingDaysInWindow } = await import("@/lib/calendarEntries");
    expect(workingDaysInWindow("2026-11-06", "2026-11-09")).toEqual(["2026-11-06", "2026-11-07", "2026-11-09"]);
  });
  it("filters calendar kinds into counter (pickup/return) and transport (delivery/collection)", async () => {
    const { matchesKindFilter } = await import("@/lib/calendarEntries");
    expect(["pickup", "return", "delivery", "collection"].filter((k) => matchesKindFilter(k as never, "counter"))).toEqual(["pickup", "return"]);
    expect(["pickup", "return", "delivery", "collection"].filter((k) => matchesKindFilter(k as never, "transport"))).toEqual(["delivery", "collection"]);
  });
});
