// Location and category data structure for the rental system

// Category Icons
import iconBagger from "@/assets/icons/category-bagger.png";
import iconVerdichtung from "@/assets/icons/category-verdichtung.png";
import iconWerkzeug from "@/assets/icons/werkzeug.png";
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
import iconTraverse from "@/assets/icons/traverse.png";
import iconLeiterGeruest from "@/assets/icons/leiter-geruest.png";
import iconGeschirrGlaeserBesteck from "@/assets/icons/geschirr-glaeser-besteck.png";
import iconBeschallung from "@/assets/icons/beschallung.png";
import iconBeleuchtungNeu from "@/assets/icons/beleuchtung-neu.png";
import iconKommunikation from "@/assets/icons/kommunikation.png";
import iconGartenpflege from "@/assets/icons/SLT_Rental_Icons_Gartenpflege.png";

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
import imgRueckwaertskipp1500_1 from "@/assets/products/anhaenger/rueckwaertskipp-1500-1.jpg";
import imgRueckwaertskipp1500_2 from "@/assets/products/anhaenger/rueckwaertskipp-1500-2.jpg";
import imgRueckwaertskipp1500_3 from "@/assets/products/anhaenger/rueckwaertskipp-1500-3.jpg";
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
import imgBobcatE35z_1 from "@/assets/products/erdbewegung/bobcat-e35z-1.webp";
import imgBobcatE35z_2 from "@/assets/products/erdbewegung/bobcat-e35z-2.webp";
import imgBobcatE35z_3 from "@/assets/products/erdbewegung/bobcat-e35z-3.webp";
import imgBobcatE35z_4 from "@/assets/products/erdbewegung/bobcat-e35z-4.webp";
import imgBobcatE50z_1 from "@/assets/products/erdbewegung/bobcat-e50z-1.webp";
import imgBobcatE50z_2 from "@/assets/products/erdbewegung/bobcat-e50z-2.webp";
import imgBobcatE50z_3 from "@/assets/products/erdbewegung/bobcat-e50z-3.webp";
import imgBobcatE50z_4 from "@/assets/products/erdbewegung/bobcat-e50z-4.webp";
import imgKettendumperRmd800_1 from "@/assets/products/erdbewegung/kettendumper-rmd800-1.jpeg";
import imgKnickdumperKde550_1 from "@/assets/products/erdbewegung/knickdumper-kde550-1.jpg";
import imgKnickdumperKde550_2 from "@/assets/products/erdbewegung/knickdumper-kde550-2.jpg";
import imgCormidiC60_1 from "@/assets/products/erdbewegung/cormidi-c60-1.jpg";
import imgCormidiC60_2 from "@/assets/products/erdbewegung/cormidi-c60-2.jpg";
import imgCormidiC60_3 from "@/assets/products/erdbewegung/cormidi-c60-3.jpg";
import imgKramer5045_1 from "@/assets/products/erdbewegung/kramer-5045-1.png";
import imgKramer5045_2 from "@/assets/products/erdbewegung/kramer-5045-2.png";
import imgBobcatL28_1 from "@/assets/products/erdbewegung/bobcat-l28-1.jpeg";
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
  modelName?: string; // Manufacturer + model designation shown below the name
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
  compatibleMachines?: string[]; // IDs of machines this accessory is compatible with
  onRequest?: boolean; // Product available on request only (no direct booking)
  driveType?: string; // Drive type: diesel, elektro, benzin
  rentalNotes?: string[]; // Additional rental condition notes (e.g. operating hours, fuel)
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
  // === BAU & HANDWERK ===
  {
    id: "anhaenger",
    title: "Anhänger",
    description: "24/7 mietbar per Codesystem – SMS-Code nach Zahlung, Schloss an Deichsel entsperren, Rückgabe am Abholort.",
    icon: iconAnhaenger,
  },
  {
    id: "erdbewegung",
    title: "Erdbewegung",
    description: "Minibagger (1t–5t), Radlader, Dumper sowie Tieflöffel, Kabellöffel, Grabenräumlöffel, Hydraulikhämmer & Sortiergreifer mieten.",
    icon: iconBagger,
  },
  {
    id: "verdichtung",
    title: "Verdichtung",
    description: "Rüttelplatten, Stampfer und Walzen für professionelle Bodenverdichtung.",
    icon: iconVerdichtung,
  },
  {
    id: "arbeitsbuehnen",
    title: "Arbeitsbühnen",
    description: "Scherenbühnen, Teleskopbühnen und Gelenkbühnen für Höhenarbeiten.",
    icon: iconHebebuehne,
  },
  {
    id: "werkzeuge",
    title: "Werkzeuge",
    description: "Hand- und Elektrowerkzeuge für Bau und Renovierung.",
    icon: iconWerkzeug,
  },
  {
    id: "gartenpflege",
    title: "Gartenpflege",
    description: "Rasenmäher, Vertikutierer, Häcksler und Gartengeräte.",
    icon: iconGartenpflege,
  },
  {
    id: "leitern-gerueste",
    title: "Leitern & Gerüste",
    description: "Leitern, Rollgerüste und Arbeitsplattformen.",
    icon: iconLeiterGeruest,
  },
  {
    id: "aggregate",
    title: "Aggregate",
    description: "Stromerzeuger und Notstromgeräte für Baustelle und Event.",
    icon: iconAggregat,
  },
  {
    id: "kabel-stromverteiler",
    title: "Kabel & Stromverteiler",
    description: "Verlängerungskabel, Kabelbrücken und Stromverteiler.",
    icon: iconKabel,
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
  // === EVENT & VERANSTALTUNG ===
  {
    id: "beleuchtung",
    title: "Beleuchtung",
    description: "LED Spots, Flutlicht, Bühnenlicht und mobile Beleuchtung.",
    icon: iconBeleuchtungNeu,
  },
  {
    id: "beschallung",
    title: "Beschallung",
    description: "Lautsprecher, Mikrofone, Mischpulte und PA-Anlagen.",
    icon: iconBeschallung,
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
    icon: iconTraverse,
  },
  {
    id: "kommunikation",
    title: "Kommunikation",
    description: "Funkgeräte und Kommunikationstechnik für Events und Baustellen.",
    icon: iconKommunikation,
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
    icon: iconGeschirrGlaeserBesteck,
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
    specifications: { "Eigengewicht": "ca. 120 kg", "Nutzlast": "ca. 630 kg" },
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
    specifications: { "Eigengewicht": "ca. 180 kg", "Nutzlast": "ca. 570 kg" },
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
    specifications: { "Eigengewicht": "ca. 200 kg", "Nutzlast": "ca. 550 kg" },
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
    specifications: { "Eigengewicht": "ca. 220 kg", "Nutzlast": "ca. 530 kg" },
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
    specifications: { "Eigengewicht": "ca. 250 kg", "Nutzlast": "ca. 500 kg" },
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
    specifications: { "Eigengewicht": "ca. 280 kg", "Nutzlast": "ca. 470 kg" },
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
    specifications: { "Eigengewicht": "ca. 450 kg", "Nutzlast": "ca. 850 kg" },
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
    specifications: { "Eigengewicht": "ca. 674 kg", "Nutzlast": "ca. 2.826 kg" },
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
    specifications: { "Eigengewicht": "ca. 750 kg", "Nutzlast": "ca. 2.750 kg" },
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
    specifications: { "Eigengewicht": "ca. 378 kg", "Nutzlast": "ca. 372 kg" },
    rentwareCode: { krefeld: "14KMC5", bonn: "ZLNHYD" } 
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
    specifications: { "Eigengewicht": "ca. 500 kg", "Nutzlast": "ca. 1.000 kg" },
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
    specifications: { "Eigengewicht": "ca. 600 kg", "Nutzlast": "ca. 1.400 kg" },
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
    specifications: { "Eigengewicht": "ca. 645 kg", "Nutzlast": "ca. 1.155 kg" },
    compatibleMachines: ["bobcat-e10z", "bobcat-e19", "xcmg-xe20e", "xcmg-xe27e", "bobcat-e35z", "bobcat-e50z"],
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
    specifications: { "Eigengewicht": "ca. 674 kg", "Nutzlast": "ca. 2.826 kg" },
    compatibleMachines: ["xcmg-xe27e", "bobcat-e35z", "bobcat-e50z"],
    rentwareCode: { krefeld: "7WW3IY", bonn: "WFQBAR", muelheim: "GWO6D9" } 
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
    specifications: { "Eigengewicht": "ca. 360 kg", "Nutzlast": "ca. 1.140 kg" },
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
    specifications: { "Eigengewicht": "ca. 653 kg", "Nutzlast": "ca. 2.047 kg" },
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
    specifications: { "Eigengewicht": "ca. 700 kg", "Nutzlast": "ca. 2.000 kg" },
    rentwareCode: { bonn: "4POSMU" } 
  },
  { 
    id: "rueckwaertskipp-1500", 
    name: "1500 kg Rückwärtskippanhänger & Laubgitter", 
    description: "Ladefläche: 300 x 150 x 95 cm | Händische Kippfunktion (Handpumpe)", 
    image: imgRueckwaertskipp1500_3, 
    images: [imgRueckwaertskipp1500_3, imgRueckwaertskipp1500_1, imgRueckwaertskipp1500_2], 
    weightKg: 1500, 
    category: "rueckwaertskipp",
    tags: ["laubgitter", "gebremst", "zweiachser"], 
    specifications: { "Eigengewicht": "ca. 410 kg", "Nutzlast": "ca. 1.090 kg" },
    rentwareCode: { krefeld: "QNRXMH" } 
  },
  { 
    id: "rueckwaertskipp-2700", 
    name: "2700 kg Rückwärtskippanhänger", 
    description: "Ladefläche: 300 x 150 x 40 cm", 
    image: imgRueckwaertskipp2700_1, 
    images: [imgRueckwaertskipp2700_1, imgRueckwaertskipp2700_2, imgRueckwaertskipp2700_3], 
    weightKg: 2700, 
    category: "rueckwaertskipp",
    tags: ["laubgitter", "gebremst", "zweiachser"], 
    specifications: { "Eigengewicht": "ca. 739 kg", "Nutzlast": "ca. 1.961 kg" },
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
    specifications: { "Eigengewicht": "ca. 900 kg", "Nutzlast": "ca. 2.600 kg" },
    rentwareCode: { krefeld: "BOLUXJ", muelheim: "HO4PII" } 
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
    specifications: { "Eigengewicht": "ca. 250 kg", "Nutzlast": "ca. 500 kg" },
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
    specifications: { "Eigengewicht": "ca. 400 kg", "Nutzlast": "ca. 900 kg" },
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
    specifications: { "Eigengewicht": "ca. 148 kg", "Nutzlast": "ca. 602 kg" },
    rentwareCode: { krefeld: "9JL36T", bonn: "BJOMV6", muelheim: "NTIF8C" } 
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
    specifications: { "Eigengewicht": "ca. 360 kg", "Nutzlast": "ca. 1.140 kg" },
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
    specifications: { "Eigengewicht": "ca. 150 kg", "Nutzlast": "ca. 600 kg" },
    rentwareCode: { krefeld: "EM45ZK" } 
  },
  
  // === AGGREGAT (from krefeldProducts) ===
  ...anhaengerZusatzProducts,
];

