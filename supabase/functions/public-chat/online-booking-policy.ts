/** Recognize sign-set aliases independently of a model-supplied URL or Rentware code. */
export function isSignBookingItem(item: { product_name?: string; product_url?: string | null }) {
  return /halte\s*verbots?(?:schilder|zone|schild|[-\s]*(?:komplett)?set)?/i.test(item.product_name ?? "") ||
    /\/halteverbotsschilder-set\/?(?:[?#]|$)/i.test(item.product_url ?? "");
}

export function signBookingRedirect(items: { product_name?: string; product_url?: string | null }[], location: string) {
  if (!items.some(isSignBookingItem)) return null;
  const sites = location === "bonn" ? ["bonn"] : location === "krefeld" ? ["krefeld"] : ["krefeld", "bonn"];
  return {
    ok: false,
    online_booking_required: true,
    booking_urls: sites.map((site) => `https://www.slt-rental.de/mieten/${site}/absperrtechnik/halteverbotsschilder-set/`),
    instruction: "Keine manuelle Mietanfrage für Halteverbotsschilder aufnehmen oder absenden. Direkt zur Onlinebuchung verlinken. Für Aufstellung und Abholung Rundum-Sorglos auswählen; liegt die Genehmigung bereits vor, dort 'Genehmigung schon vorhanden' auswählen und die Kopie im Buchungsschritt hochladen. Keine erneute Beantragung zusagen. Verfügbarkeit, Preis und Termine werden erst im Checkout geprüft. Weitere Mietartikel separat anfragen.",
  };
}