// ─── Helfer für PDF-Regressionstests ────────────────────────────────────
// Vergleicht einen frisch erzeugten Layout-Snapshot mit der Referenz unter
// __snapshots__/. Fehlt die Referenz oder ist UPDATE_PDF_SNAPSHOTS=1 gesetzt,
// wird sie geschrieben.

import { buildPdfSnapshot, diffSnapshots, type PdfSnapshot } from "./pdf-snapshot.ts";
import * as pdfLib from "https://esm.sh/pdf-lib@1.17.1";

const SNAPSHOT_DIR = new URL("./__snapshots__/", import.meta.url);

export async function snapshotOf(bytes: Uint8Array): Promise<PdfSnapshot> {
  return await buildPdfSnapshot(bytes, pdfLib as never);
}

export async function assertPdfMatchesSnapshot(name: string, bytes: Uint8Array): Promise<PdfSnapshot> {
  const snapshot = await snapshotOf(bytes);
  const file = new URL(`${name}.json`, SNAPSHOT_DIR);
  const update = Deno.env.get("UPDATE_PDF_SNAPSHOTS") === "1";

  let existing: PdfSnapshot | null = null;
  try {
    existing = JSON.parse(await Deno.readTextFile(file));
  } catch {
    existing = null;
  }

  if (!existing || update) {
    await Deno.mkdir(SNAPSHOT_DIR, { recursive: true });
    await Deno.writeTextFile(file, JSON.stringify(snapshot, null, 2) + "\n");
    console.log(`[pdf-regression] Referenz-Snapshot geschrieben: ${name}.json`);
    return snapshot;
  }

  const diffs = diffSnapshots(existing, snapshot);
  if (diffs.length) {
    const preview = diffs.slice(0, 40).join("\n");
    throw new Error(
      `PDF-Layout weicht von der Referenz "${name}" ab (${diffs.length} Abweichungen).\n${preview}` +
        `\n\nWenn die Änderung gewollt ist: Tests mit UPDATE_PDF_SNAPSHOTS=1 erneut ausführen.`,
    );
  }
  return snapshot;
}

/** Alle Textzeilen einer Seite (nach y absteigend, dann x). */
export function textsOfPage(snap: PdfSnapshot, page = 1) {
  return [...(snap.pageSnapshots[page - 1]?.texts ?? [])].sort((a, b) => b.y - a.y || a.x - b.x);
}

export function findText(snap: PdfSnapshot, needle: string, page = 1) {
  return textsOfPage(snap, page).find((t) => t.t.includes(needle));
}
