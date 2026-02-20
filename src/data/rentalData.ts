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
import iconLedSpots from "@/assets/icons/category-ledspots.png";
import iconBesteck from "@/assets/icons/category-besteck.png";

// Product Images - Anhänger (all images)
import imgUrlaub750 from "@/assets/products/anhaenger/urlaub-750.jpg";
import imgKasten750 from "@/assets/products/anhaenger/kasten-750.jpg";
import imgPlanenS750 from "@/assets/products/anhaenger/planen-s-750.jpg";
import imgPlanenM750 from "@/assets/products/anhaenger/planen-m-750.jpg";
import imgPlanenL750 from "@/assets/products/anhaenger/planen-l-750.jpg";
import imgPlanenXL750 from "@/assets/products/anhaenger/planen-xl-750.jpg";
import imgPlanenXXL750 from "@/assets/products/anhaenger/planen-xxl-750.jpg";
import imgPlanen1300 from "@/assets/products/anhaenger/planen-1300.jpg";
import imgPlanen3500_1 from "@/assets/products/anhaenger/planen-3500-1.jpg";
import imgPlanen3500_2 from "@/assets/products/anhaenger/planen-3500-2.jpg";
import imgPlanen3500_3 from "@/assets/products/anhaenger/planen-3500-3.jpg";
import imgPlanen3500_4 from "@/assets/products/anhaenger/planen-3500-4.jpg";
import imgKastenLaubgitter750 from "@/assets/products/anhaenger/kasten-laubgitter-750.jpg";
import imgKastenLaubgitter1300 from "@/assets/products/anhaenger/kasten-laubgitter-1300.jpg";
import imgMotorrad750_1 from "@/assets/products/anhaenger/motorrad-3fach-750-1.jpg";
import imgMotorrad750_2 from "@/assets/products/anhaenger/motorrad-3fach-750-2.jpg";
import imgMotorrad750_3 from "@/assets/products/anhaenger/motorrad-3fach-750-3.jpg";
import imgKoffer750_1 from "@/assets/products/anhaenger/koffer-750-1.jpg";
import imgKoffer750_2 from "@/assets/products/anhaenger/koffer-750-2.jpg";
import imgKoffer750_3 from "@/assets/products/anhaenger/koffer-750-3.jpg";
import imgKoffer750_4 from "@/assets/products/anhaenger/koffer-750-4.jpg";
import imgKoffer1500_1 from "@/assets/products/anhaenger/koffer-1500-1.jpg";
import imgKoffer1500_2 from "@/assets/products/anhaenger/koffer-1500-2.jpg";
import imgKoffer1500_3 from "@/assets/products/anhaenger/koffer-1500-3.jpg";
import imgKoffer1500_4 from "@/assets/products/anhaenger/koffer-1500-4.jpg";
import imgKoffer1500_5 from "@/assets/products/anhaenger/koffer-1500-5.jpg";
import imgKoffer2000_1 from "@/assets/products/anhaenger/koffer-2000-1.jpg";
import imgKoffer2000_2 from "@/assets/products/anhaenger/koffer-2000-2.jpg";
import imgKoffer2000_3 from "@/assets/products/anhaenger/koffer-2000-3.jpg";
import imgKoffer2000_4 from "@/assets/products/anhaenger/koffer-2000-4.jpg";
import imgKoffer2000_5 from "@/assets/products/anhaenger/koffer-2000-5.jpg";
import imgAutotransport1500_1 from "@/assets/products/anhaenger/autotransport-1500-1.jpg";
import imgAutotransport1500_2 from "@/assets/products/anhaenger/autotransport-1500-2.jpg";
import imgAutotransport1500_3 from "@/assets/products/anhaenger/autotransport-1500-3.jpg";
import imgAutotransport2700_1 from "@/assets/products/anhaenger/autotransport-2700-1.jpg";
import imgAutotransport2700_2 from "@/assets/products/anhaenger/autotransport-2700-2.jpg";
import imgAutotransportkipp2700_1 from "@/assets/products/anhaenger/autotransportkipp-2700-1.jpg";
import imgAutotransportkipp2700_2 from "@/assets/products/anhaenger/autotransportkipp-2700-2.jpg";
import imgBaumaschinen1800_1 from "@/assets/products/anhaenger/baumaschinen-1800-1.jpg";
import imgBaumaschinen1800_2 from "@/assets/products/anhaenger/baumaschinen-1800-2.jpg";
import imgBaumaschinen3500_1 from "@/assets/products/anhaenger/baumaschinen-3500-1.jpg";
import imgBaumaschinen3500_2 from "@/assets/products/anhaenger/baumaschinen-3500-2.jpg";
import imgBaumaschinen3500_3 from "@/assets/products/anhaenger/baumaschinen-3500-3.jpg";
import imgRueckwaertskipp2700_1 from "@/assets/products/anhaenger/rueckwaertskipp-2700-1.jpg";
import imgRueckwaertskipp2700_2 from "@/assets/products/anhaenger/rueckwaertskipp-2700-2.jpg";
import imgRueckwaertskipp2700_3 from "@/assets/products/anhaenger/rueckwaertskipp-2700-3.jpg";
import imgPlattform3500_1 from "@/assets/products/anhaenger/plattform-3500-1.jpg";
import imgPlattform3500_2 from "@/assets/products/anhaenger/plattform-3500-2.jpg";
import imgPlattform3500_3 from "@/assets/products/anhaenger/plattform-3500-3.jpg";
import imgPlattform3500_4 from "@/assets/products/anhaenger/plattform-3500-4.jpg";
import imgPlattform3500_5 from "@/assets/products/anhaenger/plattform-3500-5.jpg";
import imgPlattform3500_6 from "@/assets/products/anhaenger/plattform-3500-6.jpg";

// Product Images - Erdbewegung
import imgXcmgXe20e_1 from "@/assets/products/erdbewegung/xcmg-xe20e-1.jpg";
import imgXcmgXe20e_2 from "@/assets/products/erdbewegung/xcmg-xe20e-2.jpg";
import imgXcmgXe20e_3 from "@/assets/products/erdbewegung/xcmg-xe20e-3.jpg";
import imgBobcatE19_1 from "@/assets/products/erdbewegung/bobcat-e19-1.jpg";
import imgBobcatE19_2 from "@/assets/products/erdbewegung/bobcat-e19-2.jpg";
import imgBobcatE19_3 from "@/assets/products/erdbewegung/bobcat-e19-3.jpg";
import imgXcmgXe27e_1 from "@/assets/products/erdbewegung/xcmg-xe27e-1.jpg";
import imgXcmgXe27e_2 from "@/assets/products/erdbewegung/xcmg-xe27e-2.jpg";
import imgXcmgXe27e_3 from "@/assets/products/erdbewegung/xcmg-xe27e-3.jpg";
import imgBobcatE10z_1 from "@/assets/products/erdbewegung/bobcat-e10z-1.jpg";
import imgBobcatE10z_2 from "@/assets/products/erdbewegung/bobcat-e10z-2.jpg";
import imgBobcatE10z_3 from "@/assets/products/erdbewegung/bobcat-e10z-3.jpg";
import imgBobcatE10z_4 from "@/assets/products/erdbewegung/bobcat-e10z-4.jpg";
import imgKnickdumperKde550_1 from "@/assets/products/erdbewegung/knickdumper-kde550-1.jpg";
import imgKnickdumperKde550_2 from "@/assets/products/erdbewegung/knickdumper-kde550-2.jpg";
import imgCormidiC60_1 from "@/assets/products/erdbewegung/cormidi-c60-1.jpg";
import imgCormidiC60_2 from "@/assets/products/erdbewegung/cormidi-c60-2.jpg";
import imgCormidiC60_3 from "@/assets/products/erdbewegung/cormidi-c60-3.jpg";
import imgKramer5045_1 from "@/assets/products/erdbewegung/kramer-5045-1.png";
import imgKramer5045_2 from "@/assets/products/erdbewegung/kramer-5045-2.png";
import kompressor5m3_1 from "@/assets/products/kompressor-5m3-1.jpeg";
import kompressor5m3_2 from "@/assets/products/kompressor-5m3-2.jpeg";

