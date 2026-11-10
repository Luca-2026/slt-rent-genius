export function originalOfferDispatch(inquiry: Record<string, any>, inquiryType: string, expectedEmail?: string) {
  const email = String(inquiry.customer_email ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Bitte zuerst eine gültige Kunden-E-Mail-Adresse speichern.");
  if (expectedEmail !== undefined && email !== expectedEmail) throw new Error("Die Kundenadresse wurde geändert. Bitte Versand erneut öffnen.");
  const original = inquiry.original_accepted_offer ?? inquiry;
  const number = original.offer_number || inquiry.offer_number;
  const url = original.offer_file_url || inquiry.offer_file_url;
  if (!number || !url) throw new Error("Kein gespeichertes Angebot vorhanden.");
  const marker = "/b2b-invoices/";
  const index = String(url).indexOf(marker);
  const path = decodeURIComponent((index >= 0 ? String(url).slice(index + marker.length) : String(url).replace(/^private:/, "")).split("?")[0]);
  if (!path.startsWith(`inquiry-offers/${inquiryType}/${inquiry.id}/`) || path.split("/").includes("..")) throw new Error("Angebotsdatei ist diesem Vorgang nicht zugeordnet.");
  return { email, number: String(number), path };
}