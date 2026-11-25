// Nur Gruppenpreise: Einzelpreise und Zeilenbeträge fehlen, je Gruppe erscheint eine Summe; Gesamtbetrag bleibt.
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { generateOfferPdf } from "./offer-pdf.ts";
import { OFFER_FIXTURE } from "./pdf-test-fixtures.ts";
import { snapshotOf, textsOfPage } from "./pdf-regression.ts";

const items = [
  { ...OFFER_FIXTURE.items[0], total_price: 162, group_id: "g1" },
  { ...OFFER_FIXTURE.items[1], total_price: 73.5, group_id: "g2" },
];
const base = { ...OFFER_FIXTURE, items, servicesWithPrices: [], priceGroups: [{ id: "g1", name: "Bagger" }, { id: "g2", name: "Trocknung" }] } as any;
const allText = async (d: any) => (await snapshotOf(await generateOfferPdf(d))).pageSnapshots.flatMap((p: any) => p.texts.map((t: any) => t.t)).join(" | ");

for (const documentType of ["offer", "order_confirmation", "invoice"]) {
  Deno.test(`${documentType}: Einzelpreise ausgeblendet, Gruppensummen sichtbar`, async () => {
    const txt = await allText({ ...base, documentType, hideItemPrices: true });
    assert(!txt.includes("Einzelpreis"));
    assert(!txt.includes("180,00"), "Einzelpreis Minibagger sichtbar");
    assert(!txt.includes("24,50"), "Einzelpreis Bautrockner sichtbar");
    assert(!txt.includes("Listenpreis"));
    assert(txt.includes("Summe Bagger"));
    assert(txt.includes("162,00"));
    assert(txt.includes("Summe Trocknung"));
    assert(txt.includes("73,50"));
  });
}

Deno.test("ohne Schalter bleiben Einzelpreise", async () => {
  const txt = await allText({ ...base, documentType: "offer" });
  assert(txt.includes("Einzelpreis"));
  assert(txt.includes("24,50"));
  assertEquals(txt.includes("Summe Bagger"), false);
});
