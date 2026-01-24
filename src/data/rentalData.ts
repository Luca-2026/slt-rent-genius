// Location and category data structure for the rental system

// Category Icons
import iconBagger from "@/assets/icons/category-bagger.png";
import iconVerdichtung from "@/assets/icons/category-verdichtung.png";
import iconBuehne from "@/assets/icons/category-buehne.png";
import iconMoebelZelte from "@/assets/icons/category-moebel-zelte.png";
import iconGeschirr from "@/assets/icons/category-geschirr-neu.png";
import iconHuepfburg from "@/assets/icons/category-huepfburg.png";
import iconSpezialeffekte from "@/assets/icons/category-spezialeffekte.png";
import iconAbsperrgitter from "@/assets/icons/category-absperrgitter.png";
import iconAggregat from "@/assets/icons/category-aggregat.png";
import iconBeleuchtung from "@/assets/icons/category-beleuchtung.png";
import iconAnhaenger from "@/assets/icons/category-anhaenger.png";
import iconHeizung from "@/assets/icons/category-heizung.png";
import iconKabel from "@/assets/icons/category-kabel.png";
import iconHebebuehne from "@/assets/icons/category-hebebuehne.png";

// Product Images - Anhänger
import imgUrlaub750 from "@/assets/products/anhaenger/urlaub-750.jpg";
import imgKasten750 from "@/assets/products/anhaenger/kasten-750.jpg";
import imgPlanenS750 from "@/assets/products/anhaenger/planen-s-750.jpg";
import imgPlanenM750 from "@/assets/products/anhaenger/planen-m-750.jpg";
import imgPlanenL750 from "@/assets/products/anhaenger/planen-l-750.jpg";
import imgMotorrad750_1 from "@/assets/products/anhaenger/motorrad-3fach-750-1.jpg";
import imgKoffer750_1 from "@/assets/products/anhaenger/koffer-750-1.jpg";
import imgKastenLaubgitter750 from "@/assets/products/anhaenger/kasten-laubgitter-750.jpg";
import imgPlanenXL750 from "@/assets/products/anhaenger/planen-xl-750.jpg";
import imgPlanenXXL750 from "@/assets/products/anhaenger/planen-xxl-750.jpg";
import imgKastenLaubgitter1300 from "@/assets/products/anhaenger/kasten-laubgitter-1300.jpg";
import imgPlanen1300 from "@/assets/products/anhaenger/planen-1300.jpg";
import imgAutotransport1500_1 from "@/assets/products/anhaenger/autotransport-1500-1.jpg";
import imgKoffer1500_1 from "@/assets/products/anhaenger/koffer-1500-1.jpg";
import imgBaumaschinen1800_1 from "@/assets/products/anhaenger/baumaschinen-1800-1.jpg";
import imgKoffer2000_1 from "@/assets/products/anhaenger/koffer-2000-1.jpg";
import imgRueckwaertskipp2700_1 from "@/assets/products/anhaenger/rueckwaertskipp-2700-1.jpg";
import imgAutotransport2700_1 from "@/assets/products/anhaenger/autotransport-2700-1.jpg";
import imgAutotransportkipp2700_1 from "@/assets/products/anhaenger/autotransportkipp-2700-1.jpg";
import imgBaumaschinen3500_1 from "@/assets/products/anhaenger/baumaschinen-3500-1.jpg";
import imgPlanen3500_1 from "@/assets/products/anhaenger/planen-3500-1.jpg";
import imgPlattform3500_1 from "@/assets/products/anhaenger/plattform-3500-1.jpg";

// Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  image?: string;
  pricePerDay?: string;
  priceWeekend?: string;
  features?: string[];
  tags?: string[]; // Filter tags: geschlossen, baumaschine, autotransport, motorrad, laubgitter, urlaub, gebremst, ungebremst, einachser, zweiachser
  weightKg?: number; // For sorting
  // Rentware widget code per location (will be added later)
  rentwareCode?: Record<string, string>; // { locationId: "rentware-code-snippet" }
}

export interface ProductCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
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
  // Products per category for this location
  products: Record<string, Product[]>;
}

