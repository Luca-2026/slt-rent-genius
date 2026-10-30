export function approvalReady(emailConfirmed: boolean, passwordSet: boolean, businessDocument: string | null, sepaDocument: string | null): boolean {
  return emailConfirmed && passwordSet && Boolean(businessDocument?.startsWith('private:') && sepaDocument?.startsWith('private:'));
}

export function documentBytes(base64: string, mime: string): Uint8Array {
  if (base64.length > 7_000_000) throw new Error('Datei ist zu groß (maximal 5 MB).');
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  if (!bytes.length || bytes.length > 5 * 1024 * 1024) throw new Error('Datei ist leer oder zu groß.');
  const pdf = mime === 'application/pdf' && new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-';
  const jpeg = mime === 'image/jpeg' && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const png = mime === 'image/png' && [137,80,78,71,13,10,26,10].every((n,i) => bytes[i] === n);
  if (!pdf && !jpeg && !png) throw new Error('Nur gültige PDF-, JPEG- oder PNG-Dateien sind erlaubt.');
  return bytes;
}