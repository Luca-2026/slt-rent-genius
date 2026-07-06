import { defineTool } from "@lovable.dev/mcp-js";

const CATEGORIES = [
  { id: "erdbewegung", name: "Minibagger & Erdbewegung" },
  { id: "verdichtung", name: "Verdichtung" },
  { id: "anhaenger", name: "Anhänger" },
  { id: "hebebuehne", name: "Hebebühnen & Arbeitsbühnen" },
  { id: "aggregat", name: "Stromaggregate" },
  { id: "heizung", name: "Heizung & Klima" },
  { id: "beleuchtung", name: "Beleuchtung" },
  { id: "beschallung", name: "Beschallung & DJ" },
  { id: "spezialeffekte", name: "Spezialeffekte (Sparkular, Nebel)" },
  { id: "moebel-zelte", name: "Möbel & Zelte" },
  { id: "geschirr-glaeser-besteck", name: "Geschirr, Gläser & Besteck" },
  { id: "huepfburg", name: "Hüpfburgen" },
  { id: "absperrgitter", name: "Absperrgitter" },
  { id: "werkzeug", name: "Werkzeug" },
  { id: "gartenpflege", name: "Gartenpflege" },
  { id: "nutzfahrzeuge", name: "Nutzfahrzeuge" },
];

export default defineTool({
  name: "list_categories",
  title: "Mietkategorien auflisten",
  description:
    "Liefert die Hauptkategorien des SLT Rental Mietportfolios (Bau, Event, Transport) mit Slug und Anzeigename.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(CATEGORIES, null, 2) }],
    structuredContent: { categories: CATEGORIES },
  }),
});