// Erdbewegung category sort order: Machines first, then attachments, then accessories
const erdbewegungCategoryOrder = [
  // 1. Maschinen (Bagger nach Gewicht, dann Radlader, dann Knicklader, dann Dumper)
  "minibagger",
  "radlader",
  "knicklader",
  "dumper",
  // 2. Anbaugeräte
  "tiefloeffel",
  "kabelloeffel",
  "grabenraeumloeffel",
  "hydraulikhammer",
  "sortiergreifer",
  "roderechen",
  // 3. Zubehör
  "zubehoer",
];

// Erdbewegung products (shared across all locations) - including attachments
const erdbewegungProductsUnsorted: Product[] = [
  {
    id: "bobcat-e10z",
    name: "1t Minibagger",
    modelName: "Bobcat E10Z",
    description: "Einsatzgewicht: 1.000 kg | Grabtiefe: 1.820 mm | Breite: 710 mm",
    image: imgBobcatE10z_1,
    images: [imgBobcatE10z_1, imgBobcatE10z_2, imgBobcatE10z_3, imgBobcatE10z_4],
    weightKg: 1000,
    category: "minibagger",
    tags: ["minibagger", "diesel", "bis-1500", "maschine"],
    rentwareCode: { krefeld: "WNE69F", muelheim: "G63XIE" },
    rentalNotes: [
      "Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.",
      "Zzgl. Verbrauch – Rückgabe mit vollem Tank. Diesel: brutto 2,90 €/l.",
    ],
  },
  {
    id: "bobcat-e19",
    name: "1,8t Minibagger",
    modelName: "Bobcat E19",
    description: "Einsatzgewicht: 1.800 kg | Grabtiefe: 2.385 mm | Breite: 980 mm",
    image: imgBobcatE19_1,
    images: [imgBobcatE19_1, imgBobcatE19_2, imgBobcatE19_3],
    weightKg: 1800,
    category: "minibagger",
    tags: ["minibagger", "diesel", "1500-2500", "maschine"],
    rentwareCode: { krefeld: "BG4ZS8", muelheim: "HHFYMQ" },
    rentalNotes: [
      "Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.",
      "Zzgl. Verbrauch – Rückgabe mit vollem Tank. Diesel: brutto 2,90 €/l.",
    ],
  },
  {
    id: "xcmg-xe20e",
    name: "2t Minibagger",
    modelName: "XCMG XE20E",
    description: "Einsatzgewicht: 2.000 kg | Grabtiefe: 2.385 mm | Breite: 980 mm",
    image: imgXcmgXe20e_1,
    images: [imgXcmgXe20e_1, imgXcmgXe20e_2, imgXcmgXe20e_3],
    weightKg: 2000,
    category: "minibagger",
    tags: ["minibagger", "diesel", "1500-2500", "maschine"],
    rentwareCode: { krefeld: "UZEDUY" },
    rentalNotes: [
      "Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.",
      "Zzgl. Verbrauch – Rückgabe mit vollem Tank. Diesel: brutto 2,90 €/l.",
    ],
  },
  {
    id: "xcmg-xe27e",
    name: "2,7t XCMG XE27E Minibagger",
    description: "Einsatzgewicht: 2.700 kg | Grabtiefe: 2.800 mm | Breite: 1.500 mm",
    image: imgXcmgXe27e_1,
    images: [imgXcmgXe27e_1, imgXcmgXe27e_2, imgXcmgXe27e_3],
    weightKg: 2700,
    category: "minibagger",
    tags: ["minibagger", "diesel", "ab-2500", "maschine"],
    rentwareCode: { krefeld: "MBUX18" },
    rentalNotes: [
      "Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.",
      "Zzgl. Verbrauch – Rückgabe mit vollem Tank. Diesel: brutto 2,90 €/l.",
    ],
  },
  {
    id: "bobcat-e35z",
    name: "3,5t Bobcat E35z Minibagger",
    description: "Einsatzgewicht: 3.500 kg | Grabtiefe: 3.120 mm | Motorleistung: 24,8 kW | Abgasnorm Stufe V",
    detailedDescription: "Der Bobcat E35z ist ein leistungsstarker Minibagger der 3,5-Tonnen-Klasse mit Nullheck-Design für beengte Einsatzorte. Mit einer Grabtiefe von bis zu 3,12 m und einer maximalen Reichweite von 5,26 m am Boden eignet er sich hervorragend für Aushub-, Kanal- und Landschaftsbauarbeiten. Der Stage V Motor mit 24,8 kW (33,4 PS) sorgt für kraftvollen und emissionsarmen Betrieb. Das Laufwerk ist serienmäßig mit Gummiketten ausgestattet, Stahlketten sind optional verfügbar.\n\nVerfügbare Anbaugeräte (Auswahl): Hydraulikhammer für Abbrucharbeiten, Schlegelmäher für Landschaftsgärten, Räumlöffel für Aushubarbeiten, Tieflöffel für Aushubarbeiten, Laserausrüstung für exakte Nivellierung.",
    image: imgBobcatE35z_1,
    images: [imgBobcatE35z_1, imgBobcatE35z_2, imgBobcatE35z_3, imgBobcatE35z_4],
    weightKg: 3500,
    category: "minibagger",
    tags: ["minibagger", "diesel", "ab-2500", "maschine"],
    onRequest: true,
    specifications: {
      "Betriebsgewicht": "ca. 3.500 kg",
      "Motorleistung": "24,8 kW (33,4 PS)",
      "Abgasnorm": "Stufe V",
      "Grabtiefe": "bis zu 3,12 m",
      "Reichweite am Boden": "ca. 5,26 m",
      "Max. Ausschütthöhe": "ca. 3,5 m",
      "Löffelvolumen": "0,1 – 0,15 m³",
      "Laufwerk": "Gummiketten (Stahlketten optional)",
    },
    rentalNotes: [
      "Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.",
      "Zzgl. Verbrauch – Rückgabe mit vollem Tank. Diesel: brutto 2,90 €/l.",
    ],
  },
  {
    id: "bobcat-e50z",
    name: "5t Bobcat E50z Minibagger",
    description: "Einsatzgewicht: 4.800 kg | Grabtiefe: 3.520 mm | Motorleistung: 36,4 kW | Abgasnorm Stufe V",
    detailedDescription: "Der Bobcat E50z ist ein kraftvoller Minibagger der 5-Tonnen-Klasse mit Nullheck-Design. Mit einer maximalen Grabtiefe von 3,52 m, einer Reichweite von 5,98 m und einer Ausschütthöhe von 4,08 m meistert er anspruchsvolle Erd-, Kanal- und Abbrucharbeiten. Der Stage V Motor mit 36,4 kW (49,6 PS) und 99,2 l/min Hydraulikleistung bietet hervorragende Performance. Der Schwenkbereich des Auslegers beträgt 75° links und 55° rechts. Serienmäßig mit Gummiketten, Stahlketten optional.\n\nVerfügbare Anbaugeräte (Auswahl): Hydraulikhammer für Abbrucharbeiten, Schlegelmäher für Landschaftsgärten, Räumlöffel und Tieflöffel für Aushubarbeiten, Greifer zum sicheren Heben und Platzieren von Materialien.",
    image: imgBobcatE50z_1,
    images: [imgBobcatE50z_1, imgBobcatE50z_2, imgBobcatE50z_3, imgBobcatE50z_4],
    weightKg: 4800,
    category: "minibagger",
    tags: ["minibagger", "diesel", "ab-2500", "maschine"],
    onRequest: true,
    specifications: {
      "Betriebsgewicht": "ca. 4,8 t",
      "Motorleistung": "36,4 kW (49,6 PS)",
      "Abgasnorm": "Stufe V",
      "Max. Grabtiefe": "3,52 m",
      "Max. Reichweite": "5,98 m",
      "Ausschütthöhe": "4,08 m",
      "Löffelvolumen": "0,13 – 0,22 m³",
      "Laufwerk": "Gummiketten (Stahlketten optional)",
      "Hydraulikleistung": "99,2 l/min",
      "Schwenkbereich Ausleger": "Links 75°, Rechts 55°",
    },
    rentalNotes: [
      "Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.",
      "Zzgl. Verbrauch – Rückgabe mit vollem Tank. Diesel: brutto 2,90 €/l.",
    ],
  },
  {
    id: "kramer-5045",
    name: "3t Radlader Kramer 5045",
    description: "Einsatzgewicht: 3.000 kg | Dieselmotor | Schaufel inkl. | Kompakt & vielseitig",
    image: imgKramer5045_1,
    images: [imgKramer5045_1, imgKramer5045_2],
    weightKg: 3000,
    category: "radlader",
    tags: ["radlader", "diesel", "ab-2500", "maschine"],
    rentwareCode: { krefeld: "PMJJCT", muelheim: "ZC8JGH" },
    rentalNotes: [
      "Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.",
      "Zzgl. Verbrauch – Rückgabe mit vollem Tank. Diesel: brutto 2,90 €/l.",
    ],
  },
  {
    id: "kramer-5050",
    name: "Radlader 3t Kramer 5050",
    description: "Einsatzgewicht: 3.000 kg | Dieselmotor | Schaufel inkl. | Kompakt & vielseitig",
    image: imgKramer5045_1,
    images: [imgKramer5045_1, imgKramer5045_2],
    weightKg: 3000,
    category: "radlader",
    tags: ["radlader", "diesel", "ab-2500", "maschine"],
    onRequest: true,
    rentalNotes: [
      "Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.",
      "Zzgl. Verbrauch – Rückgabe mit vollem Tank. Diesel: brutto 2,90 €/l.",
    ],
  },
  {
    id: "bobcat-l28-knicklader",
    name: "Bobcat L28 Knicklader",
    description: "Kompakter Knicklader für vielseitige Einsätze auf engen Baustellen",
    image: imgBobcatL28_1,
    images: [imgBobcatL28_1],
    weightKg: 2800,
    category: "knicklader",
    tags: ["knicklader", "diesel", "ab-2500", "maschine"],
    onRequest: true,
    rentalNotes: [
      "Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.",
      "Zzgl. Verbrauch – Rückgabe mit vollem Tank. Diesel: brutto 2,90 €/l.",
    ],
  },
  {
    id: "kettendumper-rmd800",
    name: "Ketten-Dumper RMD-800",
    description: "Nutzlast: 800 kg | Benzinmotor 6,2 PS | Raupenlaufwerk | Rungen für Holz-/Steinplattentransport",
    detailedDescription: "Der Ketten-Dumper RMD-800 ist ein kompakter Raupendumper mit 800 kg Tragfähigkeit und einer Muldenkapazität von 305 l (gestrichen) bzw. 400 l (gehäuft). Mit nur 80 cm Gesamtbreite eignet er sich hervorragend für enge Zugänge. Der 6,2 PS Benzinmotor bietet zuverlässige Leistung, zwei Geschwindigkeitsstufen ermöglichen flexibles Arbeiten. Serienmäßige Rungen ermöglichen den sicheren Transport von Holz oder Steinplatten.",
    image: imgKettendumperRmd800_1,
    images: [imgKettendumperRmd800_1],
    weightKg: 450,
    category: "dumper",
    tags: ["dumper", "benzin", "bis-1500", "maschine"],
    onRequest: true,
    specifications: {
      "Maschinengewicht": "450 kg",
      "Max. Tragfähigkeit": "800 kg",
      "Muldengröße": "305 l / 400 l (gestrichen / gehäuft)",
      "Breite ohne seitliche Bordwände": "75 cm",
      "Gesamtbreite": "80 cm",
      "Gesamthöhe": "126 cm",
      "Gesamtlänge": "213 cm",
      "Innenmaße Kipppritsche (LxBxH)": "131 x 64 x 36 cm",
      "Motorleistung": "6,2 PS",
      "Kraftstoff": "Benzin",
      "Tankinhalt": "6,5 l",
      "Geschwindigkeitsstufen": "2",
      "Extras": "Rungen (für Transport von Holz oder Steinplatten)",
    },
    rentalNotes: [
      "Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.",
      "Zzgl. Verbrauch – Rückgabe mit vollem Tank. Super (Benzin): brutto 2,95 €/l.",
    ],
  },
  {
    id: "cormidi-c60-hitip",
    name: "Cormidi C60 HI TIP Dumper mit Hochauskippfunktion",
    description: "Nutzlast: 600 kg | Dieselmotor | Hochauskippfunktion | Raupenlaufwerk | Kompakt & wendig",
    image: imgCormidiC60_1,
    images: [imgCormidiC60_1, imgCormidiC60_2, imgCormidiC60_3],
    weightKg: 600,
    category: "dumper",
    tags: ["dumper", "diesel", "bis-1500", "maschine"],
    rentwareCode: { krefeld: "EZHV9G" },
    rentalNotes: [
      "Preis gilt für 8 Betriebsstunden/Tag. Mehrstunden werden gesondert berechnet.",
      "Zzgl. Verbrauch – Rückgabe mit vollem Tank. Diesel: brutto 2,90 €/l.",
    ],
  },
  {
    id: "knickdumper-kde550",
    name: "Raddumper / Knickdumper KDe550 4x4 elektrisch",
    description: "Nutzlast: 550 kg | Elektroantrieb | Laufzeit: 8-10h | 4x4 Allradantrieb",
    image: imgKnickdumperKde550_1,
    images: [imgKnickdumperKde550_1, imgKnickdumperKde550_2],
    weightKg: 500,
    category: "dumper",
    tags: ["dumper", "elektro", "bis-1500", "maschine"],
    rentwareCode: { krefeld: "GH8W6W", muelheim: "LKXBX6" },
    rentalNotes: [
      "Preis gilt für 8 Betriebsstunden/Tag (Laufzeit ca. 8–10 h).",
    ],
  },
  // Include all attachments from krefeldProducts
  ...erdbewegungZusatzProducts,
];

