// ─── PDF-Layout-Snapshot ────────────────────────────────────────────────
// Wandelt ein generiertes PDF in eine deterministische, vergleichbare
// Layout-Beschreibung um (Text + Position + Größe, Rechtecke, Linien).
// Wird von den PDF-Regressionstests (Angebot vs. Rechnung) genutzt.

export interface PdfTextOp {
  t: string;
  x: number;
  y: number;
  size: number;
}

export interface PdfShapeOp {
  op: "rect" | "line";
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PdfPageSnapshot {
  page: number;
  width: number;
  height: number;
  texts: PdfTextOp[];
  shapes: PdfShapeOp[];
}

export interface PdfSnapshot {
  pages: number;
  pageSnapshots: PdfPageSnapshot[];
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/** PDF-String-Literal (…) inkl. Escapes und Oktal-Codes dekodieren. */
function decodePdfString(raw: string): string {
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c !== "\\") {
      out += c;
      continue;
    }
    const n = raw[++i];
    if (n === undefined) break;
    if (n >= "0" && n <= "7") {
      let oct = n;
      while (oct.length < 3 && raw[i + 1] >= "0" && raw[i + 1] <= "7") oct += raw[++i];
      out += String.fromCharCode(parseInt(oct, 8));
    } else if (n === "n") out += "\n";
    else if (n === "r") out += "\r";
    else if (n === "t") out += "\t";
    else out += n;
  }
  return out;
}

/** Content-Stream einer Seite parsen: Text- und Zeichen-Operationen. */
export function parseContentStream(content: string): { texts: PdfTextOp[]; shapes: PdfShapeOp[] } {
  const texts: PdfTextOp[] = [];
  const shapes: PdfShapeOp[] = [];

  // Rechtecke: "x y w h re" (gefüllt oder gestrichen)
  const reRegex = /(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+re\b/g;
  let m: RegExpExecArray | null;
  while ((m = reRegex.exec(content))) {
    const [, x, y, w, h] = m;
    const W = parseFloat(w);
    const H = parseFloat(h);
    shapes.push({
      op: Math.abs(H) < 1.5 || Math.abs(W) < 1.5 ? "line" : "rect",
      x: r2(parseFloat(x)),
      y: r2(parseFloat(y)),
      w: r2(W),
      h: r2(H),
    });
  }

  // Textblöcke: BT … ET
  const btRegex = /BT([\s\S]*?)ET/g;
  while ((m = btRegex.exec(content))) {
    const block = m[1];
    let size = 0;
    let x = 0;
    let y = 0;
    const tokenRegex =
      /\/(\S+)\s+([\d.]+)\s+Tf|(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+Tm|(-?[\d.]+)\s+(-?[\d.]+)\s+Td|\(((?:\\.|[^\\)])*)\)\s*Tj/g;
    let tk: RegExpExecArray | null;
    while ((tk = tokenRegex.exec(block))) {
      if (tk[2] !== undefined) {
        size = parseFloat(tk[2]);
      } else if (tk[7] !== undefined) {
        x = parseFloat(tk[7]);
        y = parseFloat(tk[8]);
      } else if (tk[9] !== undefined) {
        x += parseFloat(tk[9]);
        y += parseFloat(tk[10]);
      } else if (tk[11] !== undefined) {
        const t = decodePdfString(tk[11]);
        if (t.trim()) texts.push({ t, x: r2(x), y: r2(y), size: r2(size) });
      }
    }
  }

  return { texts, shapes };
}

async function inflate(bytes: Uint8Array): Promise<Uint8Array> {
  for (const fmt of ["deflate", "deflate-raw"] as const) {
    try {
      const ds = new DecompressionStream(fmt);
      const stream = new Blob([bytes]).stream().pipeThrough(ds);
      return new Uint8Array(await new Response(stream).arrayBuffer());
    } catch {
      // nächstes Format probieren
    }
  }
  return bytes;
}

/**
 * Layout-Snapshot aus PDF-Bytes erzeugen.
 * Nutzt pdf-lib zum Laden, liest die Content-Streams der Seiten aus.
 */
export async function buildPdfSnapshot(
  bytes: Uint8Array,
  // deno-lint-ignore no-explicit-any
  pdfLib: { PDFDocument: any; PDFRawStream?: any },
): Promise<PdfSnapshot> {
  const doc = await pdfLib.PDFDocument.load(bytes, { updateMetadata: false });
  const pages = doc.getPages();
  const pageSnapshots: PdfPageSnapshot[] = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    // deno-lint-ignore no-explicit-any
    const contentsRef: any = page.node.get(page.node.context.obj("Contents").constructor
      ? undefined
      : undefined);
    let raw = "";
    // deno-lint-ignore no-explicit-any
    const streams: any[] = [];
    // deno-lint-ignore no-explicit-any
    const contents: any = page.node.Contents();
    if (contents) {
      if (typeof contents.asArray === "function") {
        for (const ref of contents.asArray()) {
          streams.push(page.node.context.lookup(ref));
        }
      } else {
        streams.push(contents);
      }
    }
    void contentsRef;
    for (const s of streams) {
      if (!s) continue;
      let content: Uint8Array | undefined = s.contents ?? s.getContents?.();
      if (!content) continue;
      const filter = s.dict?.get?.(s.dict.context.obj("Filter"));
      const filterName = filter ? String(filter) : "";
      if (filterName.includes("FlateDecode")) content = await inflate(content);
      raw += new TextDecoder("latin1").decode(content) + "\n";
    }

    const { texts, shapes } = parseContentStream(raw);
    pageSnapshots.push({ page: i + 1, width: r2(width), height: r2(height), texts, shapes });
  }

  return { pages: pages.length, pageSnapshots };
}

/** Unterschiede zweier Snapshots als lesbare Zeilen. */
export function diffSnapshots(expected: PdfSnapshot, actual: PdfSnapshot): string[] {
  const diffs: string[] = [];
  if (expected.pages !== actual.pages) {
    diffs.push(`Seitenanzahl: erwartet ${expected.pages}, erhalten ${actual.pages}`);
  }
  const n = Math.min(expected.pages, actual.pages);
  for (let i = 0; i < n; i++) {
    const e = expected.pageSnapshots[i];
    const a = actual.pageSnapshots[i];
    if (e.width !== a.width || e.height !== a.height) {
      diffs.push(`Seite ${i + 1}: Format ${e.width}x${e.height} -> ${a.width}x${a.height}`);
    }
    const key = (o: PdfTextOp) => `${o.t}@${o.x},${o.y}/${o.size}`;
    const eSet = new Set(e.texts.map(key));
    const aSet = new Set(a.texts.map(key));
    for (const k of eSet) if (!aSet.has(k)) diffs.push(`Seite ${i + 1}: fehlt  - ${k}`);
    for (const k of aSet) if (!eSet.has(k)) diffs.push(`Seite ${i + 1}: neu    + ${k}`);
    if (e.shapes.length !== a.shapes.length) {
      diffs.push(`Seite ${i + 1}: Formen ${e.shapes.length} -> ${a.shapes.length}`);
    }
  }
  return diffs;
}
