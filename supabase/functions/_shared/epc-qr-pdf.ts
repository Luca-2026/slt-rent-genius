// Zeichnet einen EPC-Überweisungs-QR-Code als Vektorgrafik in eine pdf-lib-Seite.
import qrcode from "https://esm.sh/qrcode-generator@1.4.4";
import { rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { buildEpcPayload, type EpcInput } from "./epc-qr.ts";

/** Zeichnet den Code mit linker unterer Ecke (x, y) und Kantenlänge size. Gibt false zurück, wenn kein Code möglich ist. */
// deno-lint-ignore no-explicit-any
export function drawEpcQr(page: any, input: EpcInput, x: number, y: number, size: number, labelFont?: any): boolean {
  const payload = buildEpcPayload(input);
  if (!payload) return false;
  // deno-lint-ignore no-explicit-any
  const qr = (qrcode as any)(0, "M");
  qr.addData(payload, "Byte");
  qr.make();
  const n = qr.getModuleCount();
  const quiet = 2;
  const cell = size / (n + quiet * 2);
  page.drawRectangle({ x, y, width: size, height: size, color: rgb(1, 1, 1) });
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!qr.isDark(r, c)) continue;
      page.drawRectangle({
        x: x + (c + quiet) * cell,
        y: y + size - (r + quiet + 1) * cell,
        width: cell + 0.02,
        height: cell + 0.02,
        color: rgb(0, 0, 0),
      });
    }
  }
  if (labelFont) {
    const label = "Scannen & überweisen";
    const w = labelFont.widthOfTextAtSize(label, 6.5);
    page.drawText(label, { x: x + (size - w) / 2, y: y - 8, size: 6.5, font: labelFont, color: rgb(0.35, 0.38, 0.42) });
  }
  return true;
}
