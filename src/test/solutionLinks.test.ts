import { describe, it, expect } from "vitest";
import { solutionLinking } from "@/data/solutionLinking";
import { solutionData } from "@/pages/Loesungen";
import { blogArticles } from "@/data/blogArticles";
import { getCategoryById, locations, getProductsForLocationCategory } from "@/data/rentalData";

/**
 * Guard: Die interne Verlinkung der Lösungsseiten darf nie ins Leere zeigen.
 * Geprüft werden Kategorie-IDs, Produkt-Slugs (an mindestens einem Standort
 * verfügbar), Ratgeber-Slugs und verwandte Lösungs-IDs.
 */
const solutionIds = new Set(solutionData.map((s) => s.id));
const guideSlugs = new Set(blogArticles.map((a) => a.slug));

describe("Lösungsseiten: interne Verlinkung", () => {
  it("hat für jede Lösung Metadaten und Links", () => {
    const missing = [...solutionIds].filter((id) => !solutionLinking[id]);
    expect(missing).toEqual([]);
  });

  it("verlinkt nur existierende Kategorien und Produkte", () => {
    const broken: string[] = [];
    for (const [id, cfg] of Object.entries(solutionLinking)) {
      for (const link of cfg.productLinks) {
        if (!getCategoryById(link.categoryId)) {
          broken.push(`${id}: unbekannte Kategorie ${link.categoryId}`);
          continue;
        }
        const found = locations.some((loc) =>
          getProductsForLocationCategory(loc.id, link.categoryId).some((p) => p.id === link.slug),
        );
        if (!found) broken.push(`${id}: Produkt ${link.categoryId}/${link.slug} an keinem Standort gefunden`);
      }
    }
    expect(broken).toEqual([]);
  });

  it("verlinkt nur existierende Ratgeber und Lösungen", () => {
    const broken: string[] = [];
    for (const [id, cfg] of Object.entries(solutionLinking)) {
      cfg.guides.forEach((g) => !guideSlugs.has(g) && broken.push(`${id}: Ratgeber ${g}`));
      cfg.relatedSolutions.forEach(
        (r) => (!solutionIds.has(r) || r === id) && broken.push(`${id}: Lösung ${r}`),
      );
    }
    expect(broken).toEqual([]);
  });

  it("hält Title und Meta-Description in SEO-Grenzen", () => {
    const tooLong: string[] = [];
    for (const [id, cfg] of Object.entries(solutionLinking)) {
      if (cfg.seoTitle.length > 65) tooLong.push(`${id}: Title ${cfg.seoTitle.length}`);
      if (cfg.metaDescription.length > 185) tooLong.push(`${id}: Meta ${cfg.metaDescription.length}`);
    }
    expect(tooLong).toEqual([]);
  });
});
