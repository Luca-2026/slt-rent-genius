import { getProductById, locations } from "@/data/rentalData";
import type { Product } from "@/data/rentalData";

/**
 * Maps original image filenames (without extension) to their subdirectory
 * in public/product-images/. Files in public/ are served without Vite hashing,
 * ensuring stable URLs for documents (invoices, offers, protocols).
 */
const IMAGE_DIR_MAP: Record<string, string> = {};

// Erdbewegung
[
  "bobcat-e10z-1", "bobcat-e10z-2", "bobcat-e10z-3", "bobcat-e10z-4",
  "bobcat-e19-1", "bobcat-e19-2", "bobcat-e19-3",
  "bodenschutz-fahrmatten-1", "bodenschutz-fahrmatten-2", "bodenschutz-fahrmatten-3", "bodenschutz-fahrmatten-4",
  "cormidi-c60-1", "cormidi-c60-2", "cormidi-c60-3",
  "dieseltankstelle-400l-1", "dieseltankstelle-400l-2",
  "hydraulikhammer-shb45-1", "hydraulikhammer-shb45-2", "hydraulikhammer-shb45-3",
  "knickdumper-kde550-1", "knickdumper-kde550-2",
  "kramer-5045-1", "kramer-5045-2",
  "xcmg-xe20e-1", "xcmg-xe20e-2", "xcmg-xe20e-3",
  "xcmg-xe27e-1", "xcmg-xe27e-2", "xcmg-xe27e-3",
].forEach((f) => (IMAGE_DIR_MAP[f] = "erdbewegung"));

// Werkzeuge
[
  "abbruchhammer-gsh16-28",
  "akku-ladegeraet-set-4ah",
  "bauleuchte-gli18v-2200c",
  "betonruettler-ir1000",
  "bohrhammer-gbh18v-26f", "bohrhammer-gbh18v-45c",
  "bohrschrauber-gsr12v-15", "bohrschrauber-gsr18v-60c",
  "diamantbohrer-ehd1500",
  "drehschlagschrauber-gds18v-1050h", "drehschlagschrauber-gds18v-1050h-2",
  "einhell-bauleuchte-te-cl18-2000",
  "fugenschneider-bs50e-1", "fugenschneider-bs50e-2",
  "multicutter-gop18v-28",
  "nageler-te-cn",
  "ortungsgeraet-dtect200c",
  "saebelsaege-gsa18v-li-c",
  "sds-plus-bohrer-meissel-set",
  "staubsauger-gas18v-10l",
  "staubsaugeraufsatz-gde18v-16",
  "trennschleifer-ts420",
  "winkelschleifer-gws18v-10",
].forEach((f) => (IMAGE_DIR_MAP[f] = "werkzeuge"));

// Anhänger
[
  "autotransport-1500-1", "autotransport-1500-2", "autotransport-1500-3",
  "autotransport-2700-1", "autotransport-2700-2",
  "autotransportkipp-2700-1", "autotransportkipp-2700-2",
  "baumaschinen-1800-1", "baumaschinen-1800-2",
  "baumaschinen-3500-1", "baumaschinen-3500-2", "baumaschinen-3500-3",
  "kasten-750",
  "kasten-laubgitter-1300", "kasten-laubgitter-750",
  "koffer-1500-1", "koffer-1500-2", "koffer-1500-3", "koffer-1500-4", "koffer-1500-5",
  "koffer-2000-1", "koffer-2000-2", "koffer-2000-3", "koffer-2000-4", "koffer-2000-5",
  "koffer-750-1", "koffer-750-2", "koffer-750-3", "koffer-750-4",
  "motorrad-3fach-750-1", "motorrad-3fach-750-2", "motorrad-3fach-750-3",
  "planen-1300",
  "planen-3500-1", "planen-3500-2", "planen-3500-3", "planen-3500-4",
  "planen-l-750", "planen-m-750", "planen-s-750", "planen-xl-750", "planen-xxl-750",
  "plattform-3500-1", "plattform-3500-2", "plattform-3500-3", "plattform-3500-4", "plattform-3500-5", "plattform-3500-6",
  "rueckwaertskipp-2700-1", "rueckwaertskipp-2700-2", "rueckwaertskipp-2700-3",
  "urlaub-750",
].forEach((f) => (IMAGE_DIR_MAP[f] = "anhaenger"));

