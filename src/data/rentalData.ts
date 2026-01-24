// Location and category data structure for the rental system

// Category Icons
import iconBagger from "@/assets/icons/category-bagger.png";
import iconVerdichtung from "@/assets/icons/category-verdichtung.png";
import iconBuehne from "@/assets/icons/category-buehne.png";
import iconMoebelZelte from "@/assets/icons/category-moebel-zelte.png";
import iconGeschirr from "@/assets/icons/category-geschirr-neu.png";
import iconBesteck from "@/assets/icons/category-besteck.png";
import iconHuepfburg from "@/assets/icons/category-huepfburg.png";
import iconSpezialeffekte from "@/assets/icons/category-spezialeffekte.png";
import iconAbsperrgitter from "@/assets/icons/category-absperrgitter.png";
import iconAggregat from "@/assets/icons/category-aggregat.png";
import iconBeleuchtung from "@/assets/icons/category-beleuchtung.png";
import iconAnhaenger from "@/assets/icons/category-anhaenger.png";
import iconHeizung from "@/assets/icons/category-heizung.png";
import iconKabel from "@/assets/icons/category-kabel.png";
import iconHebebuehne from "@/assets/icons/category-hebebuehne.png";

// Types
export interface RentwareArticle {
  id: string;
  name: string;
  description?: string;
  view?: string;
  weightKg?: number;
}

export interface ProductCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  rentwareTag?: string; // For Rentware search widget filtering
}

export interface LocationData {
  id: string;
  name: string;
  shortName: string;
  address: string;
  phone: string;
  email: string;
  rentwareLocationId: string;
  // Categories available at this location (by category ID)
  availableCategories: string[];
  // Articles per category for this location
  articles: Record<string, RentwareArticle[]>;
}

// All product categories
export const productCategories: ProductCategory[] = [
  {
    id: "alle",
    title: "Alle Artikel",
    description: "Alle verfügbaren Mietprodukte an diesem Standort.",
    icon: "", // Special: no icon, or use a grid icon
  },
  {
    id: "anhaenger",
    title: "Anhänger",
    description: "Pkw-Anhänger, Kipper, Maschinentransporter und Transportanhänger.",
    icon: iconAnhaenger,
  },
  {
    id: "erdbewegung",
    title: "Erdbewegung",
    description: "Minibagger, Radlader und Erdbaumaschinen für jedes Bauvorhaben.",
    icon: iconBagger,
  },
  {
    id: "werkzeuge",
    title: "Werkzeuge",
    description: "Hand- und Elektrowerkzeuge für Bau und Renovierung.",
    icon: iconVerdichtung, // Placeholder - can be updated
  },
  {
    id: "gartenpflege",
    title: "Gartenpflege",
    description: "Rasenmäher, Vertikutierer, Häcksler und Gartengeräte.",
    icon: iconBagger, // Placeholder - can be updated
  },
  {
    id: "aggregate",
    title: "Aggregate",
    description: "Stromerzeuger und Notstromgeräte für Baustelle und Event.",
    icon: iconAggregat,
  },
  {
    id: "arbeitsbuehnen",
    title: "Arbeitsbühnen",
    description: "Scherenbühnen, Teleskopbühnen und Gelenkbühnen für Höhenarbeiten.",
    icon: iconHebebuehne,
  },
  {
    id: "verdichtung",
    title: "Verdichtung",
    description: "Rüttelplatten, Stampfer und Walzen für professionelle Bodenverdichtung.",
    icon: iconVerdichtung,
  },
  {
    id: "kabel-stromverteiler",
    title: "Kabel & Stromverteiler",
    description: "Verlängerungskabel, Kabelbrücken und Stromverteiler.",
    icon: iconKabel,
  },
  {
    id: "leitern-gerueste",
    title: "Leitern & Gerüste",
    description: "Leitern, Rollgerüste und Arbeitsplattformen.",
    icon: iconBuehne,
  },
  {
    id: "heizung-trocknung",
    title: "Heizung & Trocknung",
    description: "Heizlüfter, Heizpilze, Bautrockner und Klimageräte.",
    icon: iconHeizung,
  },
  {
    id: "absperrtechnik",
    title: "Absperrtechnik",
    description: "Absperrgitter, Bauzäune, Warnbaken und Sicherheitsequipment.",
    icon: iconAbsperrgitter,
  },
  {
    id: "beschallung",
    title: "Beschallung",
    description: "Lautsprecher, Mikrofone, Mischpulte und PA-Anlagen.",
    icon: iconSpezialeffekte, // Placeholder
  },
  {
    id: "beleuchtung",
    title: "Beleuchtung",
    description: "LED Spots, Flutlicht, Bühnenlicht und mobile Beleuchtung.",
    icon: iconBeleuchtung,
  },
  {
    id: "moebel-zelte",
    title: "Möbel & Zelte",
    description: "Partyzelte, Bierzeltgarnituren, Stehtische und Event-Mobiliar.",
    icon: iconMoebelZelte,
  },
  {
    id: "geschirr-glaeser-besteck",
    title: "Geschirr, Gläser & Besteck",
    description: "Teller, Gläser, Tassen und Besteck für Ihre Veranstaltung.",
    icon: iconGeschirr,
  },
  {
    id: "spezialeffekte",
    title: "Spezial Effekte",
    description: "Nebelmaschinen, Seifenblasen, Funkeneffekte und Fotobooth.",
    icon: iconSpezialeffekte,
  },
  {
    id: "huepfburgen",
    title: "Hüpfburgen",
    description: "Aufblasbare Hüpfburgen und Spiele für Kinderveranstaltungen.",
    icon: iconHuepfburg,
  },
];

