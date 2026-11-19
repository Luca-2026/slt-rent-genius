import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";
import { salesDeliveryPdf } from "./pdf.ts";
import { snapshotOf, findText } from "../_shared/pdf-regression.ts";

const fixture = {
  customer: "Fensterprüfung GmbH", address_lines: ["Anrather Straße 291", "47807 Krefeld"],
  location: "krefeld", order_code: "TEST01", offer_number: "ANG-V-2026-11-0013",
  created_at: "2026-11-19T05:47:00Z", items: [{ name: "Schrankenzaun RA1", quantity: 2, unit: "Stück" }], notes: "",
};
Deno.test("Sales delivery preserves goods and order facts without changing the source", async () => {
  const before = structuredClone(fixture);
  const bytes = await salesDeliveryPdf(fixture, "LS-2026-TEST");
  const snap = await snapshotOf(bytes);
  assertEquals(fixture, before);
  assert(findText(snap, "Schrankenzaun RA1"));
  assert(findText(snap, "2 Stück"));
  assert(findText(snap, "#TEST01"));
  assertEquals(snap.pageSnapshots[0].width, 595.28);
  assertEquals(snap.pageSnapshots[0].height, 841.89);
  const doc = await PDFDocument.load(bytes);
  assertEquals(doc.getTitle(), "Lieferschein LS-2026-TEST");
});
Deno.test("Sales delivery retains all goods across page breaks", async () => {
  const bytes = await salesDeliveryPdf({ ...fixture, items: Array.from({ length: 35 }, (_, n) => ({ name: `Ware-${n + 1}`, quantity: 2, unit: "Stück", description: "Beschreibung ".repeat(25) })) }, "LS-2026-TEST");
  const snap = await snapshotOf(bytes);
  assert(snap.pageSnapshots.length > 1);
  for (let n = 1; n <= 35; n++) assert(snap.pageSnapshots.some((_page, i) => findText(snap, `Ware-${n}`, i + 1)), `Ware ${n} missing`);
});