// Gartenpflege
[
  "erdbohrer-4308-1", "erdbohrer-4308-2", "erdbohrer-4308-3", "erdbohrer-4308-4",
  "benzin-bodenhacke-1", "benzin-bodenhacke-2",
  "benzin-erdbohrer-1", "benzin-erdbohrer-2",
  "freischneider-1",
  "akku-kettensaege-1", "akku-kettensaege-2", "akku-kettensaege-3", "akku-kettensaege-4",
  "haecksler-axt-1",
  "haecksler-ls95-1",
  "vertikutierer-1", "vertikutierer-2", "vertikutierer-benzin-1",
  "baumstumpffraese-f360-1", "baumstumpffraese-f360-2",
  "hochdruckreiniger-1",
].forEach((f) => (IMAGE_DIR_MAP[f] = "gartenpflege"));

// Aggregate
[
  "scherenbuehne-zs1012ac-1",
  "scherenbuehne-xg0807ac-1", "scherenbuehne-xg0807ac-2",
  "gelenkteleskop-hr12l-1", "gelenkteleskop-hr12l-2", "gelenkteleskop-hr12l-3",
  "mastbuehne-zmp09-1", "mastbuehne-zmp09-2", "mastbuehne-zmp09-3",
  "anhaengerbuehne-tm18gti-1", "anhaengerbuehne-tm18gti-2", "anhaengerbuehne-tm18gti-3", "anhaengerbuehne-tm18gti-4", "anhaengerbuehne-tm18gti-5",
].forEach((f) => (IMAGE_DIR_MAP[f] = "arbeitsbuehnen"));

[
  "aggregat-7kva-1", "aggregat-7kva-2", "aggregat-7kva-3",
  "aggregat-20kva-1",
  "aggregat-2-8kva-1", "aggregat-2-8kva-2",
  "aggregat-50kva-1",
  "aggregat-100kva-1",
  "aggregat-80kva-1",
  "akkupack-bluetti-1",
  "kompressor-5m3-1", "kompressor-5m3-2",
].forEach((f) => (IMAGE_DIR_MAP[f] = "aggregate"));

["stampfer-gs72xh-1", "ruettelplatte-hvp3050-1", "ruettelplatte-hvp3860-1", "ruettelplatte-vp2550-1", "ruettelplatte-vp2550-2", "ruettelplatte-vp1644-1", "ruettelplatte-vp1644-2"].forEach((f) => (IMAGE_DIR_MAP[f] = "verdichtung"));

