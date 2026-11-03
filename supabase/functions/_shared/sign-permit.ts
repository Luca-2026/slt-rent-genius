export const SIGN_PERMIT_MAX_BYTES = 5 * 1024 * 1024;
export function validSignPermit(bytes: Uint8Array, contentType: string): boolean {
  if (bytes.length === 0 || bytes.length > SIGN_PERMIT_MAX_BYTES) return false;
  if (contentType === "application/pdf") return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
  if (contentType === "image/png") return [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v);
  if (contentType === "image/jpeg") return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  return false;
}