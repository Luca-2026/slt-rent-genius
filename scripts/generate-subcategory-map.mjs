#!/usr/bin/env bun
/**
 * Erzeugt src/data/productSubcategories.ts aus den statischen Produktdaten.
 *
 * Hintergrund: Im Frontend ist `Product.category` historisch der Artikel-*Untertyp*
 * (z. B. "minibagger", "hydraulikhammer", "cee-kabel") – die Kategoriefilter matchen
 * darauf. Im CMS (`b2b_managed_products.category`) steht dagegen die Hauptkategorie
 * ("erdbewegung"). Seit der Umstellung auf CMS-only ging der Untertyp verloren und
 * die Filter lieferten leere Ergebnisse. Diese Map stellt ihn wieder her.
 *
 * Aufruf: bun scripts/generate-subcategory-map.mjs
 */
import path from "node:path";

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

const { locations, generateProductSlug } = await import(
  path.resolve(process.cwd(), "src/data/rentalData.ts")
);

const map = new Map();
for (const loc of locations) {
  for (const list of Object.values(loc.products ?? {})) {
    for (const p of list ?? []) {
      const slug = generateProductSlug(p);
      const sub = (p.category ?? "").trim();
      if (!sub || map.has(slug)) continue;
      map.set(slug, sub);
    }
  }
}

const entries = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
const body = entries.map(([slug, sub]) => `  ${JSON.stringify(slug)}: ${JSON.stringify(sub)},`).join("\n");

const file = `// AUTOGENERIERT von scripts/generate-subcategory-map.mjs – nicht manuell bearbeiten.
// Slug -> Artikel-Untertyp (Basis der Kategoriefilter, siehe CategoryProducts.tsx).
export const PRODUCT_SUBCATEGORIES: Record<string, string> = {
${body}
};
`;

await Bun.write(path.resolve(process.cwd(), "src/data/productSubcategories.ts"), file);
console.log(`productSubcategories.ts geschrieben: ${entries.length} Einträge`);
