// PDF-Regressionstest: Angebot
// Vergleicht das erzeugte Layout gegen den Referenz-Snapshot und prüft
// Grundinvarianten (DIN 5008, Seitenformat, Pflichtangaben).

import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { generateOfferPdf } from "./pdf.ts";
import { OFFER_FIXTURE } from "../_shared/pdf-test-fixtures.ts";
import { assertPdfMatchesSnapshot, findText } from "../_shared/pdf-regression.ts";

Deno.test("Angebot-PDF entspricht dem Referenz-Layout", async () => {
  const bytes = await generateOfferPdf(structuredClone(OFFER_FIXTURE) as never);
  const snap = await assertPdfMatchesSnapshot("offer", bytes);

  // Seitenformat A4
  assertEquals(snap.pageSnapshots[0].width, 595.28);
  assertEquals(snap.pageSnapshots[0].height, 841.89);

  // Pflichtinhalte
  assert(findText(snap, "ANGEBOT"), "Titel ANGEBOT fehlt");
  assert(findText(snap, "ANG-2026-0815"), "Angebotsnummer fehlt");
  assert(findText(snap, "Musterbau GmbH"), "Empfängeranschrift fehlt");
  assert(findText(snap, "Minibagger"), "Position fehlt");
});

Deno.test("Angebot-PDF nutzt DIN-5008-Ränder", async () => {
  const bytes = await generateOfferPdf(structuredClone(OFFER_FIXTURE) as never);
  const snap = await assertPdfMatchesSnapshot("offer", bytes);
  for (const page of snap.pageSnapshots) {
    for (const t of page.texts) {
      assert(t.x >= 55, `Text links außerhalb des Satzspiegels: ${t.t} @${t.x}`);
      assert(t.x <= 540, `Text rechts außerhalb des Satzspiegels: ${t.t} @${t.x}`);
      assert(t.y >= 30 && t.y <= 812, `Text vertikal außerhalb: ${t.t} @${t.y}`);
    }
  }
});
