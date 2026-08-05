# PDF-Regressionstests (Angebot & Rechnung)

Jede Änderung an den PDF-Generatoren wird automatisch gegen ein Referenz-Layout geprüft.

## Aufbau

| Datei | Zweck |
| --- | --- |
| `_shared/pdf-snapshot.ts` | Wandelt PDF-Bytes in einen deterministischen Layout-Snapshot (Text + Position + Schriftgröße) |
| `_shared/pdf-regression.ts` | Vergleicht Snapshot gegen Referenz unter `_shared/__snapshots__/` |
| `_shared/pdf-test-fixtures.ts` | Feste Testdaten (kein Datum/Zufall/Netzwerk) |
| `generate-offer/pdf.ts` | Angebots-Renderer (aus `index.ts` extrahiert, testbar) |
| `generate-invoice/pdf.ts` | Rechnungs-Renderer (aus `index.ts` extrahiert, testbar) |
| `generate-offer/pdf_test.ts` | Snapshot + DIN-5008-Invarianten Angebot |
| `generate-invoice/pdf_test.ts` | Snapshot + DIN-5008-Invarianten Rechnung |
| `generate-offer/pdf_parity_test.ts` | Layout-Parität Angebot ↔ Rechnung (Satzspiegel, Anschriftfeld, Titelblock, Fußzeile) |

## Ausführen

Über das Edge-Function-Test-Tool (`generate-offer`, `generate-invoice`) oder lokal:

```
deno test --allow-net --allow-env --allow-read --allow-write \
  supabase/functions/generate-offer supabase/functions/generate-invoice
```

## Referenz aktualisieren

Nur wenn die Layoutänderung gewollt ist:

```
UPDATE_PDF_SNAPSHOTS=1 deno test --allow-net --allow-env --allow-read --allow-write \
  supabase/functions/generate-offer supabase/functions/generate-invoice
```

Die geänderten Dateien unter `_shared/__snapshots__/` gehören mit ins Review – dort sieht man
exakt, welche Textelemente sich verschoben haben.
