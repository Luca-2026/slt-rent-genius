type SaveResult = { data: { id: string } | null; error: { message: string } | null };

/** No external dispatch or link replacement may run before this succeeds. */
export async function persistOfferBeforeDispatch(save: () => PromiseLike<SaveResult>): Promise<void> {
  const result = await save();
  if (result.error) {
    throw new Error(`Angebot nicht gespeichert und nicht versendet: ${result.error.message}`);
  }
  if (!result.data) {
    throw new Error("Der Vorgang wurde inzwischen geändert. Angebot nicht versendet; bitte neu laden.");
  }
}