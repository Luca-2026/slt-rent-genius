#!/usr/bin/env bun
// Extrahiert alle statischen Produkte aus src/data/rentalData.ts, spiegelt fehlende
// Bilder von src/assets/products/ nach public/product-images/<subdir>/<datei> und
// schreibt scripts/import-static-products.json als Vorlage für den DB-Import.
import path from "node:path";
import fs from "node:fs";

const ROOT = process.cwd();
const SRC_ASSETS_PRODUCTS = path.join(ROOT, "src/assets/products");
const PUBLIC_IMG_ROOT = path.join(ROOT, "public/product-images");

// Bild-Imports als String-Pfade auflösen statt binär zu laden.
const IMG_RE = /\.(jpe?g|png|webp|svg|gif|avif)$/i;
Bun.plugin({
  name: "asset-stub",
  setup(build) {
    build.onLoad({ filter: IMG_RE }, (args) => ({
      contents: `export default ${JSON.stringify(args.path)};`,
      loader: "js",
    }));
  },
});

const mod = await import(path.resolve(ROOT, "src/data/rentalData.ts"));
const { locations } = mod;
if (!Array.isArray(locations)) {
  console.error("Konnte locations nicht laden");
  process.exit(1);
}

const copiedFiles = new Set();
const missingFiles = new Set();

function toPublicUrl(raw) {
  if (!raw || typeof raw !== "string") return null;
  // Bereits eine öffentliche URL
  if (raw.startsWith("/product-images/")) return raw;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

  // Absoluter Filesystem-Pfad aus dem Asset-Stub
  if (raw.startsWith("/") && raw.includes("/src/assets/products/")) {
    const rel = raw.split("/src/assets/products/")[1];
    const abs = raw;
    const publicAbs = path.join(PUBLIC_IMG_ROOT, rel);
    if (!fs.existsSync(publicAbs)) {
      if (fs.existsSync(abs)) {
        fs.mkdirSync(path.dirname(publicAbs), { recursive: true });
        fs.copyFileSync(abs, publicAbs);
        copiedFiles.add(rel);
      } else {
        missingFiles.add(abs);
        return null;
      }
    }
    return `/product-images/${rel}`;
  }

  // Datei liegt schon im public-Ordner
  if (raw.startsWith("/") && raw.includes("/public/")) {
    return raw.split("/public")[1];
  }

  // Vite-hashed URL kommt hier nicht vor, weil wir ESM direkt laden.
  return null;
}

const bySlug = new Map();
let totalPerLocation = { krefeld: 0, bonn: 0, muelheim: 0 };

for (const loc of locations) {
  const locId = loc.id;
  for (const [category, products] of Object.entries(loc.products || {})) {
    for (const p of products) {
      totalPerLocation[locId] = (totalPerLocation[locId] || 0) + 1;
      const rawImages = Array.isArray(p.images) && p.images.length
        ? p.images
        : p.image ? [p.image] : [];
      const images = rawImages.map(toPublicUrl).filter(Boolean);

      const key = p.id;
      const existing = bySlug.get(key);
      if (existing) {
        if (!existing.available_locations.includes(locId)) existing.available_locations.push(locId);
        for (const img of images) if (!existing.images.includes(img)) existing.images.push(img);
        // Rentware-Codes je Standort ergänzen
        if (p.rentwareCode) Object.assign(existing.rentware_code, p.rentwareCode);
        // Nur kategorisieren wenn noch leer oder identisch
        if (!existing.category) existing.category = category;
      } else {
        bySlug.set(key, {
          slug: p.id,
          name: p.name,
          model_name: p.modelName ?? null,
          description: p.description ?? null,
          detailed_description: p.detailedDescription ?? null,
          category,
          available_locations: [locId],
          images,
          specifications: p.specifications ?? {},
          features: p.features ?? [],
          tags: p.tags ?? [],
          rental_notes: p.rentalNotes ?? [],
          price_per_day: p.pricePerDay ?? null,
          price_weekend: p.priceWeekend ?? null,
          price_per_month: p.pricePerMonth ?? null,
          min_rental_months: p.minRentalMonths ?? null,
          weight_kg: p.weightKg ?? null,
          drive_type: p.driveType ?? null,
          rentware_code: p.rentwareCode ? { ...p.rentwareCode } : {},
          on_request: !!p.onRequest,
          pdf_url: p.pdfUrl ?? null,
          external_manual_url: p.externalManualUrl ?? null,
          video_url: p.videoUrl ?? null,
          video_urls: p.videoUrls ?? [],
          sort_order: p.sortOrder ?? null,
          compatible_machines: p.compatibleMachines ?? [],
        });
      }
    }
  }
}

// Wenn ein Rentware-Code hinterlegt ist, ist on_request nicht mehr sinnvoll (Core-Memory-Regel).
for (const row of bySlug.values()) {
  if (row.rentware_code && Object.keys(row.rentware_code).length > 0) {
    row.on_request = false;
  }
}

const outPath = path.join(ROOT, "scripts/import-static-products.json");
fs.writeFileSync(outPath, JSON.stringify([...bySlug.values()], null, 2));

console.log(`✅ ${bySlug.size} unique products (${[...bySlug.values()].reduce((s, r) => s + r.available_locations.length, 0)} location-mappings)`);
console.log("   Pro Standort (Rohzählung inkl. Doppelungen):", totalPerLocation);
console.log(`📸 Bilder nach /public/product-images/ kopiert: ${copiedFiles.size}`);
if (missingFiles.size) {
  console.warn(`⚠️  Nicht auffindbare Bilddateien: ${missingFiles.size}`);
  for (const m of missingFiles) console.warn("   ", m);
}
console.log(`💾 Datei geschrieben: ${outPath}`);
