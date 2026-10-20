/** A preview never allocates an official invoice number. */
export async function invoiceNumberForGeneration(preview: boolean, allocate: () => Promise<string>): Promise<string> {
  return preview ? "VORSCHAU – ENTWURF" : allocate();
}

/** Any change to the submitted document invalidates its previous preview. */
export function matchesDocumentPreview(previewedKey: string | null, body: unknown): boolean {
  return previewedKey !== null && previewedKey === JSON.stringify(body);
}