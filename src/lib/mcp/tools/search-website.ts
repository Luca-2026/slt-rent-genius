import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "search_website",
  title: "SLT Rental Website durchsuchen",
  description:
    "Führt eine Google-Site-Suche auf slt-rental.de aus und liefert die Ergebnis-URL. Nutze dies, um Produkte, Ratgeber oder Landingpages zu finden.",
  inputSchema: {
    query: z.string().min(2).describe("Suchbegriff, z. B. 'Minibagger 1.8t Krefeld'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: ({ query }) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(
      `site:slt-rental.de ${query}`,
    )}`;
    return {
      content: [{ type: "text", text: url }],
      structuredContent: { searchUrl: url, query },
    };
  },
});
