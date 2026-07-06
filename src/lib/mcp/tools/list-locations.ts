import { defineTool } from "@lovable.dev/mcp-js";

const LOCATIONS = [
  {
    id: "krefeld",
    name: "Krefeld (Hauptsitz)",
    address: "Anrather Straße 291, 47807 Krefeld-Fichtenhain",
    phone: "02151 417 99 04",
    email: "krefeld@slt-rental.de",
    hours: "Mo–Fr 08:00–18:00, Sa 10:00–14:30 (nach Buchung)",
    url: "https://www.slt-rental.de/standorte/krefeld",
  },
  {
    id: "bonn",
    name: "Bonn",
    address: "Bonn (siehe Website für vollständige Adresse)",
    phone: "0228 – siehe Website",
    email: "bonn@slt-rental.de",
    hours: "Mo–Fr 07:00–18:00, Sa 08:00–17:30",
    url: "https://www.slt-rental.de/standorte/bonn",
  },
  {
    id: "muelheim",
    name: "Mülheim an der Ruhr",
    address: "Mülheim an der Ruhr",
    phone: "siehe Website",
    email: "muelheim@slt-rental.de",
    hours: "siehe Website",
    url: "https://www.slt-rental.de/standorte/muelheim",
  },
];

export default defineTool({
  name: "list_locations",
  title: "Standorte auflisten",
  description:
    "Liefert alle SLT Rental Standorte (Krefeld, Bonn, Mülheim an der Ruhr) mit Adresse, Telefon, E-Mail und Öffnungszeiten.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(LOCATIONS, null, 2) }],
    structuredContent: { locations: LOCATIONS },
  }),
});
