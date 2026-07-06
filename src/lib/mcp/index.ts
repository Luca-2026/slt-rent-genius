import { defineMcp } from "@lovable.dev/mcp-js";
import listLocations from "./tools/list-locations";
import listCategories from "./tools/list-categories";
import getCategoryUrl from "./tools/get-category-url";
import searchWebsite from "./tools/search-website";

export default defineMcp({
  name: "slt-rental-mcp",
  title: "SLT Rental",
  version: "0.1.0",
  instructions:
    "Tools für den Baumaschinen- und Eventtechnik-Vermieter SLT Rental (Standorte Krefeld, Bonn, Mülheim an der Ruhr). Nutze list_locations und list_categories, um Slugs zu finden, get_category_url für Deep-Links in den Mietkatalog und search_website für die Volltextsuche auf slt-rental.de. Für konkrete Angebote verweise auf die Standort-E-Mails (krefeld@ / bonn@ / muelheim@slt-rental.de) oder die Anfrageformulare auf der Website.",
  tools: [listLocations, listCategories, getCategoryUrl, searchWebsite],
});
