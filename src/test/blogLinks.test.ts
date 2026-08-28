import { describe, it, expect } from "vitest";
import { blogArticles } from "@/data/blogArticles";
import {
  getLocationById,
  getCategoryById,
  getProductsForLocationCategory,
} from "@/data/rentalData";

/**
 * Guard: Jeder interne Link in den Ratgeber-Artikeln muss auf eine real
 * existierende Route zeigen (Standort, Kategorie, Produkt-ID, Ratgeber-Slug).
 * Verhindert tote Links wie /mieten/bonn/moebel-zelte/bonn-partyzelt-4x6/
 * (interne Produkt-ID statt der öffentlichen, normalisierten Slug-ID).
 */
type Link = { article: string; href: string };

const links: Link[] = [];
for (const a of blogArticles) {
  const re = /\]\((\/[^)\s]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(a.content)) !== null) {
    links.push({ article: a.slug, href: m[1] });
  }
}

const slugs = new Set(blogArticles.map((a) => a.slug));

describe("Ratgeber: interne Verlinkung", () => {
  it("findet Links zum Prüfen", () => {
    expect(links.length).toBeGreaterThan(0);
  });

  it("verlinkt nur existierende Ratgeber-Artikel", () => {
    const broken = links
      .filter((l) => l.href.startsWith("/ratgeber/") && l.href !== "/ratgeber/")
      .filter((l) => !slugs.has(l.href.replace(/^\/ratgeber\//, "").replace(/\/$/, "")));
    expect(broken).toEqual([]);
  });

  it("verlinkt nur existierende Standorte, Kategorien und Produkte", () => {
    const broken: string[] = [];
    for (const l of links) {
      if (!l.href.startsWith("/mieten/")) continue;
      const [locationId, categoryId, productId] = l.href
        .replace(/^\/mieten\//, "")
        .replace(/\/$/, "")
        .split("/");
      if (!locationId) continue;
      if (!getLocationById(locationId)) {
        broken.push(`${l.article}: unbekannter Standort ${l.href}`);
        continue;
      }
      if (!categoryId) continue;
      if (!getCategoryById(categoryId)) {
        broken.push(`${l.article}: unbekannte Kategorie ${l.href}`);
        continue;
      }
      if (!productId) continue;
      const found = getProductsForLocationCategory(locationId, categoryId).some(
        (p) => p.id === productId,
      );
      if (!found) broken.push(`${l.article}: unbekanntes Produkt ${l.href}`);
    }
    expect(broken).toEqual([]);
  });
});