// Sort erdbewegung: machines first (Bagger by weight, Radlader, Dumper), then attachments, then accessories
function sortErdbewegung(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const catIndexA = erdbewegungCategoryOrder.indexOf(a.category || "");
    const catIndexB = erdbewegungCategoryOrder.indexOf(b.category || "");
    const idxA = catIndexA >= 0 ? catIndexA : 999;
    const idxB = catIndexB >= 0 ? catIndexB : 999;
    if (idxA !== idxB) return idxA - idxB;
    // Within same category, sort by weight (machines) or name (attachments)
    if (a.weightKg && b.weightKg) return a.weightKg - b.weightKg;
    return a.name.localeCompare(b.name);
  });
}

const erdbewegungProducts = sortErdbewegung(erdbewegungProductsUnsorted);

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

function inferErdbewegungCategory(name: string): "minibagger" | "radlader" | "knicklader" | "dumper" | undefined {
  const n = name.toLowerCase();
  if (n.includes("knicklader")) return "knicklader";
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
  if (n.includes("fliesenschneider")) return "fliesenschneider";
  if (n.includes("abbruchhammer")) return "abbruchhammer";
  if (n.includes("fugenschneider")) return "fugenschneider";
  if (n.includes("mauerschlitzfräse") || n.includes("mauerschlitzfraese")) return "fraese";
  if (n.includes("diamantbohrer") || n.includes("kernbohr")) return "kernbohrer";
  if (n.includes("laser")) return "laser";
  if (n.includes("ortung")) return "ortungsgeraet";
  if (n.includes("sauger")) return "zubehoer"; // keep filterable via "Zubehör"
  if (n.includes("zwangsmischer")) return "zwangsmischer";
  if (n.includes("rüttler") || n.includes("ruettler")) return "betonruettler";
  if (n.includes("trennschleifer")) return "trennschleifer";
  if (n.includes("multicutter") || n.includes("multi-cutter")) return "multicutter";
  if (n.includes("nageler") || n.includes("nagler")) return "nageler";
  if (n.includes("bauleuchte") || n.includes("baulampe")) return "bauleuchte";
  if (n.includes("ladegerät") || n.includes("ladegeraet")) return "ladegeraet";
  if (n.includes("schlagschrauber") || n.includes("drehschlagschrauber")) return "schlagschrauber";
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
   * Extract model numbers from a product name for fuzzy matching.
   * Matches patterns like: ZS1012AC, XG0807AC, ZMP09, HR12L, TM18GTi, GS72-XH, KT200, etc.
   */
  function extractModels(name: string | undefined | null): string[] {
    if (!name) return [];
    const n = name.toLowerCase();
    const matches = n.match(/[a-z]{1,4}\s*[-]?\s*\d{2,6}\s*[-]?\s*[a-z0-9]*/g);
    if (!matches) return [];
    return matches.map((m) => m.replace(/[\s\-]/g, "")).filter((m) => m.length >= 4);
  }

  /**
   * Check if two products share a distinctive model number.
   */
  function shareModel(nameA: string, nameB: string): boolean {
    const modelsA = extractModels(nameA);
    const modelsB = extractModels(nameB);
    if (modelsA.length === 0 || modelsB.length === 0) return false;
    return modelsA.some((ma) => modelsB.some((mb) => ma === mb || ma.includes(mb) || mb.includes(ma)));
  }

  /**
   * Find a Krefeld reference product for a primary product using multiple strategies:
   * 1. Exact ID match
   * 2. Exact normalised name match
   * 3. Primary name is a prefix of the Krefeld name
   * 4. Krefeld name is a prefix of the primary name
   * 5. Primary name is contained within the Krefeld name
   * 6. Krefeld name is contained within the primary name
   * 7. Shared model number (e.g. "ZS1012AC" in both names)
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

      // 5. Primary name is contained in Krefeld name
      const byContained = krefeld.find((k) => normalise(k.name).includes(pn));
      if (byContained) return byContained;

      // 6. Krefeld name is contained in primary name
      const byReverseContained = krefeld.find((k) => {
        const kn = normalise(k.name);
        return kn.length >= 8 && pn.includes(kn);
      });
      if (byReverseContained) return byReverseContained;
    }

    // 7. Model number match (e.g. "12m Scherenbühne ZS1012AC" ↔ "12m Scherenbühne Zoomlion ZS1012AC")
    const byModel = krefeld.find((k) => shareModel(p.name, k.name));
    if (byModel) return byModel;

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
      // Model number match
      if (shareModel(p.name, k.name)) return true;
      return false;
    });
  }

  // Step 1: enrich primary products with Krefeld content where data is missing
  const enriched = primary.map((p) => {
    const ref = findRef(p);
    if (!ref) return p;
    return {
      ...p,
      // Always use the canonical Krefeld ID and name so product lookups work across locations
      id:             ref.id,
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

  // Deduplicate by ID (in case multiple primary products resolved to the same canonical ID)
  const seen = new Set<string>();
  const result: Product[] = [];
  for (const p of [...enriched, ...fallbacks]) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      result.push(p);
    }
  }
  return result;
}

// Locations with their available categories and products
export const locations: LocationData[] = [
  {
    id: "krefeld",
    name: "Krefeld",
    shortName: "KR",
    address: "Anrather Straße 291, 47807 Krefeld-Fichtenhain",
    phone: "02151 417 99 04",
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
    phone: "0228 504 660 61",
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
      "erdbewegung": sortErdbewegung(mergeWithFallback(
        normalizeBonnErdbewegung([
          ...(bonnErdbewegungProducts as unknown as Product[]),
          ...(bonnErdbewegungZusatzProducts as unknown as Product[]),
        ]),
        erdbewegungProducts,
        "bonn"
      )),
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
    address: "Ruhrorter Str. 122, 45478 Mülheim an der Ruhr",
    phone: "02151 417 99 04",
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
          name: "4m³ Kompressor",
          description: "Kompressor inkl. Generator – Doosan 7/45, 4m³/min Volumenstrom, 6 kVA Generator 400V/230V – inkl. 8 Betriebsstunden/Tag.",
          image: kompressor5m3_1,
          images: [kompressor5m3_1, kompressor5m3_2],
          category: "kompressor",
          rentwareCode: { muelheim: "" },
          detailedDescription: "Kompressor inkl. Generator – auf Fahrgestell.\n\ninkl. 8 Betriebsstunden/Tag, Mehrstunden werden mit brutto 10,-€ pro Std. berechnet.\nzzgl. Verbrauch, Tankfüllung je Mietgerät – Rückgabe des Mietgeräts mit vollgetanktem Tank vereinbart. Diesel wird mit brutto 2,85€/l berechnet.",
          specifications: {
            "Marke": "Doosan",
            "Typ": "7/45",
            "Volumenstrom": "4m³/min",
            "Max. Druck": "6,8 bar",
            "Emissionsklasse": "EU Stage V",
            "Batteriespannung": "12 V",
            "Anschlüsse": "3x",
            "Drehzahl": "1500 U/min",
            "Gewicht": "ca. 680 kg",
            "Tankinhalt": "58 l",
            "Kraftstoff": "Diesel",
            "Abgasnorm": "Stage V",
            "Zusatzausstattung": "auf Fahrgestell",
            "Generator": "6 kVA 400V/230V",
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

// Get compatible accessories for a machine (by product ID)
export function getCompatibleAccessories(machineId: string, locationId: string): Product[] {
  const location = getLocationById(locationId);
  if (!location) return [];
  // Search erdbewegung for attachments + anhaenger for transport trailers
  const erdbewegung = location.products["erdbewegung"] || [];
  const anhaenger = location.products["anhaenger"] || [];
  const allProducts = [...erdbewegung, ...anhaenger];
  return allProducts.filter((p) => p.compatibleMachines?.includes(machineId));
}

// Generate SEO-friendly slug from product name
export function generateProductSlug(product: Product): string {
  return product.id;
}
