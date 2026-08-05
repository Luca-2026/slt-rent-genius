// Layout-Parität: Angebot vs. Rechnung
// Beide Dokumente müssen denselben DIN-5008-Rahmen nutzen (Anschriftfeld,
// Titelposition, Fußzeile, Satzspiegel). Weicht ein Generator ab, schlägt
// dieser Test sofort an.

import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { generateOfferPdf } from "./pdf.ts";
import { generateDocumentPdf } from "../generate-invoice/pdf.ts";
import { OFFER_FIXTURE, INVOICE_FIXTURE } from "../_shared/pdf-test-fixtures.ts";
import { snapshotOf, textsOfPage } from "../_shared/pdf-regression.ts";

const near = (a: number, b: number, tol: number, label: string) =>
  assert(Math.abs(a - b) <= tol, `${label}: Angebot ${a} vs. Rechnung ${b} (Toleranz ${tol})`);

Deno.test("Angebot und Rechnung teilen denselben Layout-Rahmen", async () => {
  const offer = await snapshotOf(await generateOfferPdf(structuredClone(OFFER_FIXTURE) as never));
  const invoice = await snapshotOf(await generateDocumentPdf(structuredClone(INVOICE_FIXTURE) as never));

  // Gleiches Seitenformat
  assertEquals(offer.pageSnapshots[0].width, invoice.pageSnapshots[0].width);
  assertEquals(offer.pageSnapshots[0].height, invoice.pageSnapshots[0].height);

  // Linker Satzspiegel identisch
  const minX = (s: typeof offer) => Math.min(...textsOfPage(s).map((t) => t.x));
  near(minX(offer), minX(invoice), 0.6, "Linker Rand");

  // Anschriftfeld (Empfänger) an gleicher Position
  const addrO = textsOfPage(offer).find((t) => t.t.includes("Musterbau GmbH"))!;
  const addrI = textsOfPage(invoice).find((t) => t.t.includes("Musterbau GmbH"))!;
  assert(addrO && addrI, "Empfängerblock fehlt in einem der Dokumente");
  near(addrO.x, addrI.x, 0.6, "Anschriftfeld X");
  near(addrO.y, addrI.y, 2, "Anschriftfeld Y");

  // Dokumenttitel gleich positioniert und gleich groß
  const titleO = textsOfPage(offer).find((t) => t.t === "ANGEBOT")!;
  const titleI = textsOfPage(invoice).find((t) => t.t === "RECHNUNG")!;
  assert(titleO && titleI, "Dokumenttitel fehlt");
  near(titleO.x, titleI.x, 0.6, "Titel X");
  near(titleO.size, titleI.size, 0.1, "Titelgröße");
  // Titel-Y hängt von der Länge des Info-Blocks ab (Angebot hat mehr Zeilen),
  // konstant sein muss aber der Abstand Titel -> Dokumentnummer.
  const numO = textsOfPage(offer).find((t) => t.t.startsWith("Nr. ANG-"))!;
  const numI = textsOfPage(invoice).find((t) => t.t.startsWith("Nr. RE-"))!;
  assert(numO && numI, "Dokumentnummer unter dem Titel fehlt");
  near(titleO.y - numO.y, titleI.y - numI.y, 0.1, "Abstand Titel/Nummer");
  near(numO.x, numI.x, 0.6, "Nummer X");
  near(numO.size, numI.size, 0.1, "Nummer-Schriftgröße");

  // Fußzeile auf gleicher Höhe
  const footY = (s: typeof offer) => Math.min(...textsOfPage(s).map((t) => t.y));
  near(footY(offer), footY(invoice), 2, "Fußzeile Y");
});