// Heizung & Trocknung shared images for Mülheim
import heizpilz2kw1 from "@/assets/products/heizpilz-2kw-1.jpeg";
import heizpilz2kw2 from "@/assets/products/heizpilz-2kw-2.jpeg";
import heizpilz2kw3 from "@/assets/products/heizpilz-2kw-3.jpeg";
import heizpilz2kw4 from "@/assets/products/heizpilz-2kw-4.jpeg";
import heizpilz2kw5 from "@/assets/products/heizpilz-2kw-5.jpeg";
import heizluefter2kw1 from "@/assets/products/heizluefter-2kw-1.jpeg";
import heizluefter2kw2 from "@/assets/products/heizluefter-2kw-2.jpeg";
import heizluefter3kw1 from "@/assets/products/heizluefter-3kw-1.jpeg";
import heizluefter3kw2 from "@/assets/products/heizluefter-3kw-2.jpeg";
import heizluefter9kw1 from "@/assets/products/heizluefter-9kw-1.jpeg";
import heizluefter9kw2 from "@/assets/products/heizluefter-9kw-2.jpeg";
import allegraBautrocknerKt200_1 from "@/assets/products/allegra-bautrockner-kt200-1.webp";
import allegraBautrocknerKt200_2 from "@/assets/products/allegra-bautrockner-kt200-2.webp";
import allegraBautrocknerKt553_1 from "@/assets/products/allegra-bautrockner-kt553-1.jpeg";
import allegraBautrocknerKt553_2 from "@/assets/products/allegra-bautrockner-kt553-2.jpeg";

// Import Krefeld products
import {
  aggregateProducts,
  arbeitsbuehnenProducts,
  verdichtungProducts,
  werkzeugeProducts,
  gartenpflegeProducts,
  heizungTrocknungProducts,
  absperrtechnikProducts,
  beschallungProducts,
  kommunikationProducts,
  beleuchtungProducts,
  spezialeffekteProducts,
  moebelZelteProducts,
  geschirrGlaeserBesteckProducts,
  huepfburgenProducts,
  leiternGeruesteProducts,
  kabelStromverteilerProducts,
  buehneProducts,
  traversenRiggingProducts,
  erdbewegungZusatzProducts,
  anhaengerZusatzProducts,
} from "./products/krefeldProducts";

// Import Bonn products
import {
  bonnAggregateProducts,
  bonnArbeitsbuehnenProducts,
  bonnErdbewegungProducts,
  bonnErdbewegungZusatzProducts,
  bonnVerdichtungProducts,
  bonnAnhaengerProducts,
  bonnGartenpflegeProducts,
  bonnWerkzeugProducts,
  bonnTrocknungProducts,
  bonnHeizungProducts,
  bonnStromProducts,
  bonnLeiternProducts,
  bonnGeruestteileProducts,
  bonnZelteProducts,
  bonnMoebelProducts,
  bonnGeschirrProducts,
  bonnBesteckProducts,
  bonnBeschallungProducts,
  bonnBeleuchtungProducts,
  bonnSpezialeffekteProducts,
  bonnHuepfburgProducts,
  bonnAbsperrtechnikProducts,
} from "./products/bonnProducts";

