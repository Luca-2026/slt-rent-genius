import { describe, expect, it } from "vitest";
import { SIGN_PERMIT_MAX_BYTES, validSignPermit } from "../../supabase/functions/_shared/sign-permit";
describe("Private sign permit validation", () => {
  it("accepts PDF permits", () => expect(validSignPermit(new TextEncoder().encode("%PDF-1.7 test"), "application/pdf")).toBe(true));
  it("accepts PNG permits with the complete signature", () => expect(validSignPermit(new Uint8Array([137,80,78,71,13,10,26,10]), "image/png")).toBe(true));
  it("accepts JPEG permits", () => expect(validSignPermit(new Uint8Array([255,216,255,224]), "image/jpeg")).toBe(true));
  it("rejects disguised or truncated documents", () => { expect(validSignPermit(new TextEncoder().encode("not a PDF"), "application/pdf")).toBe(false); expect(validSignPermit(new Uint8Array([137,80,78,71]), "image/png")).toBe(false); });
  it("caps every permit at 5 MB", () => { expect(SIGN_PERMIT_MAX_BYTES).toBe(5242880); expect(validSignPermit(new Uint8Array(SIGN_PERMIT_MAX_BYTES+1), "image/jpeg")).toBe(false); });
});