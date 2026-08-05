// PDF-Regressionstest: Rechnung
// Vergleicht das erzeugte Layout gegen den Referenz-Snapshot und prüft
// Grundinvarianten (DIN 5008, Seitenformat, Pflichtangaben).

import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { generateDocumentPdf } from "./pdf.ts";
import { INVOICE_FIXTURE } from "../_shared/pdf-test-fixtures.ts";
import { assertPdfMatchesSnapshot, findText } from "../_shared/pdf-regression.ts";

Deno.test("Rechnungs-PDF entspricht dem Referenz-Layout", async () => {
  const bytes = await generateDocumentPdf(structuredClone(INVOICE_FIXTURE) as never);
  const snap = await assertPdfMatchesSnapshot("invoice", bytes);

  assertEquals(snap.pageSnapshots[0].width, 595.28);
  assertEquals(snap.pageSnapshots[0].height, 841.89);

  assert(findText(snap, "RECHNUNG"), "Titel RECHNUNG fehlt");
  assert(findText(snap, "RE-2026-0421"), "Rechnungsnummer fehlt");
  assert(findText(snap, "Musterbau GmbH"), "Empfängeranschrift fehlt");
  assert(findText(snap, "Minibagger"), "Position fehlt");
});

Deno.test("Rechnungs-PDF nutzt DIN-5008-Ränder", async () => {
  const bytes = await generateDocumentPdf(structuredClone(INVOICE_FIXTURE) as never);
  const snap = await assertPdfMatchesSnapshot("invoice", bytes);
  for (const page of snap.pageSnapshots) {
    for (const t of page.texts) {
      assert(t.x >= 55, `Text links außerhalb des Satzspiegels: ${t.t} @${t.x}`);
      assert(t.x <= 540, `Text rechts außerhalb des Satzspiegels: ${t.t} @${t.x}`);
      assert(t.y >= 30 && t.y <= 812, `Text vertikal außerhalb: ${t.t} @${t.y}`);
    }
  }
});