export interface Product {
  id: string;
  name: string;
  description?: string;
  detailedDescription?: string; // Longer description for product detail page
  image?: string; // Primary image (first in images array)
  images?: string[]; // All images for gallery/slider
  videoUrl?: string; // YouTube video URL (primary)
  videoUrls?: string[]; // Additional YouTube video URLs
  pricePerDay?: string;
  priceWeekend?: string;
  features?: string[];
  specifications?: Record<string, string>; // Technical specs key-value pairs
  pdfUrl?: string; // PDF download link (e.g. manual)
  tags?: string[]; // Filter tags
  category?: string; // Product sub-category for sorting
  weightKg?: number;
  sortOrder?: number; // Explicit sort order within category (lower = first)
  rentwareCode?: Record<string, string>;
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
  availableCategories: string[];
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
    description: "Minibagger, Radlader, Dumper und Anbaugeräte für jedes Bauvorhaben.",
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
    title: "Absperr- & Verkehrstechnik",
    description: "Verkehrszeichen, Bauzäune, Warnbaken und komplette Verkehrssicherung.",
    icon: iconAbsperrgitter,
  },
  {
    id: "beschallung",
    title: "Beschallung",
    description: "Lautsprecher, Mikrofone, Mischpulte und PA-Anlagen.",
    icon: iconSpezialeffekte,
  },
  {
    id: "kommunikation",
    title: "Kommunikation",
    description: "Funkgeräte und Kommunikationstechnik für Events und Baustellen.",
    icon: iconSpezialeffekte,
  },
  {
    id: "beleuchtung",
    title: "Beleuchtung",
    description: "LED Spots, Flutlicht, Bühnenlicht und mobile Beleuchtung.",
    icon: iconBeleuchtung,
  },
  {
    id: "buehne",
    title: "Bühne",
    description: "Bühnenelemente, Podeste und Bühnenzubehör.",
    icon: iconBuehne,
  },
  {
    id: "traversen-rigging",
    title: "Traversen & Rigging",
    description: "Traversen, Rigging-Equipment und Bühnenkonstruktionen.",
    icon: iconLedSpots,
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

// Category sort order for trailers (user-specified order)
const trailerCategoryOrder = ["planen", "koffer", "kasten", "laubgitter", "urlaub", "motorrad", "autotransport", "baumaschine", "plattform", "rueckwaertskipp", "aggregat"];

// Shared trailer products with all images - sorted by category then weight
const trailerProducts: Product[] = [
  // === KASTEN (offen) ===
  { 
    id: "kasten-750", 
    name: "750 kg Kastenanhänger", 
    description: "Ladefläche: 200 x 108 x 30 cm", 
    image: imgKasten750, 
    images: [imgKasten750], 
    weightKg: 750, 
    category: "kasten",
    tags: ["ungebremst", "einachser"], 
    rentwareCode: { krefeld: "3EA6HE" } 
  },
  
  // === PLANEN === (S→M→L→XL→XXL→1300→3500→3500XXL)
  { 
    id: "planen-s-750", 
    name: "750 kg Planenanhänger S", 
    description: "Ladefläche: 200 x 108 x 100 cm", 
    image: imgPlanenS750, 
    images: [imgPlanenS750], 
    weightKg: 750, 
    sortOrder: 1,
    category: "planen",
    tags: ["geschlossen", "ungebremst", "einachser"], 
    rentwareCode: { krefeld: "LNQBH7" } 
  },
  { 
    id: "planen-m-750", 
    name: "750 kg Planenanhänger M", 
    description: "Ladefläche: 200 x 108 x 130 cm", 
    image: imgPlanenM750, 
    images: [imgPlanenM750], 
    weightKg: 750, 
    sortOrder: 2,
    category: "planen",
    tags: ["geschlossen", "ungebremst", "einachser"], 
    rentwareCode: { krefeld: "7RLWP2", bonn: "Y9OVFR" } 
  },
  { 
    id: "planen-l-750", 
    name: "750 kg Planenanhänger L", 
    description: "Ladefläche: 200 x 108 x 160 cm", 
    image: imgPlanenL750, 
    images: [imgPlanenL750], 
    weightKg: 750, 
    sortOrder: 3,
    category: "planen",
    tags: ["geschlossen", "ungebremst", "einachser"], 
    rentwareCode: { krefeld: "YNWU3V", bonn: "E4QDT5" } 
  },
  { 
    id: "planen-xl-750", 
    name: "750 kg Planenanhänger XL", 
    description: "Ladefläche: 264 x 124 x 160 cm", 
    image: imgPlanenXL750, 
    images: [imgPlanenXL750], 
    weightKg: 750, 
    sortOrder: 4,
    category: "planen",
    tags: ["geschlossen", "ungebremst", "einachser"], 
    rentwareCode: { krefeld: "7HD28M", bonn: "3G3FM1" } 
  },
  { 
    id: "planen-xxl-750", 
    name: "750 kg Planenanhänger XXL", 
    description: "Ladefläche: 300 x 150 x 180 cm", 
    image: imgPlanenXXL750, 
    images: [imgPlanenXXL750], 
    weightKg: 750, 
    sortOrder: 5,
    category: "planen",
    tags: ["geschlossen", "ungebremst", "einachser"], 
    rentwareCode: { krefeld: "86X7LN", bonn: "ENWG89" } 
  },
  { 
    id: "planen-1300", 
    name: "1300 kg Planenanhänger", 
    description: "Ladefläche: 300 x 150 x 190 cm", 
    image: imgPlanen1300, 
    images: [imgPlanen1300], 
    weightKg: 1300, 
    sortOrder: 6,
    category: "planen",
    tags: ["geschlossen", "gebremst", "einachser"], 
    rentwareCode: { krefeld: "EZQM77", bonn: "QDSW59" } 
  },
  { 
    id: "planen-3500", 
    name: "3500 kg Planenanhänger", 
    description: "Ladefläche: 400 x 200 x 210 cm", 
    image: imgPlanen3500_1, 
    images: [imgPlanen3500_1, imgPlanen3500_2, imgPlanen3500_3, imgPlanen3500_4], 
    weightKg: 3500, 
    sortOrder: 7,
    category: "planen",
    tags: ["geschlossen", "gebremst", "zweiachser"], 
    rentwareCode: { krefeld: "5L3GWF" } 
  },
  { 
    id: "planen-xxl-3500", 
    name: "3500 kg Planenanhänger XXL", 
    description: "Ladefläche: 600 x 250 x 250 cm", 
    image: imgPlanen3500_1, 
    images: [imgPlanen3500_1, imgPlanen3500_2, imgPlanen3500_3, imgPlanen3500_4], 
    weightKg: 3500, 
    sortOrder: 8,
    category: "planen",
    tags: ["geschlossen", "gebremst", "zweiachser"], 
    rentwareCode: { krefeld: "SHR5LA" } 
  },
  
  // === KOFFER ===
  { 
    id: "koffer-750", 
    name: "750 kg Kofferanhänger", 
    description: "Ladefläche: 223 x 147 x 147 cm", 
    image: imgKoffer750_1, 
    images: [imgKoffer750_1, imgKoffer750_2, imgKoffer750_3, imgKoffer750_4], 
    weightKg: 750, 
    category: "koffer",
    tags: ["geschlossen", "ungebremst", "einachser"], 
    rentwareCode: { krefeld: "14KMC5" } 
  },
  { 
    id: "koffer-1500", 
    name: "1500 kg Kofferanhänger", 
    description: "Ladefläche: 300 x 150 x 180 cm", 
    image: imgKoffer1500_1, 
    images: [imgKoffer1500_1, imgKoffer1500_2, imgKoffer1500_3, imgKoffer1500_4, imgKoffer1500_5], 
    weightKg: 1500, 
    category: "koffer",
    tags: ["geschlossen", "gebremst", "einachser"], 
    rentwareCode: { krefeld: "WWSMO3" } 
  },
  { 
    id: "koffer-2000", 
    name: "2000 kg Kofferanhänger", 
    description: "Ladefläche: 300 x 155 x 185 cm", 
    image: imgKoffer2000_1, 
    images: [imgKoffer2000_1, imgKoffer2000_2, imgKoffer2000_3, imgKoffer2000_4, imgKoffer2000_5], 
    weightKg: 2000, 
    category: "koffer",
    tags: ["geschlossen", "gebremst", "zweiachser"], 
    rentwareCode: { krefeld: "WOH21S" } 
  },

  // === BAUMASCHINEN ===
  { 
    id: "baumaschinen-1800", 
    name: "1800 kg Baumaschinenanhänger", 
    description: "Ladefläche: 260 x 150 x 25 cm", 
    image: imgBaumaschinen1800_1, 
    images: [imgBaumaschinen1800_1, imgBaumaschinen1800_2], 
    weightKg: 1800, 
    category: "baumaschine",
    tags: ["baumaschine", "gebremst", "zweiachser"], 
    rentwareCode: { krefeld: "EDE97K", bonn: "3F11ZC" } 
  },
  { 
    id: "baumaschinen-3500", 
    name: "3500 kg Baumaschinenanhänger", 
    description: "Ladefläche: 350 x 168 x 25 cm", 
    image: imgBaumaschinen3500_1, 
    images: [imgBaumaschinen3500_1, imgBaumaschinen3500_2, imgBaumaschinen3500_3], 
    weightKg: 3500, 
    category: "baumaschine",
    tags: ["baumaschine", "gebremst", "zweiachser"], 
    rentwareCode: { krefeld: "7WW3IY", bonn: "WFQBAR" } 
  },

  // === AUTOTRANSPORT ===
  { 
    id: "autotransport-1500", 
    name: "1500 kg Autotransportanhänger", 
    description: "Ladefläche: 301 x 165 x 17 cm", 
    image: imgAutotransport1500_1, 
    images: [imgAutotransport1500_1, imgAutotransport1500_2, imgAutotransport1500_3], 
    weightKg: 1500, 
    category: "autotransport",
    tags: ["autotransport", "gebremst", "einachser"], 
    rentwareCode: { krefeld: "95OAGP" } 
  },
  { 
    id: "autotransport-2700", 
    name: "2700 kg Autotransportanhänger", 
    description: "Ladefläche: 452 x 205 cm", 
    image: imgAutotransport2700_1, 
    images: [imgAutotransport2700_1, imgAutotransport2700_2], 
    weightKg: 2700, 
    category: "autotransport",
    tags: ["autotransport", "gebremst", "zweiachser"], 
    rentwareCode: { krefeld: "OXUI12", bonn: "EVZK31" } 
  },
  { 
    id: "autotransportkipp-2700", 
    name: "2700 kg Autotransportkippanhänger", 
    description: "Ladefläche: 469 x 210 cm", 
    image: imgAutotransportkipp2700_1, 
    images: [imgAutotransportkipp2700_1, imgAutotransportkipp2700_2], 
    weightKg: 2700, 
    category: "autotransport",
    tags: ["autotransport", "gebremst", "zweiachser"], 
    rentwareCode: { krefeld: "4POSMU" } 
  },
  { 
    id: "rueckwaertskipp-2700", 
    name: "2700 kg Rückwärtskippanhänger", 
    description: "Ladefläche: 300 x 150 x 40 cm", 
    image: imgRueckwaertskipp2700_1, 
    images: [imgRueckwaertskipp2700_1, imgRueckwaertskipp2700_2, imgRueckwaertskipp2700_3], 
    weightKg: 2700, 
    category: "rueckwaertskipp",
    tags: ["gebremst", "zweiachser"], 
    rentwareCode: { krefeld: "Q9IXR8", bonn: "131K99" } 
  },

  // === PLATTFORM ===
  { 
    id: "plattform-3500", 
    name: "3500 kg Plattformanhänger", 
    description: "Ladefläche: 512 x 211 cm", 
    image: imgPlattform3500_1, 
    images: [imgPlattform3500_1, imgPlattform3500_2, imgPlattform3500_3, imgPlattform3500_4, imgPlattform3500_5, imgPlattform3500_6], 
    weightKg: 3500, 
    category: "plattform",
    tags: ["gebremst", "zweiachser"], 
    rentwareCode: { krefeld: "BOLUXJ" } 
  },

  // === LAUBGITTER ===
  { 
    id: "kasten-laubgitter-750", 
    name: "750 kg Kastenanhänger & Laubgitter", 
    description: "Ladefläche: 264 x 126 x 100 cm", 
    image: imgKastenLaubgitter750, 
    images: [imgKastenLaubgitter750], 
    weightKg: 750, 
    category: "laubgitter",
    tags: ["laubgitter", "ungebremst", "einachser"], 
    rentwareCode: { krefeld: "RTNVGC", bonn: "9RBYTF" } 
  },
  { 
    id: "kasten-laubgitter-1300", 
    name: "1300 kg Kastenanhänger & Laubgitter", 
    description: "Ladefläche: 255 x 151 x 100 cm", 
    image: imgKastenLaubgitter1300, 
    images: [imgKastenLaubgitter1300], 
    weightKg: 1300, 
    category: "laubgitter",
    tags: ["laubgitter", "gebremst", "einachser"], 
    rentwareCode: { krefeld: "2B9AK5", bonn: "I6QV84" } 
  },

  // === MOTORRAD ===
  { 
    id: "motorrad-3fach-750", 
    name: "750 kg Motorradanhänger 3-fach", 
    description: "Ladefläche: 220 x 131 cm", 
    image: imgMotorrad750_1, 
    images: [imgMotorrad750_1, imgMotorrad750_2, imgMotorrad750_3], 
    weightKg: 750, 
    category: "motorrad",
    tags: ["motorrad", "ungebremst", "einachser"], 
    rentwareCode: { krefeld: "9JL36T", bonn: "BJOMV6" } 
  },
  { 
    id: "motorrad-1500", 
    name: "1500 kg Motorradanhänger", 
    description: "Ladefläche: 301 x 165 x 17 cm", 
    image: imgAutotransport1500_1, 
    images: [imgAutotransport1500_1, imgAutotransport1500_2, imgAutotransport1500_3], 
    weightKg: 1500, 
    category: "motorrad",
    tags: ["motorrad", "gebremst", "einachser"], 
    rentwareCode: { krefeld: "JT132X" } 
  },

  // === URLAUB ===
  { 
    id: "urlaub-750", 
    name: "750 kg Urlaubanhänger", 
    description: "Ladefläche: 150 x 106 x 70 cm", 
    image: imgUrlaub750, 
    images: [imgUrlaub750], 
    weightKg: 750, 
    category: "urlaub",
    tags: ["urlaub", "ungebremst", "einachser"], 
    rentwareCode: { krefeld: "EM45ZK" } 
  },
  
  // === AGGREGAT (from krefeldProducts) ===
  ...anhaengerZusatzProducts,
];

// Erdbewegung products (shared across all locations) - including attachments
const erdbewegungProducts: Product[] = [
  {
    id: "bobcat-e10z",
    name: "1t Bobcat E10Z Minibagger",
    description: "Einsatzgewicht: 1.000 kg | Grabtiefe: 1.820 mm | Breite: 710 mm",
    image: imgBobcatE10z_1,
    images: [imgBobcatE10z_1, imgBobcatE10z_2, imgBobcatE10z_3, imgBobcatE10z_4],
    weightKg: 1000,
    category: "minibagger",
    tags: ["minibagger", "diesel", "bis-1500"],
    rentwareCode: { krefeld: "WNE69F" }
  },
  {
    id: "bobcat-e19",
    name: "1,8t Bobcat E19 Minibagger",
    description: "Einsatzgewicht: 1.800 kg | Grabtiefe: 2.385 mm | Breite: 980 mm",
    image: imgBobcatE19_1,
    images: [imgBobcatE19_1, imgBobcatE19_2, imgBobcatE19_3],
    weightKg: 1800,
    category: "minibagger",
    tags: ["minibagger", "diesel", "1500-2500"],
    rentwareCode: { krefeld: "BG4ZS8" }
  },
  {
    id: "xcmg-xe20e",
    name: "2t XCMG XE20E Minibagger",
    description: "Einsatzgewicht: 2.000 kg | Grabtiefe: 2.385 mm | Breite: 980 mm",
    image: imgXcmgXe20e_1,
    images: [imgXcmgXe20e_1, imgXcmgXe20e_2, imgXcmgXe20e_3],
    weightKg: 2000,
    category: "minibagger",
    tags: ["minibagger", "diesel", "1500-2500"],
    rentwareCode: { krefeld: "UZEDUY" }
  },
  {
    id: "xcmg-xe27e",
    name: "2,7t XCMG XE27E Minibagger",
    description: "Einsatzgewicht: 2.700 kg | Grabtiefe: 2.800 mm | Breite: 1.500 mm",
    image: imgXcmgXe27e_1,
    images: [imgXcmgXe27e_1, imgXcmgXe27e_2, imgXcmgXe27e_3],
    weightKg: 2700,
    category: "minibagger",
    tags: ["minibagger", "diesel", "ab-2500"],
    rentwareCode: { krefeld: "MBUX18" }
  },
  {
    id: "knickdumper-kde550",
    name: "Raddumper / Knickdumper KDe550 4x4 elektrisch",
    description: "Nutzlast: 550 kg | Elektroantrieb | Laufzeit: 8-10h | 4x4 Allradantrieb",
    image: imgKnickdumperKde550_1,
    images: [imgKnickdumperKde550_1, imgKnickdumperKde550_2],
    weightKg: 500,
    category: "dumper",
    tags: ["dumper", "elektro", "bis-1500"],
    rentwareCode: { krefeld: "GH8W6W" }
  },
  {
    id: "cormidi-c60-hitip",
    name: "Cormidi C60 HI TIP Dumper mit Hochauskippfunktion",
    description: "Nutzlast: 600 kg | Dieselmotor | Hochauskippfunktion | Raupenlaufwerk | Kompakt & wendig",
    image: imgCormidiC60_1,
    images: [imgCormidiC60_1, imgCormidiC60_2, imgCormidiC60_3],
    weightKg: 600,
    category: "dumper",
    tags: ["dumper", "diesel", "bis-1500"],
    rentwareCode: { krefeld: "EZHV9G" }
  },
  {
    id: "kramer-5045",
    name: "3t Radlader Kramer 5045",
    description: "Einsatzgewicht: 3.000 kg | Dieselmotor | Schaufel inkl. | Kompakt & vielseitig",
    image: imgKramer5045_1,
    images: [imgKramer5045_1, imgKramer5045_2],
    weightKg: 3000,
    category: "radlader",
    tags: ["radlader", "diesel", "ab-2500"],
    rentwareCode: { krefeld: "PMJJCT" }
  },
  // Include all attachments from krefeldProducts
  ...erdbewegungZusatzProducts,
];

// Sort trailer products by category order, then sortOrder (if defined), then weight
const sortedTrailerProducts = [...trailerProducts].sort((a, b) => {
  const catIndexA = trailerCategoryOrder.indexOf(a.category || "");
  const catIndexB = trailerCategoryOrder.indexOf(b.category || "");
  if (catIndexA !== catIndexB) return catIndexA - catIndexB;
  // Use explicit sortOrder if defined, otherwise fall back to weight
  const sortA = a.sortOrder ?? (a.weightKg || 0);
  const sortB = b.sortOrder ?? (b.weightKg || 0);
  return sortA - sortB;
});

// --------------------
// Bonn product normalization
// Bonn inventory data is intentionally lightweight and often omits `category`/`tags`.
// Filters in the UI rely on these fields, so we enrich the Bonn products here.

function mergeTags(existing?: string[], add?: string[]) {
  return Array.from(new Set([...(existing ?? []), ...(add ?? [])]));
}

function parseKgFromName(name: string): number | undefined {
  // e.g. "1800 kg ..." or "... 70kg"
  const kgMatch = name.match(/(\d{2,5})\s*kg/i);
  if (kgMatch) return Number(kgMatch[1]);
  return undefined;
}

function parseKvaFromName(name: string): number | undefined {
  // e.g. "7,5 kVA" or "2.8 kVA"
  const kvaMatch = name.match(/(\d+(?:[.,]\d+)?)\s*kva/i);
  if (!kvaMatch) return undefined;
  return Number(kvaMatch[1].replace(",", "."));
}

function inferArbeitsbuehneCategory(name: string): string | undefined {
  const n = name.toLowerCase();
  if (n.includes("scherenbühne") || n.includes("scherenbuehne")) return "scherenbuehne";
  if (n.includes("mastbühne") || n.includes("mastbuehne")) return "mastbuehne";
  if (n.includes("gelenk")) return "gelenkbuehne";
  if (n.includes("teleskop")) return "teleskopbuehne";
  return undefined;
}

function inferErdbewegungCategory(name: string): "minibagger" | "radlader" | "dumper" | undefined {
  const n = name.toLowerCase();
  if (n.includes("radlader")) return "radlader";
  if (n.includes("dumper")) return "dumper";
  // default for typical excavator entries
  if (n.match(/\b(bobcat|xcmg|minibagger)\b/i) || n.match(/\b\d+(?:[.,]\d+)?t\b/i)) return "minibagger";
  return undefined;
}

function weightRangeTagFromKg(weightKg?: number): string | undefined {
  if (!weightKg || weightKg <= 0) return undefined;
  if (weightKg <= 1500) return "bis-1500";
  if (weightKg <= 2500) return "1500-2500";
  return "ab-2500";
}

function inferWerkzeugCategory(name: string): string | undefined {
  const n = name.toLowerCase();
  if (n.includes("bohrhammer")) return "bohrhammer";
  if (n.includes("bohrschrauber")) return "bohrschrauber";
  if (n.includes("winkelschleifer")) return "winkelschleifer";
  if (n.includes("hand-kreissäge") || n.includes("hand-kreissaege") || n.includes("kreissäge") || n.includes("kreissaege")) return "kreissaege";
  if (n.includes("steinsäge") || n.includes("steinsaege")) return "kreissaege";
  if (n.includes("abbruchhammer")) return "abbruchhammer";
  if (n.includes("fugenschneider")) return "fugenschneider";
  if (n.includes("mauerschlitzfräse") || n.includes("mauerschlitzfraese")) return "fraese";
  if (n.includes("diamantbohrer") || n.includes("kernbohr")) return "kernbohrer";
  if (n.includes("laser")) return "laser";
  if (n.includes("ortung")) return "ortungsgeraet";
  if (n.includes("sauger")) return "zubehoer"; // keep filterable via "Zubehör"
  if (n.includes("zwangsmischer")) return "zwangsmischer";
  if (n.includes("rüttler") || n.includes("ruettler")) return "betonruettler";
  return undefined;
}

function inferGartenpflegeCategory(name: string): string | undefined {
  const n = name.toLowerCase();
  if (n.includes("kettensäge") || n.includes("kettensaege")) return "kettensaege";
  if (n.includes("heckenschere")) return "heckenschere";
  if (n.includes("freischneider")) return "freischneider";
  if (n.includes("erdbohrer")) return "erdbohrer";
  if (n.includes("bodenhacke") || n.includes("gartenfräse") || n.includes("gartenfraese")) return "bodenhacke";
  if (n.includes("baumstumpffräse") || n.includes("baumstumpffraese") || n.includes("stubben")) return "stubbenfraese";
  if (n.includes("häcksler") || n.includes("haecksler")) return "haecksler";
  if (n.includes("vertikutierer")) return "vertikutierer";
  if (n.includes("hochdruckreiniger")) return "hochdruckreiniger";
  if (n.includes("rasenwalze")) return "rasenwalze";
  if (n.includes("unkraut")) return "unkrautbrenner";
  return undefined;
}

function inferStromCategory(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("brücke") || n.includes("bruecke")) return "bruecke";
  if (n.includes("kabel")) return "kabel";
  return "verteiler";
}

