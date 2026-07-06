import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const VALID_LOCATIONS = ["krefeld", "bonn", "muelheim"] as const;

export default defineTool({
  name: "get_category_url",
  title: "Kategorie-URL für Standort erzeugen",
  description:
    "Baut die kanonische URL für eine Kategorie an einem Standort, z. B. /mieten/krefeld/anhaenger/. Nutze list_locations und list_categories, um gültige Slugs zu finden.",
  inputSchema: {
    locationId: z
      .enum(VALID_LOCATIONS)
      .describe("Standort-Slug: krefeld, bonn oder muelheim."),
    categoryId: z
      .string()
      .min(1)
      .describe("Kategorie-Slug, z. B. 'anhaenger', 'beschallung', 'moebel-zelte'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ locationId, categoryId }) => {
    const url = `https://www.slt-rental.de/mieten/${locationId}/${categoryId}/`;
    return {
      content: [{ type: "text", text: url }],
      structuredContent: { url, locationId, categoryId },
    };
  },
});
