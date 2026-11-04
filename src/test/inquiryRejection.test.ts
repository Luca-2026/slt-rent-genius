import { describe, expect, it } from "vitest";
import {
  normalizeRejectionDecisions,
  rejectionItemsHtml,
  rejectionItemsOf,
  rejectionTexts,
} from "../../supabase/functions/_shared/inquiry-rejection";

// Nachbau der Anfrage #EXN7VC: vier Artikel, der Bagger stand an letzter Stelle.
const inquiry = {
  product_name: "MS01 Kabellöffel 15cm Symlock",
  start_date: "2026-11-06",
  end_date: "2026-11-09",
  requested_items: [
    { product_name: "MS01 Kabellöffel 15cm Symlock", quantity: 1, start_date: "2026-11-06", end_date: "2026-11-09" },
    { product_name: "MS01 Tieflöffel 20cm/14l", quantity: 1, start_date: "2026-11-06", end_date: "2026-11-09" },
    { product_name: "MS01 Tieflöffel 50cm/45l Symlock", quantity: 1, start_date: "2026-11-06", end_date: "2026-11-09" },
    { product_name: "1t Minibagger", quantity: 1, start_date: "2026-11-06", end_date: "2026-11-09" },
  ],
};
const resolve = (raw: string) => (raw.toLowerCase().includes("bonn") ? "bonn" : "krefeld");

describe("Absage mit Entscheidung je Artikel", () => {
  it("liest alle vier angefragten Artikel, nicht nur den ersten", () => {
    const items = rejectionItemsOf("rental", inquiry);
    expect(items.map((i) => i.name)).toEqual([
      "MS01 Kabellöffel 15cm Symlock",
      "MS01 Tieflöffel 20cm/14l",
      "MS01 Tieflöffel 50cm/45l Symlock",
      "1t Minibagger",
    ]);
  });

  it("nennt in der E-Mail jeden Artikel mit Status, auch den Bagger", () => {
    const items = rejectionItemsOf("rental", inquiry);
    const res = normalizeRejectionDecisions(items, []);
    if (!res.ok) throw new Error("unexpected");
    if (!("decisions" in res)) throw new Error("unexpected");
    const html = rejectionItemsHtml(res.decisions, "du", { inquiryPeriod: "06.11.2026 bis 09.11.2026", locationKey: "krefeld", resolveLocationKey: resolve });
    for (const item of items) expect(html).toContain(item.name.replace("/", "/"));
    expect(html.match(/Nicht verfügbar/g)?.length).toBe(4);
  });

  it("markiert einzelne Artikel als verfügbar und hängt die Alternative nur an den abgesagten", () => {
    const items = rejectionItemsOf("rental", inquiry);
    const res = normalizeRejectionDecisions(items, [
      { index: 0, available: true },
      { index: 3, available: false, alternative: { name: "2t Minibagger", slug: "minibagger-2t", category: "bagger" } },
      { index: 1, available: true, alternative: { name: "soll ignoriert werden" } },
    ]);
    if (!res.ok) throw new Error("unexpected");
    if (!("decisions" in res)) throw new Error("unexpected");
    expect(res.decisions.map((d) => d.available)).toEqual([true, true, false, false]);
    expect(res.decisions[3].alternative?.name).toBe("2t Minibagger");
    expect(res.decisions[1].alternative).toBeNull();
    const html = rejectionItemsHtml(res.decisions, "du", { inquiryPeriod: "", locationKey: "krefeld", resolveLocationKey: resolve });
    expect(html).toContain("https://www.slt-rental.de/mieten/krefeld/bagger/minibagger-2t/");
    expect(rejectionTexts("du", "rental", res.decisions).someAvailable).toBe(true);
  });

  it("lehnt eine Absage ab, wenn alle Artikel verfügbar sind", () => {
    const items = rejectionItemsOf("rental", inquiry);
    const res = normalizeRejectionDecisions(items, items.map((i) => ({ index: i.index, available: true })));
    expect(res.ok).toBe(false);
  });

  it("ignoriert Indizes außerhalb der gespeicherten Anfrage", () => {
    const items = rejectionItemsOf("rental", inquiry);
    const res = normalizeRejectionDecisions(items, [{ index: 9, available: true }]);
    if (!res.ok) throw new Error("unexpected");
    if (!("decisions" in res)) throw new Error("unexpected");
    expect(res.decisions).toHaveLength(4);
    expect(res.decisions.every((d) => !d.available)).toBe(true);
  });

  it("duzt standardmäßig und siezt bei Sie-Kunden", () => {
    const res = normalizeRejectionDecisions(rejectionItemsOf("rental", inquiry), []);
    if (!res.ok) throw new Error("unexpected");
    if (!("decisions" in res)) throw new Error("unexpected");
    expect(rejectionTexts("du", "rental", res.decisions).closing).toContain("melde dich");
    expect(rejectionTexts("sie", "rental", res.decisions).closing).toContain("melden Sie sich");
  });

  it("fällt bei Altanfragen ohne Artikelliste auf den Einzelartikel zurück", () => {
    const items = rejectionItemsOf("rental", { product_name: "Rüttelplatte", quantity: 2, start_date: "2026-11-06" });
    expect(items).toEqual([{ index: 0, name: "Rüttelplatte", quantity: 2, start_date: "2026-11-06", end_date: null }]);
  });
});