function normalizeBonnErdbewegung(products: Product[]): Product[] {
  return products.map((p) => {
    const anyP = p as unknown as { driveType?: string };
    const machineCategory = inferErdbewegungCategory(p.name);
    const driveType = anyP.driveType;
    const rangeTag = weightRangeTagFromKg(p.weightKg);
    const tagsToAdd = [machineCategory, driveType, rangeTag].filter(Boolean) as string[];

    // Only enforce machine category when we can confidently infer it.
    return {
      ...p,
      category: p.category ?? machineCategory,
      tags: mergeTags(p.tags, tagsToAdd),
    };
  });
}

function normalizeBonnVerdichtung(products: Product[]): Product[] {
  return products.map((p) => {
    const n = p.name.toLowerCase();
    const inferredWeight = p.weightKg ?? parseKgFromName(p.name);
    const inferredCategory =
      p.category ??
      (n.includes("stampfer") ? "stampfer" : n.includes("reversierbar") || n.includes("hvp") ? "ruettelplatte-reversierbar" : "ruettelplatte");

    return {
      ...p,
      weightKg: inferredWeight,
      category: inferredCategory,
    };
  });
}

function normalizeBonnAnhaenger(products: Product[]): Product[] {
  return products.map((p) => {
    const n = p.name.toLowerCase();
    const inferredWeight = p.weightKg ?? parseKgFromName(p.name);
    const inferredBraking = inferredWeight && inferredWeight > 750 ? "gebremst" : "ungebremst";
    const inferredType = n.includes("baumaschinen") ? "baumaschine" : undefined;

    return {
      ...p,
      weightKg: inferredWeight,
      tags: mergeTags(p.tags, [inferredBraking, inferredType].filter(Boolean) as string[]),
      category: p.category ?? (n.includes("aggregat") ? "aggregat" : inferredType),
    };
  });
}

