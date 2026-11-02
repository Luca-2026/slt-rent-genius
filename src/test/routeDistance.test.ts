import { afterEach, expect, it, vi } from "vitest";
import { routeDistance } from "../../supabase/functions/_shared/route-distance";
afterEach(() => vi.unstubAllGlobals());
it("berechnet auch eine erfolgreiche Null-Kilometer-Route am Standort", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ routes: [{ duration: "0s" }] }) }));
  const result = await routeDistance("test", "krefeld", { address: "Anrather Straße 291, 47807 Krefeld" });
  expect(result?.distanceKm).toBe(0);
  expect(result?.roundedKm).toBe(5);
});