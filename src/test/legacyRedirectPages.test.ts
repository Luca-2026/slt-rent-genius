import { describe, expect, it } from "vitest";
import { redirectHtml } from "../../scripts/emit-legacy-redirect-pages.mjs";
import { RENAMED_PRODUCT_SLUGS } from "@/data/categoryModel";

describe("Alt-URL-Weiterleitungsseiten", () => {
  it("bobcat-e10z ist dem 1t-Minibagger zugeordnet", () => {
    expect(RENAMED_PRODUCT_SLUGS["bobcat-e10z"]).toBe("minibagger-1t");
  });
  it("zeigen Canonical aufs Ziel, noindex und keine Startseite", () => {
    const html = redirectHtml("/mieten/bonn/erdbewegung/minibagger-1t/");
    expect(html).toContain('<link rel="canonical" href="https://www.slt-rental.de/mieten/bonn/erdbewegung/minibagger-1t/">');
    expect(html).toContain('content="noindex, follow"');
    expect(html).not.toContain('href="https://www.slt-rental.de/"');
  });
});
