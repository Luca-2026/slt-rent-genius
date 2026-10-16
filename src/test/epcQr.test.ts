import { describe, expect, it } from "vitest";
import { buildEpcPayload } from "../../supabase/functions/_shared/epc-qr";

const base = { name: "SLT Technology Group GmbH & Co. KG", iban: "DE65 3205 0000 0000 4784 46", bic: "SPKRDE33XXX", reference: "RE-M-2026-10-0001" };

describe("EPC-Überweisungs-QR", () => {
  it("enthält IBAN ohne Leerzeichen, centgenauen Betrag und Belegnummer", () => {
    const lines = buildEpcPayload({ ...base, amountCents: 73086 })!.split("\n");
    expect(lines.slice(0, 4)).toEqual(["BCD", "002", "1", "SCT"]);
    expect(lines[6]).toBe("DE65320500000000478446");
    expect(lines[7]).toBe("EUR730.86");
    expect(lines[10]).toBe("RE-M-2026-10-0001");
  });
  it("schreibt Cent-Beträge mit zwei Nachkommastellen", () => {
    expect(buildEpcPayload({ ...base, amountCents: 5 })!.split("\n")[7]).toBe("EUR0.05");
  });
  it("erzeugt keinen Code ohne offenen Betrag", () => {
    expect(buildEpcPayload({ ...base, amountCents: 0 })).toBeNull();
  });
});
