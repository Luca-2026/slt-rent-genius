import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { TOOL_SEO, TOOLS_INDEX_SEO } from "../../supabase/functions/_shared/tools-seo";

const llms = readFileSync(resolve(__dirname, "../../public/llms.txt"), "utf-8");
const ORIGIN = "https://www.slt-rental.de";

describe("llms.txt", () => {
  it("verlinkt die Tool-Übersicht, alle Rechner und den Lieferkostenrechner kanonisch", () => {
    const paths = [TOOLS_INDEX_SEO.path, ...Object.keys(TOOL_SEO).map((slug) => `/tools/${slug}`), "/lieferung"];
    for (const path of paths) expect(llms).toContain(`(${ORIGIN}${path.replace(/\/$/, "")}/)`);
  });
  it("behauptet nicht, dass alle Buchungen über Rentware laufen", () => {
    expect(llms).not.toMatch(/Buchung laufen über das Rentware/);
  });
});