["cee-adapter-schuko-16a-1", "netzwerkkabel-cat7-30m-1", "powercon-true1-linkkabel-5m-1", "anschlussverteilerschrank-24kva-1", "anschlussverteilerschrank-24kva-2", "anschlussverteilerschrank-24kva-3", "cee-kabel-63a-5m-1", "powercon-linkkabel-1-5m-1", "cee-adapter-16a-32a-1", "titanex-powercon-true1-5m-1", "cee-63a-uv-2x32a-2x16a-1", "office-kabelbruecke-2m-1", "office-kabelbruecke-2m-2", "office-kabelbruecke-1m-1", "office-kabelbruecke-1m-2", "netzwerkkabel-cat5e-20m-1", "schukokabel-20m-1", "hdmi-glasfaser-35m-1", "ethercon-cat5e-20m-1", "titanex-powercon-true1-10m-1", "cee-kabel-16a-rot-5m-1", "cee-16a-uv-5x-schuko-1", "cee-kabel-32a-rot-5m-1", "cee-adapter-63a-32a-1", "cee-kabel-63a-rot-10m-1", "cee-32a-uv-6x-schuko-1", "titanex-powercon-true1-3m-1", "ethercon-cat5e-25m-1", "ethercon-cat7-3m-1", "netzwerkkabel-cat5e-2m-1", "cee-adapter-32a-63a-1", "schukokabel-10m-1", "cee-kabel-16a-rot-3m-1", "cee-kabel-32a-rot-10m-1", "cee-kabel-63a-rot-3m-1", "erdungsspiess-1-5m-1", "schukokabel-5m-1", "cee-kabel-16a-rot-10m-1", "powercon-linkkabel-5m-1", "cee-kabel-32a-rot-20m-1", "defender-midi-5-1", "defender-midi-5-2", "schuko-kabeltrommel-50m-1", "powercon-hybrid-linkkabel-3m-1", "cee-adapter-32a-16a-1", "cee-16a-uv-3x-schuko-1", "cee-kabel-32a-rot-3m-1", "ethercon-cat5e-50m-1", "ethercon-cat5e-50m-2", "anschlussverteilerschrank-44kva-1", "anschlussverteilerschrank-44kva-2", "anschlussverteilerschrank-44kva-3", "cee-kabel-32a-rot-50m-1", "schukokabel-3m-1", "netzwerkkabel-cat5e-5m-1", "cee-kabel-63a-rot-20m-1", "defender-micro-2-1", "defender-micro-2-2", "verteilerschrank-44kva-1", "verteilerschrank-44kva-2", "verteilerschrank-44kva-3"].forEach((f) => (IMAGE_DIR_MAP[f] = "kabel-stromverteiler"));

/**
 * Converts a Vite-hashed asset path to a stable public path.
 * Vite paths: /assets/bobcat-e10z-1-BhXkL2nP.jpg
 * Stable paths: /product-images/erdbewegung/bobcat-e10z-1.jpg
 */
function vitePathToStablePath(vitePath: string): string | null {
  if (!vitePath || vitePath === "/placeholder.svg") return null;

  // Already a stable URL (http or /product-images)
  if (vitePath.startsWith("http") || vitePath.startsWith("/product-images/")) {
    return vitePath;
  }

  // Match Vite-hashed pattern: /assets/FILENAME-HASH.EXT
  // Vite hashes are typically 8 alphanumeric characters
  const match = vitePath.match(/\/assets\/(.+)-[a-zA-Z0-9]{7,10}\.(jpg|jpeg|png|webp)$/i);
  if (!match) return null;

  const baseName = match[1];
  const ext = match[2];
  const dir = IMAGE_DIR_MAP[baseName];

  if (!dir) return null;
  return `/product-images/${dir}/${baseName}.${ext}`;
}

/**
 * Looks up a product image by product ID from rental data
 * and returns a STABLE absolute URL for use in external HTML documents.
 * Uses public/product-images/ paths which don't change between builds.
 */
export function getProductImageUrl(productId: string): string | null {
  const product = getProductById(productId);
  if (!product?.image) return null;

  const stablePath = vitePathToStablePath(product.image);
  if (stablePath) return toAbsoluteUrl(stablePath);

  // Fallback: use the Vite path as-is (may break after rebuild)
  return toAbsoluteUrl(product.image);
}

/**
 * Looks up a product image by product name (fallback when ID doesn't match).
 * Searches all locations for a product with a matching name.
 */
export function getProductImageUrlByName(productName: string): string | null {
  for (const location of locations) {
    for (const products of Object.values(location.products)) {
      const found = (products as Product[]).find(
        (p) => p.name === productName || p.id === productName
      );
      if (found?.image) {
        const stablePath = vitePathToStablePath(found.image);
        if (stablePath) return toAbsoluteUrl(stablePath);
        return toAbsoluteUrl(found.image);
      }
    }
  }
  return null;
}

function toAbsoluteUrl(imagePath: string): string {
  if (imagePath.startsWith("http")) return imagePath;
  return `${window.location.origin}${imagePath}`;
}