// All product categories
export const productCategories: ProductCategory[] = [
  {
    id: "alle",
    title: "Alle Artikel",
    description: "Alle verfügbaren Mietprodukte an diesem Standort.",
    icon: "",
  },
  {
    id: "anhaenger",
    title: "Anhänger",
    description: "24/7 mietbar per Codesystem – SMS-Code nach Zahlung, Schloss an Deichsel entsperren, Rückgabe am Abholort.",
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
    icon: iconVerdichtung,
  },
  {
    id: "gartenpflege",
    title: "Gartenpflege",
    description: "Rasenmäher, Vertikutierer, Häcksler und Gartengeräte.",
    icon: iconBagger,
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
    icon: iconSpezialeffekte,
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

// Shared trailer products with images
const trailerProducts: Product[] = [
  // 750 kg - ungebremst, einachser
  { id: "urlaub-750", name: "750 kg Urlaubanhänger", description: "Ladefläche: 150 x 106 x 70 cm", image: imgUrlaub750, weightKg: 750, tags: ["urlaub", "ungebremst", "einachser"], rentwareCode: {} },
  { id: "kasten-750", name: "750 kg Kastenanhänger", description: "Ladefläche: 200 x 108 x 30 cm", image: imgKasten750, weightKg: 750, tags: ["ungebremst", "einachser"], rentwareCode: {} },
  { id: "planen-s-750", name: "750 kg Planenanhänger S", description: "Ladefläche: 200 x 108 x 100 cm", image: imgPlanenS750, weightKg: 750, tags: ["geschlossen", "ungebremst", "einachser"], rentwareCode: {} },
  { id: "planen-m-750", name: "750 kg Planenanhänger M", description: "Ladefläche: 200 x 108 x 130 cm", image: imgPlanenM750, weightKg: 750, tags: ["geschlossen", "ungebremst", "einachser"], rentwareCode: {} },
  { id: "planen-l-750", name: "750 kg Planenanhänger L", description: "Ladefläche: 200 x 108 x 160 cm", image: imgPlanenL750, weightKg: 750, tags: ["geschlossen", "ungebremst", "einachser"], rentwareCode: {} },
  { id: "motorrad-3fach-750", name: "750 kg Motorradanhänger 3-fach", description: "Ladefläche: 220 x 131 cm", image: imgMotorrad750_1, weightKg: 750, tags: ["motorrad", "ungebremst", "einachser"], rentwareCode: {} },
  { id: "koffer-750", name: "750 kg Kofferanhänger", description: "Ladefläche: 223 x 147 x 147 cm", image: imgKoffer750_1, weightKg: 750, tags: ["geschlossen", "ungebremst", "einachser"], rentwareCode: {} },
  { id: "kasten-laubgitter-750", name: "750 kg Kastenanhänger & Laubgitter", description: "Ladefläche: 264 x 126 x 100 cm", image: imgKastenLaubgitter750, weightKg: 750, tags: ["laubgitter", "ungebremst", "einachser"], rentwareCode: {} },
  { id: "planen-xl-750", name: "750 kg Planenanhänger XL", description: "Ladefläche: 264 x 124 x 160 cm", image: imgPlanenXL750, weightKg: 750, tags: ["geschlossen", "ungebremst", "einachser"], rentwareCode: {} },
  { id: "planen-xxl-750", name: "750 kg Planenanhänger XXL", description: "Ladefläche: 300 x 150 x 180 cm", image: imgPlanenXXL750, weightKg: 750, tags: ["geschlossen", "ungebremst", "einachser"], rentwareCode: {} },
  // 1300 kg - gebremst, einachser
  { id: "kasten-laubgitter-1300", name: "1300 kg Kastenanhänger & Laubgitter", description: "Ladefläche: 255 x 151 x 100 cm", image: imgKastenLaubgitter1300, weightKg: 1300, tags: ["laubgitter", "gebremst", "einachser"], rentwareCode: {} },
  { id: "planen-1300", name: "1300 kg Planenanhänger", description: "Ladefläche: 300 x 150 x 190 cm", image: imgPlanen1300, weightKg: 1300, tags: ["geschlossen", "gebremst", "einachser"], rentwareCode: {} },
  // 1500 kg - gebremst, einachser
  { id: "autotransport-1500", name: "1500 kg Autotransportanhänger", description: "Ladefläche: 301 x 165 x 17 cm", image: imgAutotransport1500_1, weightKg: 1500, tags: ["autotransport", "gebremst", "einachser"], rentwareCode: {} },
  { id: "motorrad-1500", name: "1500 kg Motorradanhänger", description: "Ladefläche: 301 x 165 x 17 cm", image: imgAutotransport1500_1, weightKg: 1500, tags: ["motorrad", "gebremst", "einachser"], rentwareCode: {} },
  { id: "koffer-1500", name: "1500 kg Kofferanhänger", description: "Ladefläche: 300 x 150 x 180 cm", image: imgKoffer1500_1, weightKg: 1500, tags: ["geschlossen", "gebremst", "einachser"], rentwareCode: {} },
  // 1800 kg - gebremst, zweiachser
  { id: "baumaschinen-1800", name: "1800 kg Baumaschinenanhänger", description: "Ladefläche: 260 x 150 x 25 cm", image: imgBaumaschinen1800_1, weightKg: 1800, tags: ["baumaschine", "gebremst", "zweiachser"], rentwareCode: {} },
  // 2000 kg - gebremst, zweiachser
  { id: "koffer-2000", name: "2000 kg Kofferanhänger", description: "Ladefläche: 300 x 155 x 185 cm", image: imgKoffer2000_1, weightKg: 2000, tags: ["geschlossen", "gebremst", "zweiachser"], rentwareCode: {} },
  // 2700 kg - gebremst, zweiachser
  { id: "rueckwaertskipp-2700", name: "2700 kg Rückwärtskippanhänger", description: "Ladefläche: 300 x 150 x 40 cm", image: imgRueckwaertskipp2700_1, weightKg: 2700, tags: ["gebremst", "zweiachser"], rentwareCode: {} },
  { id: "autotransport-2700", name: "2700 kg Autotransportanhänger", description: "Ladefläche: 452 x 205 cm", image: imgAutotransport2700_1, weightKg: 2700, tags: ["autotransport", "gebremst", "zweiachser"], rentwareCode: {} },
  { id: "autotransportkipp-2700", name: "2700 kg Autotransportkippanhänger", description: "Ladefläche: 469 x 210 cm", image: imgAutotransportkipp2700_1, weightKg: 2700, tags: ["autotransport", "gebremst", "zweiachser"], rentwareCode: {} },
  // 3500 kg - gebremst, zweiachser
  { id: "baumaschinen-3500", name: "3500 kg Baumaschinenanhänger", description: "Ladefläche: 350 x 168 x 25 cm", image: imgBaumaschinen3500_1, weightKg: 3500, tags: ["baumaschine", "gebremst", "zweiachser"], rentwareCode: {} },
  { id: "planen-3500", name: "3500 kg Planenanhänger", description: "Ladefläche: 400 x 200 x 210 cm", image: imgPlanen3500_1, weightKg: 3500, tags: ["geschlossen", "gebremst", "zweiachser"], rentwareCode: {} },
  { id: "plattform-3500", name: "3500 kg Plattformanhänger", description: "Ladefläche: 512 x 211 cm", image: imgPlattform3500_1, weightKg: 3500, tags: ["gebremst", "zweiachser"], rentwareCode: {} },
  { id: "planen-xxl-3500", name: "3500 kg Planenanhänger XXL", description: "Ladefläche: 600 x 250 x 250 cm", image: imgPlanen3500_1, weightKg: 3500, tags: ["geschlossen", "gebremst", "zweiachser"], rentwareCode: {} },
];

// Locations with their available categories and products
export const locations: LocationData[] = [
  {
    id: "krefeld",
    name: "Krefeld",
    shortName: "KR",
    address: "Anrather Straße 291, 47807 Krefeld-Fichtenhain",
    phone: "02151 417 990 4",
    email: "krefeld@slt-rental.de",
    rentwareLocationId: "01929004-e24f-7cc0-83f0-0f3d3431395e",
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
    products: {
      "anhaenger": trailerProducts,
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
    products: {
      "anhaenger": trailerProducts,
    },
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
    products: {
      "anhaenger": trailerProducts,
    },
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
  
  const alleCategory = productCategories.find((c) => c.id === "alle");
  const availableCategories = productCategories.filter(
    (cat) => cat.id !== "alle" && location.availableCategories.includes(cat.id)
  );
  
  return alleCategory ? [alleCategory, ...availableCategories] : availableCategories;
}

export function getProductsForLocationCategory(
  locationId: string,
  categoryId: string
): Product[] {
  const location = getLocationById(locationId);
  if (!location) return [];
  
  if (categoryId === "alle") {
    // Return all products from all categories
    return Object.values(location.products).flat();
  }
  
  return location.products[categoryId] || [];
}

export function getAllProductsForLocation(locationId: string): Product[] {
  const location = getLocationById(locationId);
  if (!location) return [];
  return Object.values(location.products).flat();
}
