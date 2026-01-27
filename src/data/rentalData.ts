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

export interface Product {
  id: string;
  name: string;
  description?: string;
  image?: string; // Primary image (first in images array)
  images?: string[]; // All images for gallery/slider
  pricePerDay?: string;
  priceWeekend?: string;
  features?: string[];
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