function normalizeBonnWerkzeuge(products: Product[]): Product[] {
  return products.map((p) => ({
    ...p,
    category: p.category ?? inferWerkzeugCategory(p.name),
  }));
}

function normalizeBonnGartenpflege(products: Product[]): Product[] {
  return products.map((p) => ({
    ...p,
    category: p.category ?? inferGartenpflegeCategory(p.name),
  }));
}

function normalizeBonnAggregate(products: Product[]): Product[] {
  return products.map((p) => ({
    ...p,
    category: p.category ?? "aggregat",
    tags: mergeTags(p.tags, (() => {
      const kva = parseKvaFromName(p.name);
      if (!kva) return [];
      if (kva <= 5) return ["bis-5kva"];
      if (kva <= 20) return ["5-20kva"];
      return ["ab-20kva"];
    })()),
  }));
}

function normalizeBonnArbeitsbuehnen(products: Product[]): Product[] {
  return products.map((p) => ({
    ...p,
    category: p.category ?? inferArbeitsbuehneCategory(p.name),
  }));
}

function normalizeBonnStrom(products: Product[]): Product[] {
  return products.map((p) => ({
    ...p,
    category: p.category ?? inferStromCategory(p.name),
  }));
}

function withFixedCategory(products: Product[], category: string): Product[] {
  return products.map((p) => ({ ...p, category: p.category ?? category }));
}