// Locations with their available categories and articles
// Articles will be populated per location later
export const locations: LocationData[] = [
  {
    id: "krefeld",
    name: "Krefeld",
    shortName: "KR",
    address: "Anrather Straße 291, 47807 Krefeld-Fichtenhain",
    phone: "02151 417 990 4",
    email: "krefeld@slt-rental.de",
    rentwareLocationId: "01929004-e24f-7cc0-83f0-0f3d3431395e",
    // All categories available - will be filtered based on actual articles
    availableCategories: [
      "anhaenger",
      "erdbewegung",
      "werkzeuge",
      "gartenpflege",
      "aggregate",
      "arbeitsbuehnen",
      "verdichtung",
      "kabel-stromverteiler",
      "leitern-gerueste",
      "heizung-trocknung",
      "absperrtechnik",
      "beschallung",
      "beleuchtung",
      "moebel-zelte",
      "geschirr-glaeser-besteck",
      "spezialeffekte",
      "huepfburgen",
    ],
    articles: {
      // Will be populated with specific articles
    },
  },
  {
    id: "bonn",
    name: "Bonn",
    shortName: "BN",
    address: "Drachenburgstraße 8, 53179 Bonn",
    phone: "0228 50466061",
    email: "bonn@slt-rental.de",
    rentwareLocationId: "01953e5f-614f-743d-8eb9-1a0e865da81d",
    availableCategories: [
      "anhaenger",
      "erdbewegung",
      "werkzeuge",
      "gartenpflege",
      "aggregate",
      "arbeitsbuehnen",
      "verdichtung",
      "kabel-stromverteiler",
      "leitern-gerueste",
      "heizung-trocknung",
      "absperrtechnik",
      "beschallung",
      "beleuchtung",
      "moebel-zelte",
      "geschirr-glaeser-besteck",
      "spezialeffekte",
      "huepfburgen",
    ],
    articles: {},
  },
  {
    id: "muelheim",
    name: "Mülheim",
    shortName: "MH",
    address: "Ruhrorter Str. 100, 45478 Mülheim an der Ruhr",
    phone: "02151 417 99 04",
    email: "krefeld@slt-rental.de",
    rentwareLocationId: "95e16e54-04d2-496a-6002-41e0289b53a3",
    availableCategories: [
      "anhaenger",
      "erdbewegung",
      "werkzeuge",
      "gartenpflege",
      "aggregate",
      "arbeitsbuehnen",
      "verdichtung",
      "kabel-stromverteiler",
      "leitern-gerueste",
      "heizung-trocknung",
      "absperrtechnik",
      "beschallung",
      "beleuchtung",
      "moebel-zelte",
      "geschirr-glaeser-besteck",
      "spezialeffekte",
      "huepfburgen",
    ],
    articles: {},
  },
];

// Helper functions
export function getLocationById(id: string): LocationData | undefined {
  return locations.find((loc) => loc.id === id);
}

export function getCategoryById(id: string): ProductCategory | undefined {
  return productCategories.find((cat) => cat.id === id);
}

export function getCategoriesForLocation(locationId: string): ProductCategory[] {
  const location = getLocationById(locationId);
  if (!location) return [];
  
  // Always include "Alle Artikel" first
  const alleCategory = productCategories.find((c) => c.id === "alle");
  const availableCategories = productCategories.filter(
    (cat) => cat.id !== "alle" && location.availableCategories.includes(cat.id)
  );
  
  return alleCategory ? [alleCategory, ...availableCategories] : availableCategories;
}

export function getArticlesForLocationCategory(
  locationId: string,
  categoryId: string
): RentwareArticle[] {
  const location = getLocationById(locationId);
  if (!location) return [];
  
  if (categoryId === "alle") {
    // Return all articles from all categories
    return Object.values(location.articles).flat();
  }
  
  return location.articles[categoryId] || [];
}