/**
 * Merges primary location products with Krefeld reference products.
 *
 * 1. Enrich: For each primary product, find a matching Krefeld product by
 *    name (case-insensitive) and copy over missing fields (images, specs, PDF,
 *    videos, description, category) so the local entry gets full content.
 *
 * 2. Fill gaps: Krefeld products that have no match in primary (by ID or name)
 *    are appended without a rentwareCode for the target location, signalling
 *    "Auf Anfrage".
 */
function mergeWithFallback(primary: Product[], krefeld: Product[], _locationId: string): Product[] {
  const normalise = (s: string | undefined | null) => (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

  /**
   * Find a Krefeld reference product for a primary product using multiple strategies:
   * 1. Exact ID match
   * 2. Exact normalised name match
   * 3. Primary name is a prefix of the Krefeld name (e.g. "2.1 Soundsystem 1400W RMS" → longer Krefeld title)
   * 4. Krefeld name is a prefix of the primary name (reverse)
   * 5. Primary name is contained within the Krefeld name (e.g. "Funkmikrofon" inside "Sennheiser Funkmikrofon XSW 1-835")
   * 6. Krefeld name is contained within the primary name
   */
  function findRef(p: Product): Product | undefined {
    const pn = normalise(p.name);

    // 1. Exact ID
    const byId = krefeld.find((k) => k.id === p.id);
    if (byId) return byId;

    // 2. Exact normalised name
    const byExactName = krefeld.find((k) => normalise(k.name) === pn);
    if (byExactName) return byExactName;

    if (pn.length >= 8) {
      // 3. Primary name is a prefix of Krefeld name
      const byPrefix = krefeld.find((k) => normalise(k.name).startsWith(pn));
      if (byPrefix) return byPrefix;

      // 4. Krefeld name is a prefix of primary name
      const byReversePrefix = krefeld.find((k) => {
        const kn = normalise(k.name);
        return kn.length >= 8 && pn.startsWith(kn);
      });
      if (byReversePrefix) return byReversePrefix;

      // 5. Primary name is contained in Krefeld name (e.g. "Funkmikrofon" in "Sennheiser Funkmikrofon XSW 1-835")
      const byContained = krefeld.find((k) => normalise(k.name).includes(pn));
      if (byContained) return byContained;

      // 6. Krefeld name is contained in primary name
      const byReverseContained = krefeld.find((k) => {
        const kn = normalise(k.name);
        return kn.length >= 8 && pn.includes(kn);
      });
      if (byReverseContained) return byReverseContained;
    }

    return undefined;
  }

  /**
   * Determine if a Krefeld product is already covered by any primary product
   * using the same multi-strategy matching.
   */
  function isCovered(k: Product): boolean {
    const kn = normalise(k.name);
    return primary.some((p) => {
      if (p.id === k.id) return true;
      const pn = normalise(p.name);
      if (pn === kn) return true;
      if (pn.length >= 8 && kn.startsWith(pn)) return true;
      if (kn.length >= 8 && pn.startsWith(kn)) return true;
      if (pn.length >= 8 && kn.includes(pn)) return true;
      if (kn.length >= 8 && pn.includes(kn)) return true;
      return false;
    });
  }

  // Step 1: enrich primary products with Krefeld content where data is missing
  const enriched = primary.map((p) => {
    const ref = findRef(p);
    if (!ref) return p;
    return {
      ...p,
      // Always use the canonical Krefeld name
      name:           ref.name,
      // Only fill if primary entry lacks the field
      image:          (p.image && p.image !== "/placeholder.svg") ? p.image : (ref.image ?? p.image),
      images:         (p.images && p.images.length > 0 && p.images[0] !== "/placeholder.svg") ? p.images : (ref.images ?? p.images),
      description:    p.description || ref.description,
      detailedDescription: p.detailedDescription ?? ref.detailedDescription,
      specifications: p.specifications ?? ref.specifications,
      pdfUrl:         p.pdfUrl ?? ref.pdfUrl,
      videoUrl:       p.videoUrl ?? ref.videoUrl,
      videoUrls:      p.videoUrls ?? ref.videoUrls,
      category:       p.category ?? ref.category,
      tags:           p.tags ?? ref.tags,
      weightKg:       p.weightKg ?? ref.weightKg,
    };
  });

  // Step 2: Add Krefeld products that are NOT represented in primary at all
  const fallbacks = krefeld
    .filter((k) => !isCovered(k))
    .map((k) => ({ ...k, rentwareCode: undefined }));

  return [...enriched, ...fallbacks];
}

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
      "kommunikation",
      "beleuchtung",
      "buehne",
      "traversen-rigging",
      "moebel-zelte",
      "geschirr-glaeser-besteck",
      "spezialeffekte",
      "huepfburgen",
    ],
    products: {
      "anhaenger": sortedTrailerProducts,
      "erdbewegung": erdbewegungProducts,
      "werkzeuge": werkzeugeProducts,
      "gartenpflege": gartenpflegeProducts,
      "aggregate": aggregateProducts,
      "arbeitsbuehnen": arbeitsbuehnenProducts,
      "verdichtung": verdichtungProducts,
      "kabel-stromverteiler": kabelStromverteilerProducts,
      "leitern-gerueste": leiternGeruesteProducts,
      "heizung-trocknung": heizungTrocknungProducts,
      "absperrtechnik": absperrtechnikProducts,
      "beschallung": beschallungProducts,
      "kommunikation": kommunikationProducts,
      "beleuchtung": beleuchtungProducts,
      "buehne": buehneProducts,
      "traversen-rigging": traversenRiggingProducts,
      "moebel-zelte": moebelZelteProducts,
      "geschirr-glaeser-besteck": geschirrGlaeserBesteckProducts,
      "spezialeffekte": spezialeffekteProducts,
      "huepfburgen": huepfburgenProducts,
    },
  },
  {
    id: "bonn",
    name: "Bonn",
    shortName: "BN",
    address: "Drachenburgstraße 8, 53179 Bonn",
    phone: "02151 417 990 4",
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
      "kommunikation",
      "beleuchtung",
      "buehne",
      "traversen-rigging",
      "moebel-zelte",
      "geschirr-glaeser-besteck",
      "spezialeffekte",
      "huepfburgen",
    ],
    products: {
      // Merge: Bonn-specific items first (with Rentware codes), then fill with Krefeld items not already covered
      "anhaenger": mergeWithFallback(
        [
          ...sortedTrailerProducts.filter((p) => p.rentwareCode?.bonn),
          ...normalizeBonnAnhaenger(bonnAnhaengerProducts as unknown as Product[]),
        ],
        sortedTrailerProducts,
        "bonn"
      ),
      "erdbewegung": mergeWithFallback(
        normalizeBonnErdbewegung([
          ...(bonnErdbewegungProducts as unknown as Product[]),
          ...(bonnErdbewegungZusatzProducts as unknown as Product[]),
        ]),
        erdbewegungProducts,
        "bonn"
      ),
      "werkzeuge": mergeWithFallback(
        normalizeBonnWerkzeuge(bonnWerkzeugProducts as unknown as Product[]),
        werkzeugeProducts,
        "bonn"
      ),
      "gartenpflege": mergeWithFallback(
        normalizeBonnGartenpflege(bonnGartenpflegeProducts as unknown as Product[]),
        gartenpflegeProducts,
        "bonn"
      ),
      "aggregate": mergeWithFallback(
        normalizeBonnAggregate(bonnAggregateProducts as unknown as Product[]),
        aggregateProducts,
        "bonn"
      ),
      "arbeitsbuehnen": mergeWithFallback(
        normalizeBonnArbeitsbuehnen(bonnArbeitsbuehnenProducts as unknown as Product[]),
        arbeitsbuehnenProducts,
        "bonn"
      ),
      "verdichtung": mergeWithFallback(
        normalizeBonnVerdichtung(bonnVerdichtungProducts as unknown as Product[]),
        verdichtungProducts,
        "bonn"
      ),
      "kabel-stromverteiler": mergeWithFallback(
        normalizeBonnStrom(bonnStromProducts as unknown as Product[]),
        kabelStromverteilerProducts,
        "bonn"
      ),
      "leitern-gerueste": mergeWithFallback(
        [
          ...withFixedCategory(bonnLeiternProducts as unknown as Product[], "leiter"),
          ...withFixedCategory(bonnGeruestteileProducts as unknown as Product[], "geruestteile"),
        ],
        leiternGeruesteProducts,
        "bonn"
      ),
      "heizung-trocknung": mergeWithFallback(
        [
          ...withFixedCategory(bonnHeizungProducts as unknown as Product[], "heizung"),
          ...withFixedCategory(bonnTrocknungProducts as unknown as Product[], "trocknung"),
        ],
        heizungTrocknungProducts,
        "bonn"
      ),
      "absperrtechnik": mergeWithFallback(
        bonnAbsperrtechnikProducts as unknown as Product[],
        absperrtechnikProducts,
        "bonn"
      ),
      "beschallung": mergeWithFallback(
        bonnBeschallungProducts as unknown as Product[],
        beschallungProducts,
        "bonn"
      ),
      "kommunikation": kommunikationProducts.map((p) => ({ ...p })),
      "beleuchtung": mergeWithFallback(
        bonnBeleuchtungProducts as unknown as Product[],
        beleuchtungProducts,
        "bonn"
      ),
      "buehne": buehneProducts.map((p) => ({ ...p })),
      "traversen-rigging": traversenRiggingProducts.map((p) => ({ ...p })),
      "moebel-zelte": mergeWithFallback(
        [
          ...(bonnMoebelProducts as unknown as Product[]),
          ...withFixedCategory(bonnZelteProducts as unknown as Product[], "zelt"),
        ],
        moebelZelteProducts,
        "bonn"
      ),
      "geschirr-glaeser-besteck": mergeWithFallback(
        [
          ...withFixedCategory(bonnGeschirrProducts as unknown as Product[], "geschirr"),
          ...withFixedCategory(bonnBesteckProducts as unknown as Product[], "besteck"),
        ],
        geschirrGlaeserBesteckProducts,
        "bonn"
      ),
      "spezialeffekte": mergeWithFallback(
        bonnSpezialeffekteProducts as unknown as Product[],
        spezialeffekteProducts,
        "bonn"
      ),
      "huepfburgen": mergeWithFallback(
        bonnHuepfburgProducts as unknown as Product[],
        huepfburgenProducts,
        "bonn"
      ),
    },
  },
  {
    id: "muelheim",
    name: "Mülheim",
    shortName: "MH",
    address: "Ruhrorter Str. 100, 45478 Mülheim an der Ruhr",
    phone: "02151 417 990 4",
    email: "muelheim@slt-rental.de",
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
      "kommunikation",
      "beleuchtung",
      "buehne",
      "traversen-rigging",
      "moebel-zelte",
      "geschirr-glaeser-besteck",
      "spezialeffekte",
      "huepfburgen",
    ],
    products: {
      "anhaenger": sortedTrailerProducts,
      "erdbewegung": erdbewegungProducts,
      "werkzeuge": werkzeugeProducts,
      "gartenpflege": gartenpflegeProducts,
      "arbeitsbuehnen": arbeitsbuehnenProducts,
      "verdichtung": verdichtungProducts,
      "kabel-stromverteiler": kabelStromverteilerProducts,
      "leitern-gerueste": leiternGeruesteProducts,
      "absperrtechnik": absperrtechnikProducts,
      "beschallung": beschallungProducts,
      "kommunikation": kommunikationProducts,
      "beleuchtung": beleuchtungProducts,
      "buehne": buehneProducts,
      "traversen-rigging": traversenRiggingProducts,
      "moebel-zelte": moebelZelteProducts,
      "geschirr-glaeser-besteck": geschirrGlaeserBesteckProducts,
      "spezialeffekte": spezialeffekteProducts,
      "huepfburgen": huepfburgenProducts,
      "aggregate": [
        {
          id: "mh-kompressor-5m3",
          name: "5 m³ Kompressor Doosan 7/55",
          description: "Leistungsstarker Diesel-Baukompressor (EU Stage V) mit 5 m³/min Volumenstrom – inkl. 8 Betriebsstunden/Tag.",
          image: kompressor5m3_1,
          images: [kompressor5m3_1, kompressor5m3_2],
          category: "kompressor",
          rentwareCode: { muelheim: "" },
          detailedDescription: "Der Doosan 7/55 ist ein robuster Diesel-Baukompressor mit 5 m³/min Volumenstrom und max. 6,8 bar Druck. Die EU Stage V Emissionsklasse sorgt für umweltschonenden Betrieb. Der 65-Liter-Tank ermöglicht längere Einsätze. Inklusive 8 Betriebsstunden pro Tag, Mehrstunden werden mit brutto 10,- € pro Stunde berechnet. Verbrauch wird separat abgerechnet – Rückgabe mit vollem Tank vereinbart, Diesel wird mit brutto 2,45 €/l berechnet. Optional mit Anhänger verfügbar.",
          specifications: {
            "Hersteller": "Doosan",
            "Typ": "7/55",
            "Volumenstrom": "5 m³/min",
            "Max. Druck": "6,8 bar",
            "Emissionsklasse": "EU Stage V",
            "Batteriespannung": "12 V",
            "Anschlüsse": "3x",
            "Drehzahl": "1.500 U/min",
            "Gewicht": "ca. 750 kg",
            "Tankinhalt": "65 l",
            "Kraftstoff": "Diesel",
            "Zusatzausstattung": "Optional mit Anhänger",
          },
        },
      ],
      "heizung-trocknung": mergeWithFallback(
        [
          {
            id: "mh-heizpilz-2kw",
            name: "2 kW Elektro Heizpilz",
            description: "Eleganter Infrarot-Heizstrahler im Pilzdesign – ideal für Terrassen, Events und Außengastronomie. Zwei Heizstufen (1 kW & 2 kW), stufenlos höhenverstellbar, Schutzklasse IP34.",
            image: heizpilz2kw1,
            images: [heizpilz2kw1, heizpilz2kw2, heizpilz2kw3, heizpilz2kw4, heizpilz2kw5],
            category: "heizpilz",
            specifications: {
              "Heizleistung": "1 kW & 2 kW (umschaltbar)",
              "Leistungsaufnahme": "2 kW",
              "Elektroanschluss": "230 V",
              "Wirkungsfläche": "ca. 15 m²",
              "Höhenverstellbar": "194 cm – 210 cm",
              "Heizart": "Infrarot",
              "Schutzklasse": "IP34",
              "Material": "Aluminium / Edelstahl",
            },
            rentwareCode: { muelheim: "" },
          },
          {
            id: "mh-heizluefter-2kw",
            name: "2 kW Elektro Heizlüfter",
            description: "Kompakter Elektro-Heizlüfter mit zwei Heizstufen (1 kW & 2 kW) – ideal für kleine Räume und Baustellen.",
            image: heizluefter2kw1,
            images: [heizluefter2kw1, heizluefter2kw2],
            category: "heizluefter",
            specifications: {
              "Heizleistung": "1 kW & 2 kW (umschaltbar)",
              "Leistungsaufnahme": "2 kW",
              "Elektroanschluss": "230 V",
              "Luftleistung": "500 m³/h",
            },
            rentwareCode: { muelheim: "" },
          },
          {
            id: "mh-heizluefter-3kw",
            name: "Allegra 3 kW Elektro Heizlüfter",
            description: "Kompakter Allegra Elektroheizlüfter mit zwei Heizstufen (1,5 kW & 3 kW) – ideal für mittlere Räume und Baustellen. 230 V Normsteckdose.",
            image: heizluefter3kw1,
            images: [heizluefter3kw1, heizluefter3kw2],
            category: "heizluefter",
            specifications: {
              "Hersteller": "Allegra",
              "Heizleistung": "1,5 kW & 3 kW (umschaltbar)",
              "Leistungsaufnahme": "3 kW",
              "Elektroanschluss": "230 V",
              "Luftleistung": "510 m³/h",
            },
            rentwareCode: { muelheim: "" },
          },
          {
            id: "mh-heizluefter-9kw",
            name: "Allegra 9 kW Elektro Heizlüfter",
            description: "Leistungsstarker Industrie-Elektroheizlüfter mit zwei Heizstufen (4,5 kW & 9 kW) – 400 V Drehstrom.",
            image: heizluefter9kw1,
            images: [heizluefter9kw1, heizluefter9kw2],
            category: "heizluefter",
            specifications: {
              "Hersteller": "Allegra",
              "Heizleistung": "4,5 kW & 9 kW (umschaltbar)",
              "Leistungsaufnahme": "9 kW",
              "Elektroanschluss": "400 V (Drehstrom / CEE)",
              "Luftumwälzung": "845 m³/h",
            },
            rentwareCode: { muelheim: "" },
          },
          {
            id: "mh-bautrockner-kt200",
            name: "Allegra Bautrockner KT200",
            description: "Kompakter Kondensations-Bautrockner mit geeichtem MID-Stromzähler (PH10) – ideal für Räume bis 20 m².",
            image: allegraBautrocknerKt200_1,
            images: [allegraBautrocknerKt200_1, allegraBautrocknerKt200_2],
            category: "bautrockner",
            pdfUrl: "/manuals/allegra-bautrockner-kt200-anleitung.pdf",
            specifications: {
              "Hersteller": "Allegra",
              "Modell": "KT200",
              "Trocknungsfläche": "20 m²",
              "Entfeuchtungsleistung": "bis zu 20 l/24h",
              "Leistung": "350 W",
              "Luftumwälzung": "260 m³/h",
              "Stromanschluss": "230 V – 16 A",
              "Arbeitsbereich": "5 °C – 35 °C",
              "Wassertank": "4 Liter (Abschaltautomatik)",
              "Schlauchanschluss": "Ja",
              "Stromzähler": "Geeichter MID-Zähler PH10",
              "Betriebsstundenzähler": "Ja",
              "Gewicht": "18,50 kg",
            },
            rentwareCode: { muelheim: "" },
          },
          {
            id: "mh-bautrockner-kt553",
            name: "Allegra Bautrockner KT553/KT554",
            description: "Professioneller Kondensations-Bautrockner mit geeichtem MID-Stromzähler – ideal für 50–60 m² Trocknungsfläche.",
            image: allegraBautrocknerKt553_1,
            images: [allegraBautrocknerKt553_1, allegraBautrocknerKt553_2],
            category: "bautrockner",
            pdfUrl: "/manuals/allegra-bautrockner-kt553-anleitung.pdf",
            specifications: {
              "Hersteller": "Allegra",
              "Modell": "KT553 / KT554",
              "Trocknungsfläche": "50–60 m²",
              "Entfeuchtungsleistung": "bis zu 50 l/24h",
              "Leistung": "700 W",
              "Luftumwälzung": "330 m³/h",
              "Stromanschluss": "230 V – 16 A",
              "Arbeitsbereich": "5 °C – 35 °C",
              "Wassertank": "4 Liter (Abschaltautomatik)",
              "Schlauchanschluss": "Ja",
              "Stromzähler": "Geeichter MID-Zähler PH10",
              "Betriebsstundenzähler": "Ja",
              "Gewicht": "30 kg",
            },
            rentwareCode: { muelheim: "" },
          },
        ],
        heizungTrocknungProducts,
        "muelheim"
      ),
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
    return Object.values(location.products).flat();
  }
  
  return location.products[categoryId] || [];
}

export function getAllProductsForLocation(locationId: string): Product[] {
  const location = getLocationById(locationId);
  if (!location) return [];
  return Object.values(location.products).flat();
}

// Get a single product by ID across all locations
export function getProductById(productId: string): Product | undefined {
  for (const location of locations) {
    for (const products of Object.values(location.products)) {
      const found = products.find((p) => p.id === productId);
      if (found) return found;
    }
  }
  return undefined;
}

// Get product with its location and category context
export function getProductWithContext(productId: string): {
  product: Product;
  locationId: string;
  categoryId: string;
} | undefined {
  for (const location of locations) {
    for (const [categoryId, products] of Object.entries(location.products)) {
      const found = products.find((p) => p.id === productId);
      if (found) {
        return {
          product: found,
          locationId: location.id,
          categoryId,
        };
      }
    }
  }
  return undefined;
}

// Generate SEO-friendly slug from product name
export function generateProductSlug(product: Product): string {
  return product.id;
}
