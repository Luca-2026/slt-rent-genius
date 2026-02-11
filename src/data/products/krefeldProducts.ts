// Krefeld location products - organized by category
// All products use placeholder images until real images are provided

import type { Product } from "../rentalData";

// Benzin Bodenhacke images
import benzinErdbohrer1 from "@/assets/products/benzin-erdbohrer-1.jpeg";
import benzinErdbohrer2 from "@/assets/products/benzin-erdbohrer-2.jpeg";
import freischneider1 from "@/assets/products/freischneider-1.jpeg";
import benzinBodenhacke1 from "@/assets/products/benzin-bodenhacke-1.jpeg";
import benzinBodenhacke2 from "@/assets/products/benzin-bodenhacke-2.jpeg";

// Bodenschutz images
import imgBodenschutz1 from "@/assets/products/erdbewegung/bodenschutz-fahrmatten-1.jpg";
import imgBodenschutz2 from "@/assets/products/erdbewegung/bodenschutz-fahrmatten-2.jpg";
import imgBodenschutz3 from "@/assets/products/erdbewegung/bodenschutz-fahrmatten-3.jpg";
import imgBodenschutz4 from "@/assets/products/erdbewegung/bodenschutz-fahrmatten-4.jpg";
// Dieseltankstelle images
import imgDieseltankstelle1 from "@/assets/products/erdbewegung/dieseltankstelle-400l-1.jpg";
import imgDieseltankstelle2 from "@/assets/products/erdbewegung/dieseltankstelle-400l-2.jpg";
// Hydraulikhammer SHB45 images
import imgHydraulikhammer1 from "@/assets/products/erdbewegung/hydraulikhammer-shb45-1.jpg";
import imgHydraulikhammer2 from "@/assets/products/erdbewegung/hydraulikhammer-shb45-2.jpg";
import imgHydraulikhammer3 from "@/assets/products/erdbewegung/hydraulikhammer-shb45-3.jpg";
// Werkzeuge images
import imgWinkelschleifer from "@/assets/products/werkzeuge/winkelschleifer-gws18v-10.jpg";
import imgBauleuchte from "@/assets/products/werkzeuge/bauleuchte-gli18v-2200c.jpg";
import imgBohrhammer45c from "@/assets/products/werkzeuge/bohrhammer-gbh18v-45c.jpg";
import imgDiamantbohrer from "@/assets/products/werkzeuge/diamantbohrer-ehd1500.jpg";
import imgAbbruchhammer from "@/assets/products/werkzeuge/abbruchhammer-gsh16-28.png";
import imgDrehschlagschrauber1 from "@/assets/products/werkzeuge/drehschlagschrauber-gds18v-1050h.jpg";
import imgDrehschlagschrauber2 from "@/assets/products/werkzeuge/drehschlagschrauber-gds18v-1050h-2.jpg";
import imgNageler from "@/assets/products/werkzeuge/nageler-te-cn.jpg";
// Erdbohrer images
import imgErdbohrer1 from "@/assets/products/gartenpflege/erdbohrer-4308-1.jpg";
import imgErdbohrer2 from "@/assets/products/gartenpflege/erdbohrer-4308-2.jpg";
import imgErdbohrer3 from "@/assets/products/gartenpflege/erdbohrer-4308-3.jpg";
import imgErdbohrer4 from "@/assets/products/gartenpflege/erdbohrer-4308-4.jpg";
import imgBohrschrauber60c from "@/assets/products/werkzeuge/bohrschrauber-gsr18v-60c.jpg";
import imgStaubsauger from "@/assets/products/werkzeuge/staubsauger-gas18v-10l.jpg";
import imgBohrhammer26f from "@/assets/products/werkzeuge/bohrhammer-gbh18v-26f.jpg";
import imgSdsPlusSet from "@/assets/products/werkzeuge/sds-plus-bohrer-meissel-set.jpg";
import imgEinhellBauleuchte from "@/assets/products/werkzeuge/einhell-bauleuchte-te-cl18-2000.jpg";
import imgSaebelsaege from "@/assets/products/werkzeuge/saebelsaege-gsa18v-li-c.jpg";
import imgBohrschrauber12v from "@/assets/products/werkzeuge/bohrschrauber-gsr12v-15.jpg";
import imgMulticutter from "@/assets/products/werkzeuge/multicutter-gop18v-28.jpg";
import imgOrtungsgeraet from "@/assets/products/werkzeuge/ortungsgeraet-dtect200c.jpg";
import imgStaubsaugeraufsatz from "@/assets/products/werkzeuge/staubsaugeraufsatz-gde18v-16.jpg";
import imgFugenschneider1 from "@/assets/products/werkzeuge/fugenschneider-bs50e-1.jpg";
import imgFugenschneider2 from "@/assets/products/werkzeuge/fugenschneider-bs50e-2.jpg";
import imgTrennschleifer from "@/assets/products/werkzeuge/trennschleifer-ts420.jpg";
import imgBetonruettler from "@/assets/products/werkzeuge/betonruettler-ir1000.jpg";

// ============= AGGREGATE =============
export const aggregateProducts: Product[] = [
  {
    id: "bluetti-akkupack-1152",
    name: "Bluetti Akkupack 1152 Wh",
    description: "Tragbarer Akku-Speicher mit 1152 Wh Kapazität",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "akkupack",
    rentwareCode: { krefeld: "7NPRPK" }
  },
  {
    id: "aggregat-2-8kva",
    name: "2,8 kVA Aggregat",
    description: "Kompaktes Notstromaggregat für kleine Verbraucher",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "aggregat",
    rentwareCode: { krefeld: "Q241BU" }
  },
  {
    id: "aggregat-7-5kva",
    name: "7,5 kVA Aggregat",
    description: "Mittelgroßes Stromaggregat für Baustellen und Events",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "aggregat",
    rentwareCode: { krefeld: "59F4T2" }
  },
  {
    id: "aggregat-20kva",
    name: "20 kVA Aggregat",
    description: "Leistungsstarkes Stromaggregat für größere Projekte",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "aggregat",
    rentwareCode: { krefeld: "CGYRQH" }
  },
  {
    id: "aggregat-100kva",
    name: "100 kVA Stromaggregat",
    description: "Industrielles Stromaggregat für Großveranstaltungen",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "aggregat",
    rentwareCode: { krefeld: "E7TNYQ" }
  },
  {
    id: "kompressor-5m3",
    name: "5m³ Kompressor",
    description: "Leistungsstarker Baukompressor",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "kompressor",
    rentwareCode: { krefeld: "4UGSQN" }
  },
];

// ============= ARBEITSBÜHNEN =============
export const arbeitsbuehnenProducts: Product[] = [
  {
    id: "scherenbuehne-8m",
    name: "8m Scherenbühne XG0807AC",
    description: "Elektrische Scherenbühne mit 8m Arbeitshöhe",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "scherenbuehne",
    rentwareCode: { krefeld: "TQ7BOF" }
  },
  {
    id: "scherenbuehne-12m",
    name: "12m Scherenbühne ZS1012AC",
    description: "Elektrische Scherenbühne mit 12m Arbeitshöhe",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "scherenbuehne",
    rentwareCode: { krefeld: "G98ORG" }
  },
  {
    id: "mastbuehne-11m",
    name: "11m Mastbühne ZMP09",
    description: "Kompakte Mastbühne mit 11m Arbeitshöhe",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "mastbuehne",
    rentwareCode: { krefeld: "JQJ2PS" }
  },
  {
    id: "gelenkteleskopsteiger-12m",
    name: "12m Gelenkteleskopsteiger HR12LE",
    description: "Gelenkteleskopbühne mit 12m Arbeitshöhe",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "gelenkbuehne",
    rentwareCode: { krefeld: "XL1WVX" }
  },
];

// ============= VERDICHTUNG =============
export const verdichtungProducts: Product[] = [
  {
    id: "stampfer-gs72-xh",
    name: "Stampfer GS72-XH 70kg",
    description: "Vibrationsstampfer mit 70kg Einsatzgewicht",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    weightKg: 70,
    category: "stampfer",
    rentwareCode: { krefeld: "DNXDNX" }
  },
  {
    id: "ruettelplatte-vp16-44",
    name: "Rüttelplatte VP 16/44 100kg",
    description: "Vorwärts-Rüttelplatte mit 100kg Einsatzgewicht",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    weightKg: 100,
    category: "ruettelplatte",
    rentwareCode: { krefeld: "N71PUB" }
  },
  {
    id: "ruettelplatte-vp25-50",
    name: "Rüttelplatte VP 25/50 130kg",
    description: "Vorwärts-Rüttelplatte mit 130kg Einsatzgewicht",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    weightKg: 130,
    category: "ruettelplatte",
    rentwareCode: { krefeld: "MWQG3Q" }
  },
  {
    id: "ruettelplatte-hvp30-50",
    name: "Rüttelplatte HVP 30/50 180kg reversierbar",
    description: "Reversierbare Rüttelplatte mit 180kg Einsatzgewicht",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    weightKg: 180,
    category: "ruettelplatte-reversierbar",
    rentwareCode: { krefeld: "371IBO" }
  },
  {
    id: "ruettelplatte-hvp38-60",
    name: "Rüttelplatte HVP 38/60 250kg reversierbar",
    description: "Reversierbare Rüttelplatte mit 250kg Einsatzgewicht",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    weightKg: 250,
    category: "ruettelplatte-reversierbar",
    rentwareCode: { krefeld: "5B9HL3" }
  },
];

// ============= WERKZEUGE =============
export const werkzeugeProducts: Product[] = [
  {
    id: "bosch-bohrhammer-gbh18v-26f",
    name: "Bosch Akku Bohrhammer GBH 18V-26 F",
    description: "Akku-Bohrhammer mit SDS-Plus Aufnahme",
    image: imgBohrhammer26f,
    images: [imgBohrhammer26f],
    category: "bohrhammer",
    rentwareCode: { krefeld: "B3P8MO" }
  },
  {
    id: "bosch-bohrhammer-gbh18v-45c",
    name: "Bosch Akku Bohrhammer GBH 18V-45C",
    description: "Schwerer Akku-Bohrhammer mit Bluetooth",
    image: imgBohrhammer45c,
    images: [imgBohrhammer45c],
    category: "bohrhammer",
    rentwareCode: { krefeld: "G8HYWM" }
  },
  {
    id: "bosch-abbruchhammer-gsh16-28",
    name: "Bosch Abbruchhammer GSH 16-28",
    description: "Schwerer Abbruchhammer für anspruchsvolle Arbeiten",
    image: imgAbbruchhammer,
    images: [imgAbbruchhammer],
    category: "abbruchhammer",
    rentwareCode: { krefeld: "JR8BYL" }
  },
  {
    id: "bosch-bohrschrauber-gsr12v-15",
    name: "Bosch Akku Bohrschrauber GSR 12V-15",
    description: "Kompakter Akku-Bohrschrauber",
    image: imgBohrschrauber12v,
    images: [imgBohrschrauber12v],
    category: "bohrschrauber",
    rentwareCode: { krefeld: "3ZZ6ET" }
  },
  {
    id: "bosch-bohrschrauber-gsr18v-60c",
    name: "Bosch Akku Bohrschrauber GSR 18V-60C",
    description: "Leistungsstarker Akku-Bohrschrauber mit Bluetooth",
    image: imgBohrschrauber60c,
    images: [imgBohrschrauber60c],
    category: "bohrschrauber",
    rentwareCode: { krefeld: "QMLQVQ" }
  },
  {
    id: "bosch-winkelschleifer-gws18v-10",
    name: "Bosch Akku Winkelschleifer GWS 18V-10",
    description: "Akku-Winkelschleifer mit 125mm Scheibe",
    image: imgWinkelschleifer,
    images: [imgWinkelschleifer],
    category: "winkelschleifer",
    rentwareCode: { krefeld: "MY6WRS" }
  },
  {
    id: "bosch-handkreissaege-gks18v-57g",
    name: "Bosch Akku Hand-Kreissäge GKS 18V-57G",
    description: "Akku-Handkreissäge mit Führungsschiene",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "kreissaege",
    rentwareCode: { krefeld: "4A7OZI" }
  },
  {
    id: "bosch-saebelsaege-gsa18v-li-c",
    name: "Bosch Akku Säbelsäge GSA 18V-LI C",
    description: "Akku-Säbelsäge mit variabler Geschwindigkeit",
    image: imgSaebelsaege,
    images: [imgSaebelsaege],
    category: "saebelsaege",
    rentwareCode: { krefeld: "ZZOHCI" }
  },
  {
    id: "bosch-multicutter-gop18v-28",
    name: "Bosch Akku-Multicutter GOP 18V-28",
    description: "Multifunktionswerkzeug für verschiedene Anwendungen",
    image: imgMulticutter,
    images: [imgMulticutter],
    category: "multicutter",
    rentwareCode: { krefeld: "W2GTY5" }
  },
  {
    id: "bosch-drehschlagschrauber-gds18v-1050h",
    name: "Bosch Akku Drehschlagschrauber GDS 18V-1050 H",
    description: "Hochleistungs-Schlagschrauber",
    image: imgDrehschlagschrauber1,
    images: [imgDrehschlagschrauber1, imgDrehschlagschrauber2],
    category: "schlagschrauber",
    rentwareCode: { krefeld: "YRSP66" }
  },
  {
    id: "bosch-staubsauger-gas18v-10l",
    name: "Bosch Staubsauger GAS 18V-10 L",
    description: "Akku-Staubsauger für Baustellen",
    image: imgStaubsauger,
    images: [imgStaubsauger],
    category: "staubsauger",
    rentwareCode: { krefeld: "MS2EV3" }
  },
  {
    id: "bosch-staubsaugeraufsatz-gde18v-16",
    name: "Bosch Staubsaugeraufsatz GDE 18V-16",
    description: "Staubabsaugung für Bohrhämmer",
    image: imgStaubsaugeraufsatz,
    images: [imgStaubsaugeraufsatz],
    category: "zubehoer",
    rentwareCode: { krefeld: "7WVKE3" }
  },
  {
    id: "bosch-linienlaser-gll3-80",
    name: "Bosch Linienlaser GLL 3-80",
    description: "360° Linienlaser für präzise Ausrichtung",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "laser",
    rentwareCode: { krefeld: "61VZOZ" }
  },
  {
    id: "bosch-ortungsgeraet-dtect200c",
    name: "Bosch Ortungsgerät D-TECT 200 C",
    description: "Universalortungsgerät für Metall, Holz und Leitungen",
    image: imgOrtungsgeraet,
    images: [imgOrtungsgeraet],
    category: "ortungsgeraet",
    rentwareCode: { krefeld: "99MVV7" }
  },
  {
    id: "bosch-ortungsgeraet-gms120",
    name: "Bosch Ortungsgerät GMS 120",
    description: "Multidetektor für Metall und Leitungen",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "ortungsgeraet",
    rentwareCode: { krefeld: "FFGU4V" }
  },
  {
    id: "bosch-bauleuchte-gli18v-2200c",
    name: "Bosch Akku Bauleuchte GLI 18V-2200 C",
    description: "Akku-Bauleuchte mit 2200 Lumen",
    image: imgBauleuchte,
    images: [imgBauleuchte],
    category: "bauleuchte",
    rentwareCode: { krefeld: "E282P3" }
  },
  {
    id: "einhell-bauleuchte-te-cl18-2000",
    name: "Einhell Akku Bauleuchte TE-CL 18/2000",
    description: "LED-Bauleuchte mit 2000 Lumen",
    image: imgEinhellBauleuchte,
    images: [imgEinhellBauleuchte],
    category: "bauleuchte",
    rentwareCode: { krefeld: "A8YVVO" }
  },
  {
    id: "bosch-ladegeraet-gal18v6-80",
    name: "Bosch 6-fach Ladegerät GAL 18V6-80",
    description: "Schnellladegerät für 6 Akkus gleichzeitig",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "ladegeraet",
    rentwareCode: { krefeld: "CBQG5R" }
  },
  {
    id: "eibenstock-diamantbohrer-ehd1500",
    name: "Eibenstock Diamantbohrer EHD 1500",
    description: "Kernbohrgerät für Beton und Mauerwerk",
    image: imgDiamantbohrer,
    images: [imgDiamantbohrer],
    category: "kernbohrer",
    rentwareCode: { krefeld: "I578B5" }
  },
  {
    id: "mauerschlitzfraese",
    name: "Mauerschlitzfräse",
    description: "Elektrofräse für Kabelschlitze",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "fraese",
    rentwareCode: { krefeld: "XUQECL" }
  },
  {
    id: "einhell-laubbläser-gp-lb",
    name: "Einhell Laubbläser GP-LB 36/210 Li",
    description: "Akku-Laubbläser mit hoher Blasleistung",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "laubbläser",
    rentwareCode: { krefeld: "H9ZZD7" }
  },
  {
    id: "einhell-nageler-te-cn",
    name: "Einhell Akku Nageler TE-CN",
    description: "Akku-Nagelpistole für Dachdecker",
    image: imgNageler,
    images: [imgNageler],
    category: "nageler",
    rentwareCode: { krefeld: "TI6BTL" }
  },
  {
    id: "einhell-heissluftfoehn-te-ha18li",
    name: "Einhell Akku Heißluftföhn TE-HA 18li",
    description: "Akku-Heißluftgebläse",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "heissluftfoehn",
    rentwareCode: { krefeld: "KO8B6L" }
  },
  {
    id: "trennschleifer-ts420",
    name: "Benzin-Trennschleifer TS420",
    description: "Benzin-Trennschleifer für Stein und Beton",
    image: imgTrennschleifer,
    images: [imgTrennschleifer],
    category: "trennschleifer",
    rentwareCode: { krefeld: "J83HOT" }
  },
  {
    id: "fugenschneider-bs50e",
    name: "Fugenschneider BS50E - 13PS",
    description: "Leistungsstarker Fugenschneider",
    image: imgFugenschneider1,
    images: [imgFugenschneider1, imgFugenschneider2],
    category: "fugenschneider",
    rentwareCode: { krefeld: "57UXIA" }
  },
  {
    id: "betonruettler-ir1000",
    name: "Beton Rüttler 2m IR 1000",
    description: "Innenrüttler für Betonverdichtung",
    image: imgBetonruettler,
    images: [imgBetonruettler],
    category: "betonruettler",
    rentwareCode: { krefeld: "TXALE6" }
  },
  {
    id: "sds-plus-bohrer-meissel-set",
    name: "SDS-Plus Bohrer-/Meißel-Set",
    description: "Umfangreiches Set für Bohrhämmer",
    image: imgSdsPlusSet,
    images: [imgSdsPlusSet],
    category: "zubehoer",
    rentwareCode: { krefeld: "JHFAVK" }
  },
];

// ============= GARTENPFLEGE =============
export const gartenpflegeProducts: Product[] = [
  {
    id: "akku-kettensaege-gke18v-40",
    name: "Akku Kettensäge GKE 18V-40",
    description: "Bosch Akku-Kettensäge mit 40cm Schwert",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "kettensaege",
    rentwareCode: { krefeld: "JID3OY" }
  },
  {
    id: "freischneider-ps162",
    name: "Freischneider PS162",
    description: "Benzin-Freischneider für Dickicht",
    image: freischneider1,
    images: [freischneider1],
    category: "freischneider",
    rentwareCode: { krefeld: "86O771" }
  },
  {
    id: "erdbohrer-benzin",
    name: "Benzin-Erdbohrer",
    description: "Motorerdbohrer für Zaunpfähle und Pflanzlöcher",
    image: benzinErdbohrer1,
    images: [benzinErdbohrer1, benzinErdbohrer2],
    category: "erdbohrer",
    rentwareCode: { krefeld: "ZC7HYZ" }
  },
  {
    id: "stihl-erdbohrer-4308",
    name: "Stihl 4308 Erdbohrer",
    description: "Professioneller Erdbohrer von Stihl",
    image: imgErdbohrer1,
    images: [imgErdbohrer1, imgErdbohrer2, imgErdbohrer3, imgErdbohrer4],
    category: "erdbohrer",
    rentwareCode: { krefeld: "XOS34H" }
  },
  {
    id: "hochdruckreiniger",
    name: "Hochdruckreiniger",
    description: "Professioneller Hochdruckreiniger",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "hochdruckreiniger",
    rentwareCode: { krefeld: "V31KWM" }
  },
  {
    id: "bodenhacke-af1212",
    name: "Benzin Bodenhacke / Gartenfräse 6 PS AF1212",
    description: "Motorhacke für Gartenarbeiten",
    image: benzinBodenhacke1,
    images: [benzinBodenhacke1, benzinBodenhacke2],
    category: "bodenhacke",
    rentwareCode: { krefeld: "Q81RP5" }
  },
  {
    id: "baumstumpffraese-f360",
    name: "Baumstumpffräse F-360",
    description: "Fräse zum Entfernen von Baumstümpfen",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "baumstumpffraese",
    rentwareCode: { krefeld: "YJ43UU" }
  },
  {
    id: "haecksler-axt25tc",
    name: "Häcksler AXT25TC",
    description: "Elektro-Häcksler für Gartenabfälle",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "haecksler",
    rentwareCode: { krefeld: "XN3IWG" }
  },
  {
    id: "haecksler-ls95-gx",
    name: "Häcksler LS-95 GX",
    description: "Benzin-Häcksler für größere Mengen",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "haecksler",
    rentwareCode: { krefeld: "4OEGBK" }
  },
  {
    id: "vertikutierer-sa35-vel",
    name: "Vertikutierer SA35-V EL",
    description: "Elektro-Vertikutierer für Rasenpflege",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "vertikutierer",
    rentwareCode: { krefeld: "EP9F7Q" }
  },
  {
    id: "vertikutierer-sa38-bv",
    name: "Vertikutierer SA38 BV",
    description: "Benzin-Vertikutierer für große Flächen",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "vertikutierer",
    rentwareCode: { krefeld: "IXDJ8K" }
  },
  {
    id: "rasenwalze",
    name: "Rasenwalze",
    description: "Walze für Rasenpflege und -anlage",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "rasenwalze",
    rentwareCode: { krefeld: "CH522H" }
  },
];

// ============= HEIZUNG & TROCKNUNG =============
export const heizungTrocknungProducts: Product[] = [
  {
    id: "heizluefter-2kw",
    name: "2 kW Elektro Heizlüfter",
    description: "Kompakter Elektro-Heizlüfter",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "heizluefter",
    rentwareCode: { krefeld: "CD894R" }
  },
  {
    id: "heizpilz-2kw",
    name: "2 kW Elektro Heizpilz",
    description: "Elektro-Heizstrahler für Events",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "heizpilz",
    rentwareCode: { krefeld: "552B4C" }
  },
  {
    id: "heizluefter-3kw",
    name: "Allegra 3 kW Elektro Heizlüfter",
    description: "Leistungsstarker Elektro-Heizlüfter",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "heizluefter",
    rentwareCode: { krefeld: "5FW6KJ" }
  },
  {
    id: "heizluefter-9kw",
    name: "Allegra 9 kW Elektro Heizlüfter",
    description: "Industrieheizlüfter für große Räume",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "heizluefter",
    rentwareCode: { krefeld: "FO81O2" }
  },
  {
    id: "bautrockner-kt200",
    name: "Allegra Bautrockner KT200",
    description: "Bautrockner für Entfeuchtung",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "bautrockner",
    rentwareCode: { krefeld: "3EZNGC" }
  },
  {
    id: "bautrockner-kt553",
    name: "Allegra Bautrockner KT553/KT554",
    description: "Leistungsstarker Bautrockner",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "bautrockner",
    rentwareCode: { krefeld: "Z6BL9U" }
  },
];

// ============= ABSPERRTECHNIK =============
export const absperrtechnikProducts: Product[] = [
  // Verkehrszeichen
  {
    id: "vz-121-10-ra2",
    name: "VZ 121-10, RA2",
    description: "Gefahrzeichen Kurve links",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "verkehrszeichen",
    rentwareCode: { krefeld: "XC3MNE" }
  },
  {
    id: "vz-121-20-ra2",
    name: "VZ 121-20, RA2",
    description: "Gefahrzeichen Kurve rechts",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "verkehrszeichen",
    rentwareCode: { krefeld: "JBQ7S2" }
  },
  {
    id: "vz-123-ra1",
    name: "VZ 123, RA1",
    description: "Gefahrzeichen Baustelle",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "verkehrszeichen",
    rentwareCode: { krefeld: "WH4OQC" }
  },
  {
    id: "vz-123-ra2",
    name: "VZ 123, RA2",
    description: "Gefahrzeichen Baustelle (reflektierend)",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "verkehrszeichen",
    rentwareCode: { krefeld: "UXKG5G" }
  },
  {
    id: "vz-240-ra1",
    name: "VZ 240, RA1",
    description: "Gemeinsamer Fuß- und Radweg",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "verkehrszeichen",
    rentwareCode: { krefeld: "ZSNQ9H" }
  },
  {
    id: "vz-267-ra1",
    name: "VZ 267, RA1",
    description: "Verbot der Einfahrt",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "verkehrszeichen",
    rentwareCode: { krefeld: "NCQ97L" }
  },
  {
    id: "vz-283-10-ra1",
    name: "VZ 283-10, RA1",
    description: "Absolutes Halteverbot Anfang",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "verkehrszeichen",
    rentwareCode: { krefeld: "C7NXIO" }
  },
  {
    id: "vz-283-11-ra1",
    name: "VZ 283-11, RA1",
    description: "Absolutes Halteverbot Mitte",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "verkehrszeichen",
    rentwareCode: { krefeld: "FSBHNJ" }
  },
  {
    id: "vz-283-20-ra1",
    name: "VZ 283-20, RA1",
    description: "Absolutes Halteverbot Ende links",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "verkehrszeichen",
    rentwareCode: { krefeld: "GAWVK6" }
  },
  {
    id: "vz-283-21-ra1",
    name: "VZ 283-21, RA1",
    description: "Absolutes Halteverbot Ende rechts",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "verkehrszeichen",
    rentwareCode: { krefeld: "SBF5T8" }
  },
  {
    id: "vz-283-42cm",
    name: "Verkehrszeichen 283, Absolutes Haltverbot 42 cm",
    description: "Kleines Halteverbotsschild",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "verkehrszeichen",
    rentwareCode: { krefeld: "SH78N1" }
  },
  {
    id: "vz-308-ra1",
    name: "VZ 308, RA1",
    description: "Vorrang vor dem Gegenverkehr",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "verkehrszeichen",
    rentwareCode: { krefeld: "O79BYU" }
  },
  {
    id: "vz-357-ra1",
    name: "VZ 357, RA1",
    description: "Sackgasse",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "verkehrszeichen",
    rentwareCode: { krefeld: "P2P3JU" }
  },
  {
    id: "vz-1000-12-ra1-gr1",
    name: "VZ 1000-12, RA1, Gr. 1",
    description: "Richtungspfeil links (klein)",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "verkehrszeichen",
    rentwareCode: { krefeld: "ANT9D8" }
  },
  {
    id: "vz-1000-12-ra1-gr2",
    name: "VZ 1000-12, RA1, Gr. 2",
    description: "Richtungspfeil links (groß)",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "verkehrszeichen",
    rentwareCode: { krefeld: "DEXR4U" }
  },
  {
    id: "vz-1000-22-ra1-gr1",
    name: "VZ 1000-22, RA1, Gr. 1",
    description: "Richtungspfeil rechts (klein)",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "verkehrszeichen",
    rentwareCode: { krefeld: "D2MTMY" }
  },
  {
    id: "vz-1000-22-ra1-gr2",
    name: "VZ 1000-22, RA1, Gr. 2",
    description: "Richtungspfeil rechts (groß)",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "verkehrszeichen",
    rentwareCode: { krefeld: "ICH8W8" }
  },
  {
    id: "vz-zusatz-neutral-ra1-gr2",
    name: "VZ Zusatz Neutral, RA1, Gr. 2",
    description: "Blanko Zusatzschild",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "verkehrszeichen",
    rentwareCode: { krefeld: "GZZWD3" }
  },
  {
    id: "blanko-zusatzschild-42x23",
    name: "Blanko-Zusatzschild, 42 x 23 cm",
    description: "Beschreibbares Zusatzschild",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "verkehrszeichen",
    rentwareCode: { krefeld: "T17EOU" }
  },
  // Absperrzubehör
  {
    id: "tl-warnleuchte-gelb",
    name: "TL-Warnleuchte, gelb",
    description: "Blinkende Warnleuchte für Absperrungen",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "warnleuchte",
    rentwareCode: { krefeld: "XLIU51" }
  },
  {
    id: "fussplatte-k1-tl",
    name: "Fußplatte K1 TL",
    description: "Fußplatte für Verkehrszeichen",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "zubehoer",
    rentwareCode: { krefeld: "WG72M2" }
  },
  {
    id: "stahl-vierkantrohr-4x4cm-2-5m",
    name: "Stahl-Vierkantrohr, 4x4cm, 2,5m",
    description: "Pfosten für Verkehrszeichen",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "zubehoer",
    rentwareCode: { krefeld: "VVOJM5" }
  },
  {
    id: "wemas-klemmschelle-k1",
    name: "Wemas Klemmschelle K1",
    description: "Schelle zur Schilderbefestigung",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "zubehoer",
    rentwareCode: { krefeld: "WXZIEE" }
  },
  // Absperrgitter
  {
    id: "bauzaun",
    name: "Bauzaun",
    description: "Standard-Bauzaunelement",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "bauzaun",
    rentwareCode: { krefeld: "B8V6OY" }
  },
  {
    id: "bauzaunfuss-kunststoff",
    name: "Bauzaunfuß aus Kunststoffrecycling",
    description: "Standfuß für Bauzaun",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "bauzaun",
    rentwareCode: { krefeld: "96SCQN" }
  },
  {
    id: "mannesmanngitter",
    name: "Mannesmanngitter",
    description: "Absperrgitter für Veranstaltungen",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "absperrgitter",
    rentwareCode: { krefeld: "QQWZPJ" }
  },
  {
    id: "schrankenzaun-ra2",
    name: "Schrankenzaun RA2 weiß/rot",
    description: "Reflektierender Schrankenzaun",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "schrankenzaun",
    rentwareCode: { krefeld: "LANT3O" }
  },
  {
    id: "warnbarke-ra1",
    name: "Warnbarke weiß/rot, RA 1",
    description: "Absperrbarke Standard",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "warnbarke",
    rentwareCode: { krefeld: "DHE9HH" }
  },
  {
    id: "warnbarke-ra2",
    name: "Warnbarke weiß/rot, RA 2",
    description: "Absperrbarke reflektierend",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "warnbarke",
    rentwareCode: { krefeld: "U9BFGZ" }
  },
];

// ============= BESCHALLUNG =============
export const beschallungProducts: Product[] = [
  {
    id: "soundboks-gen3",
    name: "Soundboks Gen.3",
    description: "Bluetooth-Party-Lautsprecher",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "bluetooth-speaker",
    rentwareCode: { krefeld: "48MYNA" }
  },
  {
    id: "soundboks-batteryboks",
    name: "Soundboks Batteryboks",
    description: "Zusatzakku für Soundboks",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "zubehoer",
    rentwareCode: { krefeld: "6FQZ3A" }
  },
  {
    id: "soundsystem-2-1-1400w",
    name: "2.1 Soundsystem 1400W RMS",
    description: "PA-System mit Sub und Tops",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "pa-system",
    rentwareCode: { krefeld: "HP9CD4" }
  },
  {
    id: "das-action-508a",
    name: "D.A.S. Audio Action 508A",
    description: "Aktiver 2-Wege Lautsprecher",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "lautsprecher",
    rentwareCode: { krefeld: "CU51C2" }
  },
  {
    id: "das-vantec-12a",
    name: "D.A.S. Audio Vantec 12A",
    description: "12\" Aktivlautsprecher",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "lautsprecher",
    rentwareCode: { krefeld: "TJOHWT" }
  },
  {
    id: "das-vantec-18a",
    name: "D.A.S. Audio Vantec 18A",
    description: "18\" aktiver Subwoofer",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "subwoofer",
    rentwareCode: { krefeld: "I3RY5W" }
  },
  {
    id: "km-distanzstange-21366",
    name: "K&M 21366 Distanzstange",
    description: "Distanzstange für Subwoofer/Tops",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "stativ",
    rentwareCode: { krefeld: "MVFUVW" }
  },
  {
    id: "midas-dl16-stagebox",
    name: "Midas DL16 Digital Stagebox",
    description: "16-Kanal digitale Stagebox",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "stagebox",
    rentwareCode: { krefeld: "BIAGN6" }
  },
  {
    id: "yamaha-dm3",
    name: "Yamaha DM3",
    description: "Digitales Mischpult",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "mischpult",
    rentwareCode: { krefeld: "1BNTNX" }
  },
  {
    id: "pioneer-cdj2000-nxs",
    name: "Pioneer CDJ 2000 NXS",
    description: "Professioneller DJ-Player",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "dj-equipment",
    rentwareCode: { krefeld: "PAVOZ5" }
  },
  {
    id: "pioneer-djm900-nxs2",
    name: "Pioneer DJM 900 NXS2",
    description: "Professioneller DJ-Mixer",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "dj-equipment",
    rentwareCode: { krefeld: "SZ3C5J" }
  },
  {
    id: "shure-qlxd4e-empfaenger",
    name: "Shure QLXD4E Empfänger",
    description: "Digitaler Funkempfänger",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "mikrofon",
    rentwareCode: { krefeld: "5O2XVJ" }
  },
  {
    id: "shure-qlxd2-beta58-handsender",
    name: "Shure QLXD2/Beta58 Handsender",
    description: "Handfunkmikrofon",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "mikrofon",
    rentwareCode: { krefeld: "5ZVFRZ" }
  },
  {
    id: "shure-qlxd1-taschensender",
    name: "Shure QLXD1 Taschensender",
    description: "Taschensender für Headsets",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "mikrofon",
    rentwareCode: { krefeld: "C9OJPF" }
  },
  {
    id: "funkmikrofon",
    name: "Funkmikrofon",
    description: "Kabelloses Mikrofon",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "mikrofon",
    rentwareCode: { krefeld: "6UTPYZ" }
  },
];

// ============= KOMMUNIKATION (Funkgeräte) =============
export const kommunikationProducts: Product[] = [
  {
    id: "uhf-funkgeraet",
    name: "UHF Funkgerät",
    description: "Professionelles Handfunkgerät",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "funkgeraet",
    rentwareCode: { krefeld: "4PPBU1" }
  },
  {
    id: "uhf-funkgeraet-lautsprecher",
    name: "UHF Funkgerät Lautsprecher",
    description: "Externer Lautsprecher für Funkgerät",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "zubehoer",
    rentwareCode: { krefeld: "OZHNRX" }
  },
];

// ============= BELEUCHTUNG =============
export const beleuchtungProducts: Product[] = [
  {
    id: "led-outdoorscheinwerfer-tourled50xcr",
    name: "LED Outdoorscheinwerfer TourLED 50 XCR",
    description: "Professioneller LED-Scheinwerfer outdoor",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "scheinwerfer",
    rentwareCode: { krefeld: "QKTPFF" }
  },
  {
    id: "led-4er-bar",
    name: "LED 4er Bar",
    description: "4-fach LED-Leiste mit Stativ",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "led-bar",
    rentwareCode: { krefeld: "7MTT9O" }
  },
  {
    id: "led-beleuchtungsset-single",
    name: "LED Beleuchtungsset single",
    description: "Einzelnes LED-Beleuchtungsset",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "beleuchtungsset",
    rentwareCode: { krefeld: "G47Y4H" }
  },
  {
    id: "led-moving-head-vector-spot",
    name: "LED Moving Head Vector Spot Zoom 2.0",
    description: "Moving Head Spot mit Zoom",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "moving-head",
    rentwareCode: { krefeld: "VE92CT" }
  },
  {
    id: "slt-led-fluter-rgbwauv",
    name: "SLT LED Fluter RGBWAUV",
    description: "LED-Fluter mit RGBWAUV",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "led-fluter",
    rentwareCode: { krefeld: "5N4U12" }
  },
  {
    id: "showtec-sunstrip-active-mkii",
    name: "Showtec Sunstrip Active MKII",
    description: "Blinder-Leiste für Bühnen",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "blinder",
    rentwareCode: { krefeld: "1E8ME4" }
  },
];

// ============= SPEZIALEFFEKTE =============
export const spezialeffekteProducts: Product[] = [
  {
    id: "adj-fog-fury-jett-pro",
    name: "ADJ Fog Fury Jett PRO",
    description: "CO2-Effekt Nebelmaschine",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "nebelmaschine",
    rentwareCode: { krefeld: "H77LBM" }
  },
  {
    id: "kalt-funkenfontaene",
    name: "Kalt-Funkenfontäne",
    description: "Kalte Pyrotechnik für Events",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "pyrotechnik",
    rentwareCode: { krefeld: "IHAKJD" }
  },
];

// ============= MÖBEL & ZELTE =============
export const moebelZelteProducts: Product[] = [
  {
    id: "partyzelt-3x3m",
    name: "Partyzelt 3x3m",
    description: "Kleines Pagodenzelt",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "zelt",
    rentwareCode: { krefeld: "U5FLRB" }
  },
  {
    id: "partyzelt-4x4m",
    name: "Partyzelt 4x4m",
    description: "Mittleres Pagodenzelt",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "zelt",
    rentwareCode: { krefeld: "4ZSXIQ" }
  },
  {
    id: "partyzelt-4x6m",
    name: "Partyzelt 4x6m",
    description: "Partyzelt für ca. 40 Personen",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "zelt",
    rentwareCode: { krefeld: "K12XM9" }
  },
  {
    id: "eventzelt-6x8m",
    name: "Eventzelt 6x8m extra hoch",
    description: "Großes Eventzelt mit extra Höhe",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "zelt",
    rentwareCode: { krefeld: "7PGYQB" }
  },
  {
    id: "bierzeltgarnitur-set",
    name: "Bierzeltgarnitur-Set",
    description: "1 Tisch und 2 Bänke",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "moebel",
    rentwareCode: { krefeld: "5S2ECT" }
  },
  {
    id: "bierzeltgarnitur-hussen-set-weiss",
    name: "Bierzeltgarnitur Hussen-Set weiß",
    description: "Komplettset mit weißen Hussen",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "moebel",
    rentwareCode: { krefeld: "1MYLJ5" }
  },
  {
    id: "stehtisch",
    name: "Stehtisch",
    description: "Klappbarer Stehtisch",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "moebel",
    rentwareCode: { krefeld: "J1MZJQ" }
  },
  {
    id: "stehtisch-husse-weiss",
    name: "Stehtisch Husse weiß",
    description: "Weiße Husse für Stehtisch",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "husse",
    rentwareCode: { krefeld: "AOZ99O" }
  },
  {
    id: "stehtisch-husse-schwarz",
    name: "Stehtisch Husse schwarz",
    description: "Schwarze Husse für Stehtisch",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "husse",
    rentwareCode: { krefeld: "V9E8C7" }
  },
  {
    id: "stuhl-weiss",
    name: "Stuhl weiß",
    description: "Weißer Klappstuhl",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "moebel",
    rentwareCode: { krefeld: "3KTRT8" }
  },
  {
    id: "getraenkekuehlschrank-236l",
    name: "Getränkekühlschrank 236l",
    description: "Kühlschrank mit Glastür",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "kuehlgeraet",
    rentwareCode: { krefeld: "Q3VB7F" }
  },
];

// ============= GESCHIRR, GLÄSER & BESTECK =============
export const geschirrGlaeserBesteckProducts: Product[] = [
  // Gläser
  {
    id: "burgunderglas-brunelli-10er",
    name: "Burgunderglas Brunelli, 10er Set",
    description: "Elegante Rotweingläser",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "glaeser",
    rentwareCode: { krefeld: "C2Z5S4" }
  },
  {
    id: "rieslingglas-brunelli-12er",
    name: "Rieslingglas Brunelli, 12er Set",
    description: "Weißweingläser",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "glaeser",
    rentwareCode: { krefeld: "CFDC7J" }
  },
  {
    id: "champagnerglas-brunelli-14er",
    name: "Champagnerglas Brunelli, 14er Set",
    description: "Champagnerflöten",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "glaeser",
    rentwareCode: { krefeld: "SLGIZH" }
  },
  {
    id: "willi-becher-0-2l-40er",
    name: "Willi Becher 0,2l, 40er Set",
    description: "Biergläser 0,2l",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "glaeser",
    rentwareCode: { krefeld: "UK1Q7C" }
  },
  {
    id: "kaffeetasse-12er",
    name: "Kaffeetasse, 12er Set",
    description: "Kaffeetassen mit Untertasse",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "tassen",
    rentwareCode: { krefeld: "W3X799" }
  },
  // Geschirr
  {
    id: "teller-deluxe-27-10er",
    name: "Teller Deluxe 27, 10er Set",
    description: "Flache Teller 27cm",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "teller",
    rentwareCode: { krefeld: "NZWMHN" }
  },
  {
    id: "dessertteller-deluxe-21-10er",
    name: "Dessertteller Deluxe 21, 10er Set",
    description: "Dessertteller 21cm",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "teller",
    rentwareCode: { krefeld: "VIGSG2" }
  },
  {
    id: "teller-simply-25-10er",
    name: "Teller SIMPLY 25, 10er Set",
    description: "Flache Teller 25cm",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "teller",
    rentwareCode: { krefeld: "1I2HWN" }
  },
  {
    id: "dessertteller-simply-19-10er",
    name: "Dessertteller SIMPLY 19, 10er Set",
    description: "Dessertteller 19cm",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "teller",
    rentwareCode: { krefeld: "DRP3ZX" }
  },
  {
    id: "teller-tief-simply-20-10er",
    name: "Teller tief SIMPLY 20, 10er Set",
    description: "Tiefe Teller / Suppenteller 20cm",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "teller",
    rentwareCode: { krefeld: "CYKHB6" }
  },
  {
    id: "schuessel-deluxe-18-10er",
    name: "Schüssel Deluxe 18, 10er Set",
    description: "Schüsseln 18cm",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "schuessel",
    rentwareCode: { krefeld: "8SXZKZ" }
  },
  {
    id: "schuessel-simply-15-10er",
    name: "Schüssel SIMPLY 15, 10er Set",
    description: "Schüsseln 15cm",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "schuessel",
    rentwareCode: { krefeld: "7BS99N" }
  },
  {
    id: "aschenbecher-glas",
    name: "Aschenbecher Glas",
    description: "Glas-Aschenbecher",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "zubehoer",
    rentwareCode: { krefeld: "QNIZSP" }
  },
  {
    id: "buffet-tellerwaermer",
    name: "2-in-1-Buffet- und Tellerwärmer, elektrisch",
    description: "Elektrischer Speisenwärmer",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "warmhaltegeraet",
    rentwareCode: { krefeld: "E4FVHB" }
  },
  {
    id: "spuelmaschine-frontlader",
    name: "Gastro-Spülmaschinen Frontlader",
    description: "Gewerbespülmaschine",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "spuelmaschine",
    rentwareCode: { krefeld: "DFGFG2" }
  },
  // Besteck
  {
    id: "gabel-gross-deluxe-19-10er",
    name: "Gabel groß Deluxe 19, 10er Set",
    description: "Tafelgabeln",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "besteck",
    rentwareCode: { krefeld: "5GN1EH" }
  },
  {
    id: "gabel-klein-deluxe-14-10er",
    name: "Gabel klein Deluxe 14, 10er Set",
    description: "Kuchengabeln",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "besteck",
    rentwareCode: { krefeld: "GB31E4" }
  },
  {
    id: "gabel-simply-19-10er",
    name: "Gabel SIMPLY 19, 10er Set",
    description: "Tafelgabeln",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "besteck",
    rentwareCode: { krefeld: "KX7QQ4" }
  },
  {
    id: "loeffel-gross-deluxe-19-10er",
    name: "Löffel groß Deluxe 19, 10er Set",
    description: "Tafellöffel",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "besteck",
    rentwareCode: { krefeld: "QQQ616" }
  },
  {
    id: "loeffel-klein-deluxe-14-10er",
    name: "Löffel klein Deluxe 14, 10er Set",
    description: "Teelöffel",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "besteck",
    rentwareCode: { krefeld: "9QYWO9" }
  },
  {
    id: "loeffel-simply-13-10er",
    name: "Löffel SIMPLY 13, 10er Set",
    description: "Kaffeelöffel",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "besteck",
    rentwareCode: { krefeld: "ENS2MB" }
  },
  {
    id: "loeffel-simply-19-10er",
    name: "Löffel SIMPLY 19, 10er Set",
    description: "Tafellöffel",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "besteck",
    rentwareCode: { krefeld: "MVUAG2" }
  },
  {
    id: "messer-deluxe-21-10er",
    name: "Messer Deluxe 21, 10er Set",
    description: "Tafelmesser",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "besteck",
    rentwareCode: { krefeld: "8ZQ4K9" }
  },
  {
    id: "messer-simply-20-10er",
    name: "Messer SIMPLY 20, 10er Set",
    description: "Tafelmesser",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "besteck",
    rentwareCode: { krefeld: "LKA1DW" }
  },
];

// ============= HÜPFBURGEN =============
export const huepfburgenProducts: Product[] = [
  {
    id: "huepfburg-lamar",
    name: "HappyHop Hüpfburg Lamar 2,8x2,1m",
    description: "Kleine Hüpfburg für den Garten",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "huepfburg",
    rentwareCode: { krefeld: "RC5ZQQ" }
  },
  {
    id: "huepfburg-wasserpark",
    name: "Hüpfburg Wasserpark 3m x 4m",
    description: "Hüpfburg mit Wasserrutsche",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "huepfburg",
    rentwareCode: { krefeld: "JLXJUH" }
  },
  {
    id: "huepfburg-rollercoaster-1",
    name: "Hüpfburg Rollercoaster 4,9x4m",
    description: "Große Hüpfburg mit Rutsche",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "huepfburg",
    rentwareCode: { krefeld: "A92U2I" }
  },
  {
    id: "huepfburg-clown",
    name: "Hüpfburg Clown 6,1x5,2m",
    description: "Extra große Hüpfburg Clown-Motiv",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "huepfburg",
    rentwareCode: { krefeld: "Y6ASNV" }
  },
  {
    id: "huepfburg-rollercoaster-2",
    name: "Hüpfburg Rollercoaster 4,9x4m",
    description: "Große Hüpfburg mit Rutsche (2. Exemplar)",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "huepfburg",
    rentwareCode: { krefeld: "TRHPW2" }
  },
];

// ============= LEITERN & GERÜSTE =============
export const leiternGeruesteProducts: Product[] = [
  {
    id: "stehleiter-hailo-l60-6stufen",
    name: "Hailo L60 - 6 Stufen",
    description: "Alu-Stehleiter 6 Stufen",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "stehleiter",
    rentwareCode: { krefeld: "7HKFN5" }
  },
  {
    id: "stehleiter-kaiserthal-l50-5stufen",
    name: "Kaiserthal L50 - 5 Stufen",
    description: "Alu-Stehleiter 5 Stufen",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "stehleiter",
    rentwareCode: { krefeld: "7I1HQL" }
  },
  {
    id: "mehrzweckleiter-3x11",
    name: "Mehrzweckleiter 3x11",
    description: "Kombileiter 3x11 Sprossen",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "kombileiter",
    rentwareCode: { krefeld: "IMR9B9" }
  },
  {
    id: "mehrzweckleiter-3x12",
    name: "Mehrzweckleiter 3x12",
    description: "Kombileiter 3x12 Sprossen",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "kombileiter",
    rentwareCode: { krefeld: "7XT9BR" }
  },
  {
    id: "rollgeruest-krause-3-3m",
    name: "Krause Rollgerüst 3,3 m (2x1,2m)",
    description: "Aluminium-Rollgerüst 3,3m Arbeitshöhe",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "rollgeruest",
    rentwareCode: { krefeld: "FSQFEL" }
  },
  // Gerüstteile (für separate Vermietung)
  {
    id: "krause-auslegerstuetze",
    name: "Krause Auslegerstütze",
    description: "Zusatzstütze für Rollgerüst",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "geruestteil",
    rentwareCode: { krefeld: "5AEGBH" }
  },
  {
    id: "krause-diagonale-2m",
    name: "Krause Diagonale Feldlänge 2,00 m",
    description: "Diagonalstrebe für Rollgerüst",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "geruestteil",
    rentwareCode: { krefeld: "YE4GIK" }
  },
  {
    id: "krause-belagbuehne-2m",
    name: "Krause Belagbühne 2,00 m",
    description: "Arbeitsfläche für Rollgerüst",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "geruestteil",
    rentwareCode: { krefeld: "N2KGOX" }
  },
  {
    id: "krause-belagbuehne-durchstieg-2m",
    name: "Kause Belagbühne mit Durchstieg 2,00 m",
    description: "Arbeitsfläche mit Einstieg",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "geruestteil",
    rentwareCode: { krefeld: "TJLWHT" }
  },
  {
    id: "krause-bordbrettset-150cm",
    name: "Krause Bordbrettset 150cm Breite",
    description: "Seitenschutz für Rollgerüst",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "geruestteil",
    rentwareCode: { krefeld: "VA7FF8" }
  },
  {
    id: "krause-fahrbase-150",
    name: "Krause Fahrbase 150",
    description: "Fahrwerk für Rollgerüst",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "geruestteil",
    rentwareCode: { krefeld: "65KU3H" }
  },
  {
    id: "krause-guardmatic-system-2m",
    name: "Krause GuardMatic-System | Feldlänge 2,00 m",
    description: "Geländersystem für Rollgerüst",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "geruestteil",
    rentwareCode: { krefeld: "URLSCG" }
  },
  {
    id: "krause-vertikalrahmen-1x1-5m",
    name: "Krause Vertikalrahmen 1,00 x 1,50 m",
    description: "Aufstockrahmen 1m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "geruestteil",
    rentwareCode: { krefeld: "2EPETD" }
  },
  {
    id: "krause-vertikalrahmen-2x1-5m",
    name: "Krause Vertikalrahmen 2,00 x 1,50 m",
    description: "Aufstockrahmen 2m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "geruestteil",
    rentwareCode: { krefeld: "E9ZNCN" }
  },
];

// ============= KABEL & STROMVERTEILER =============
export const kabelStromverteilerProducts: Product[] = [
  // Stromverteiler
  {
    id: "cee-16a-uv-5xschuko",
    name: "CEE 16A UV (mit Anschlusskabel) auf 5x 16A Schuko",
    description: "Verteiler CEE16A auf 5x Schuko",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "stromverteiler",
    rentwareCode: { krefeld: "7C1I5T" }
  },
  {
    id: "cee-16a-uv-3xschuko",
    name: "CEE 16A UV auf 3x 16A Schuko",
    description: "Verteiler CEE16A auf 3x Schuko",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "stromverteiler",
    rentwareCode: { krefeld: "69PG1T" }
  },
  {
    id: "cee-32a-uv-6xschuko",
    name: "CEE 32A UV auf 6x 16A Schuko",
    description: "Verteiler CEE32A auf 6x Schuko",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "stromverteiler",
    rentwareCode: { krefeld: "KYB943" }
  },
  {
    id: "cee-63a-uv-2x32a-1x16a-6xschuko",
    name: "CEE 63A UV auf 2x CEE 32A, 1x CEE 16A, 6x Schuko IP45",
    description: "Großverteiler CEE63A",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "stromverteiler",
    rentwareCode: { krefeld: "H5YEKN" }
  },
  {
    id: "cee-63a-uv-2x32a-2x16a",
    name: "CEE 63A UV auf 2x CEE 32A, 2x CEE 16A",
    description: "Verteiler CEE63A auf CEE-Abgänge",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "stromverteiler",
    rentwareCode: { krefeld: "42SR2E" }
  },
  {
    id: "anschlussschrank-55kva",
    name: "Anschlussschrank 55 kVA",
    description: "Großer Anschlussschrank",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "anschlussschrank",
    rentwareCode: { krefeld: "F9UF3M" }
  },
  {
    id: "anschlussverteilerschrank-24kva",
    name: "Anschlussverteilerschrank 24 kVA",
    description: "Mittlerer Anschlussschrank",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "anschlussschrank",
    rentwareCode: { krefeld: "CIRWT3" }
  },
  {
    id: "anschlussverteilerschrank-44kva",
    name: "Anschlussverteilerschrank 44kVA",
    description: "Großer Anschlussschrank",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "anschlussschrank",
    rentwareCode: { krefeld: "2EKAZB" }
  },
  {
    id: "verteilerschrank-44kva",
    name: "Verteilerschrank 44 kVA",
    description: "Stromverteilerschrank",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "anschlussschrank",
    rentwareCode: { krefeld: "486A6A" }
  },
  // CEE-Kabel
  {
    id: "cee-kabel-16a-3m",
    name: "CEE Kabel 16A rot 3 m",
    description: "CEE 16A Verlängerung 3m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "cee-kabel",
    rentwareCode: { krefeld: "SYZ3UO" }
  },
  {
    id: "cee-kabel-16a-5m",
    name: "CEE Kabel 16A rot 5 m",
    description: "CEE 16A Verlängerung 5m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "cee-kabel",
    rentwareCode: { krefeld: "WT1HNO" }
  },
  {
    id: "cee-kabel-16a-10m",
    name: "CEE Kabel 16A rot 10 m",
    description: "CEE 16A Verlängerung 10m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "cee-kabel",
    rentwareCode: { krefeld: "8AMCNG" }
  },
  {
    id: "cee-kabel-16a-20m",
    name: "CEE Kabel 16A rot 20 m",
    description: "CEE 16A Verlängerung 20m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "cee-kabel",
    rentwareCode: { krefeld: "G9R37U" }
  },
  {
    id: "cee-kabel-32a-3m",
    name: "CEE Kabel 32A rot 3 m",
    description: "CEE 32A Verlängerung 3m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "cee-kabel",
    rentwareCode: { krefeld: "O35O9Y" }
  },
  {
    id: "cee-kabel-32a-5m",
    name: "CEE Kabel 32A rot 5 m",
    description: "CEE 32A Verlängerung 5m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "cee-kabel",
    rentwareCode: { krefeld: "V2T7GR" }
  },
  {
    id: "cee-kabel-32a-10m",
    name: "CEE Kabel 32A rot 10 m",
    description: "CEE 32A Verlängerung 10m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "cee-kabel",
    rentwareCode: { krefeld: "EHGMP8" }
  },
  {
    id: "cee-kabel-32a-20m",
    name: "CEE Kabel 32A rot 20 m",
    description: "CEE 32A Verlängerung 20m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "cee-kabel",
    rentwareCode: { krefeld: "NBGVF6" }
  },
  {
    id: "cee-kabel-32a-50m",
    name: "CEE Kabel 32A rot 50 m",
    description: "CEE 32A Verlängerung 50m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "cee-kabel",
    rentwareCode: { krefeld: "RSBH8K" }
  },
  {
    id: "cee-kabel-63a-3m",
    name: "CEE Kabel 63A rot 3 m",
    description: "CEE 63A Verlängerung 3m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "cee-kabel",
    rentwareCode: { krefeld: "WCJ8MZ" }
  },
  {
    id: "cee-kabel-63a-5m",
    name: "CEE Kabel 63A rot 5 m",
    description: "CEE 63A Verlängerung 5m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "cee-kabel",
    rentwareCode: { krefeld: "GIX1D1" }
  },
  {
    id: "cee-kabel-63a-10m",
    name: "CEE Kabel 63A rot 10 m",
    description: "CEE 63A Verlängerung 10m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "cee-kabel",
    rentwareCode: { krefeld: "D41R65" }
  },
  {
    id: "cee-kabel-63a-20m",
    name: "CEE Kabel 63A rot 20 m",
    description: "CEE 63A Verlängerung 20m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "cee-kabel",
    rentwareCode: { krefeld: "756WGG" }
  },
  // Schuko-Kabel
  {
    id: "schukokabel-3m",
    name: "Schukokabel 3 m",
    description: "Schuko-Verlängerung 3m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "schuko-kabel",
    rentwareCode: { krefeld: "QRRDMQ" }
  },
  {
    id: "schukokabel-5m",
    name: "Schukokabel 5 m",
    description: "Schuko-Verlängerung 5m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "schuko-kabel",
    rentwareCode: { krefeld: "7J5K6A" }
  },
  {
    id: "schukokabel-10m",
    name: "Schukokabel 10 m",
    description: "Schuko-Verlängerung 10m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "schuko-kabel",
    rentwareCode: { krefeld: "I17TOM" }
  },
  {
    id: "schukokabel-20m",
    name: "Schukokabel 20 m",
    description: "Schuko-Verlängerung 20m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "schuko-kabel",
    rentwareCode: { krefeld: "S6AL9G" }
  },
  {
    id: "schuko-kabeltrommel-50m",
    name: "Schuko-Kabeltrommel 50m",
    description: "Kabeltrommel 50m Schuko",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "kabeltrommel",
    rentwareCode: { krefeld: "HV6W8A" }
  },
  // Adapter
  {
    id: "cee-adapter-16a-32a",
    name: "Mennekes CEE Adapter 16A < > 32A",
    description: "CEE-Adapter 16A auf 32A",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "adapter",
    rentwareCode: { krefeld: "7B35BP" }
  },
  {
    id: "cee-adapter-32a-63a",
    name: "Mennekes CEE Adapter 32A < > 63A",
    description: "CEE-Adapter 32A auf 63A",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "adapter",
    rentwareCode: { krefeld: "WBHW1T" }
  },
  {
    id: "cee-adapter-63a-32a-sicherung",
    name: "Mennekes CEE Adapter 63A < > 32A inkl. Sicherung",
    description: "CEE-Adapter 63A auf 32A mit Sicherung",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "adapter",
    rentwareCode: { krefeld: "G8HMB1" }
  },
  {
    id: "cee-adapter-schuko-16a",
    name: "Mennekes CEE Adapter Schuko < > 16A (b)",
    description: "CEE-Adapter Schuko auf CEE16A",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "adapter",
    rentwareCode: { krefeld: "IC7B9S" }
  },
  // Erdung
  {
    id: "erdungsspiess-1-5m",
    name: "Erdungsspies 1,5m mit 3m Leitung",
    description: "Erdungsstab mit Kabel",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "erdung",
    rentwareCode: { krefeld: "SB6Z2F" }
  },
  // Netzwerkkabel
  {
    id: "ethercon-kabel-3m-cat7",
    name: "Major EtherCon Kabel 3 m, Cat 7",
    description: "EtherCon Netzwerkkabel 3m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "netzwerkkabel",
    rentwareCode: { krefeld: "UDHP5O" }
  },
  {
    id: "ethercon-kabel-20m-cat5e",
    name: "Major EtherCon Kabel Cat-5e 20m",
    description: "EtherCon Netzwerkkabel 20m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "netzwerkkabel",
    rentwareCode: { krefeld: "A7BAWQ" }
  },
  {
    id: "ethercon-kabel-25m-cat5e",
    name: "Major EtherCon Kabel Cat-5e 25m",
    description: "EtherCon Netzwerkkabel 25m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "netzwerkkabel",
    rentwareCode: { krefeld: "OQ3ZBU" }
  },
  {
    id: "ethercon-kabel-50m-cat5e",
    name: "Major EtherCon Kabel Cat-5e 50m",
    description: "EtherCon Netzwerkkabel 50m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "netzwerkkabel",
    rentwareCode: { krefeld: "AN298G" }
  },
  {
    id: "netzwerkkabel-30m-cat7",
    name: "Major Netzwerkkabel Cat-7 30m",
    description: "Cat7 Netzwerkkabel 30m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "netzwerkkabel",
    rentwareCode: { krefeld: "T7E3LU" }
  },
  {
    id: "netzwerkkabel-2m-cat5e",
    name: "Major Netzwerkkabel Cat-5e 2m",
    description: "Cat5e Netzwerkkabel 2m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "netzwerkkabel",
    rentwareCode: { krefeld: "72BNF6" }
  },
  {
    id: "netzwerkkabel-5m-cat5e",
    name: "Major Netzwerkkabel Cat-5e 5m",
    description: "Cat5e Netzwerkkabel 5m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "netzwerkkabel",
    rentwareCode: { krefeld: "F76J8U" }
  },
  {
    id: "netzwerkkabel-20m-cat5e",
    name: "Major Netzwerkkabel Cat-5e 20 m",
    description: "Cat5e Netzwerkkabel 20m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "netzwerkkabel",
    rentwareCode: { krefeld: "SUYKRA" }
  },
  {
    id: "hdmi-glasfaser-35m",
    name: "HDMI Glasfaser Kabel 35m",
    description: "HDMI über Glasfaser 35m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "hdmi-kabel",
    rentwareCode: { krefeld: "HLQOB5" }
  },
  // PowerCon-Kabel
  {
    id: "powercon-linkkabel-1-5m",
    name: "PowerCon Linkkable 1,5 m",
    description: "PowerCon Verbindungskabel 1,5m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "powercon-kabel",
    rentwareCode: { krefeld: "792P5K" }
  },
  {
    id: "powercon-linkkabel-5m",
    name: "PowerCon Linkable 5 m",
    description: "PowerCon Verbindungskabel 5m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "powercon-kabel",
    rentwareCode: { krefeld: "JV8JSU" }
  },
  {
    id: "powercon-hybrid-linkkabel-3m",
    name: "PowerCon Hybrid Linkable 3 m",
    description: "PowerCon Hybrid Kabel 3m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "powercon-kabel",
    rentwareCode: { krefeld: "6TZVSR" }
  },
  {
    id: "powercon-true1-linkkabel-3m",
    name: "PowerCon TRUE1 Top Linkkable 3 m",
    description: "PowerCon TRUE1 Kabel 3m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "powercon-kabel",
    rentwareCode: { krefeld: "4EWYOO" }
  },
  {
    id: "powercon-true1-linkkabel-5m",
    name: "PowerCon TRUE1 Top Linkkabel 5 m",
    description: "PowerCon TRUE1 Kabel 5m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "powercon-kabel",
    rentwareCode: { krefeld: "9BNX8U" }
  },
  {
    id: "titanex-powercon-true1-10m",
    name: "Titanex PowerCon TRUE1 Top Linkkable 10 m",
    description: "Titanex PowerCon TRUE1 Kabel 10m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "powercon-kabel",
    rentwareCode: { krefeld: "8X5N7T" }
  },
  {
    id: "titanex-powercon-true1-5m",
    name: "Titanex PowerCon TRUE1 Top Linkkable 5 m",
    description: "Titanex PowerCon TRUE1 Kabel 5m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "powercon-kabel",
    rentwareCode: { krefeld: "PK9M65" }
  },
  {
    id: "titanex-speakon-y-adapter",
    name: "Titanex Speakon Y-Adapter",
    description: "Speakon Y-Verteiler",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "adapter",
    rentwareCode: { krefeld: "97DSP4" }
  },
  // Kabelbrücken
  {
    id: "defender-micro-2",
    name: "Defender Micro 2 Kabelbrücke",
    description: "Kleine Kabelbrücke 2-Kanal",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "kabelbruecke",
    rentwareCode: { krefeld: "4QXW6T" }
  },
  {
    id: "defender-midi-5",
    name: "Defender Midi 5 Kabelbrücke",
    description: "Mittlere Kabelbrücke 5-Kanal",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "kabelbruecke",
    rentwareCode: { krefeld: "6BWU5U" }
  },
  {
    id: "office-kabelbruecke-1m",
    name: "Office Kabelbrücke black 1m",
    description: "Büro-Kabelbrücke 1m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "kabelbruecke",
    rentwareCode: { krefeld: "YESZ5H" }
  },
  {
    id: "office-kabelbruecke-2m",
    name: "Office Kabelbrücke black 2m",
    description: "Büro-Kabelbrücke 2m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "kabelbruecke",
    rentwareCode: { krefeld: "4IJ1SS" }
  },
];

// ============= BÜHNE (NEU) =============
export const buehneProducts: Product[] = [
  {
    id: "nivtec-systempodest-2x0-5m",
    name: "Nivtec 2m x 0,5m Systempodest",
    description: "Bühnenelement 2m x 0,5m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "podest",
    rentwareCode: { krefeld: "L6A4BP" }
  },
  {
    id: "nivtec-systempodest-2x0-75m",
    name: "Nivtec 2m x 0,75m Systempodest",
    description: "Bühnenelement 2m x 0,75m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "podest",
    rentwareCode: { krefeld: "MFU3TU" }
  },
  {
    id: "nivtec-systempodest-2x1m",
    name: "Nivtec 2m x 1m Systempodest",
    description: "Bühnenelement 2m x 1m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "podest",
    rentwareCode: { krefeld: "3W8MV3" }
  },
  {
    id: "nivtec-teleskopfuss-40cm",
    name: "Nivtec Teleskopfuß 40cm",
    description: "Bühnenfuß höhenverstellbar bis 40cm",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "buehnen-zubehoer",
    rentwareCode: { krefeld: "H7AMWK" }
  },
  {
    id: "nivtec-teleskopfuss-80cm",
    name: "Nivtec Teleskopfuß 80cm",
    description: "Bühnenfuß höhenverstellbar bis 80cm",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "buehnen-zubehoer",
    rentwareCode: { krefeld: "3M8QIY" }
  },
  {
    id: "nivtec-verstellspindelfuss-60cm",
    name: "Nivtec Verstellspindelfuß 60cm",
    description: "Spindelfuß für Niveauausgleich bis 60cm",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "buehnen-zubehoer",
    rentwareCode: { krefeld: "5E7SZC" }
  },
  {
    id: "manfrotto-autopole-032b",
    name: "Manfrotto 032B Autopole schwarz",
    description: "Spannstange für Hintergründe und Licht",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "autopole",
    rentwareCode: { krefeld: "OE1X1T" }
  },
];

// ============= TRAVERSEN & RIGGING (NEU) =============
export const traversenRiggingProducts: Product[] = [
  {
    id: "milos-m290-multicube-black",
    name: "Milos M290 Multicube black",
    description: "Traversenverbinder schwarz",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "traversenverbinder",
    rentwareCode: { krefeld: "2VTASC" }
  },
  {
    id: "milos-m290-qtu-500-black",
    name: "Milos M290 P4 QTU 500 black",
    description: "4-Punkt Traverse 0,5m schwarz",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "traverse",
    rentwareCode: { krefeld: "B1UCON" }
  },
  {
    id: "milos-m290-qtu-1000-black",
    name: "Milos M290 P4 QTU 1000 black",
    description: "4-Punkt Traverse 1m schwarz",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "traverse",
    rentwareCode: { krefeld: "DHFDR9" }
  },
  {
    id: "milos-m290-qtu-1500-black",
    name: "Milos M290 P4 QTU 1500 black",
    description: "4-Punkt Traverse 1,5m schwarz",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "traverse",
    rentwareCode: { krefeld: "B93VX1" }
  },
  {
    id: "milos-m290-qtu-2000-black",
    name: "Milos M290 P4 QTU 2000 black",
    description: "4-Punkt Traverse 2m schwarz",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "traverse",
    rentwareCode: { krefeld: "UDELEF" }
  },
  {
    id: "milos-m290-ubpqc-base-black",
    name: "Milos M290 P4 UBPQC Base black",
    description: "Traversenbodenplatte schwarz",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "traversen-zubehoer",
    rentwareCode: { krefeld: "TL4W2L" }
  },
  {
    id: "traversen-cover-weiss-2m",
    name: "Traversen Cover weiß 2m",
    description: "Stoffcover für Traverse 2m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "traversen-zubehoer",
    rentwareCode: { krefeld: "2YQ15O" }
  },
  {
    id: "traversen-cover-weiss-3m",
    name: "Traversen Cover weiß 3m",
    description: "Stoffcover für Traverse 3m",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "traversen-zubehoer",
    rentwareCode: { krefeld: "WDP947" }
  },
];

// ============= ERDBEWEGUNG ZUSATZ (Schaufeln, Löffel, Hydraulikhammer) =============
export const erdbewegungZusatzProducts: Product[] = [
  // Tieflöffel
  {
    id: "ms01-tiefloeffel-20cm",
    name: "MS01 Tieflöffel 20cm/14l",
    description: "Tieflöffel 20cm für MS01 Schnellwechsler",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "tiefloeffel",
    rentwareCode: { krefeld: "ZDH9MF" }
  },
  {
    id: "ms01-tiefloeffel-30cm",
    name: "MS01 Tieflöffel 30cm/24l",
    description: "Tieflöffel 30cm für MS01 Schnellwechsler",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "tiefloeffel",
    rentwareCode: { krefeld: "NXR6T1" }
  },
  {
    id: "ms01-tiefloeffel-50cm-symlock",
    name: "MS01 Tieflöffel 50cm/45l Symlock",
    description: "Tieflöffel 50cm für MS01 Symlock",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "tiefloeffel",
    rentwareCode: { krefeld: "7A6LGC" }
  },
  {
    id: "ms03-tiefloeffel-30cm-symlock",
    name: "MS03 Tieflöffel 30cm/41l Symlock",
    description: "Tieflöffel 30cm für MS03 Symlock",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "tiefloeffel",
    rentwareCode: { krefeld: "JZQKVD" }
  },
  {
    id: "cw05-tiefloeffel-40cm",
    name: "CW05 Tieflöffel 40cm/30l",
    description: "Tieflöffel 40cm für CW05 Schnellwechsler",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "tiefloeffel",
    rentwareCode: { krefeld: "48HA2A" }
  },
  {
    id: "cw05-tiefloeffel-50cm",
    name: "CW05 Tieflöffel 50cm/45l",
    description: "Tieflöffel 50cm für CW05 Schnellwechsler",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "tiefloeffel",
    rentwareCode: { krefeld: "SJMBMY" }
  },
  // Kabellöffel
  {
    id: "ms01-kabelloeffel-15cm-symlock",
    name: "MS01 Kabellöffel 15cm Symlock",
    description: "Kabellöffel 15cm für MS01 Symlock",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "kabelloeffel",
    rentwareCode: { krefeld: "ZHXAG6" }
  },
  {
    id: "cw05-kabelloeffel-25cm",
    name: "CW05 Kabellöffel 25cm/18l",
    description: "Kabellöffel 25cm für CW05 Schnellwechsler",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "kabelloeffel",
    rentwareCode: { krefeld: "9YCXJH" }
  },
  // Grabenräumlöffel
  {
    id: "ms01-grabenraeumloeffel-80cm",
    name: "MS01 Grabenräumlöffel hydr. 80cm/52l",
    description: "Hydraulischer Grabenräumlöffel 80cm für MS01",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "grabenraeumloeffel",
    rentwareCode: { krefeld: "2A5TQZ" }
  },
  {
    id: "ms01-grabenraeumloeffel-100cm-symlock",
    name: "MS01 Grabenräumlöffel hydr. 100cm/80l Symlock",
    description: "Hydraulischer Grabenräumlöffel 100cm für MS01 Symlock",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "grabenraeumloeffel",
    rentwareCode: { krefeld: "EZKG9U" }
  },
  {
    id: "ms03-grabenraeumloeffel-120cm-symlock",
    name: "MS03 Grabenräumlöffel hydr. 120cm/120l Symlock",
    description: "Hydraulischer Grabenräumlöffel 120cm für MS03 Symlock",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "grabenraeumloeffel",
    rentwareCode: { krefeld: "1G5LXK" }
  },
  // Roderechen
  {
    id: "ms01-roderechen-symlock",
    name: "MS01 Roderechen Symlock",
    description: "Roderechen für MS01 Symlock",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "roderechen",
    rentwareCode: { krefeld: "R5B2W9" }
  },
  // Hydraulikhammer
  {
    id: "ms01-hydraulikhammer-shb40",
    name: "MS01 Hydraulikhammer SHB40",
    description: "Hydraulikhammer für MS01 Schnellwechsler",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    category: "hydraulikhammer",
    rentwareCode: { krefeld: "DC6H9Z" }
  },
  {
    id: "ms01-ms03-hydraulikhammer-shb45",
    name: "MS01/MS03 Hydraulikhammer SHB45",
    description: "Hydraulikhammer für MS01/MS03 Schnellwechsler",
    image: imgHydraulikhammer1,
    images: [imgHydraulikhammer1, imgHydraulikhammer2, imgHydraulikhammer3],
    category: "hydraulikhammer",
    rentwareCode: { krefeld: "CRLJPA" }
  },
  // Bodenschutz
  {
    id: "bodenschutz-fahrmatten",
    name: "Bodenschutz- / Fahrmatten 0,86m² mit Nut & Feder",
    description: "Bodenschutzplatten für Baumaschinen",
    image: imgBodenschutz1,
    images: [imgBodenschutz1, imgBodenschutz2, imgBodenschutz3, imgBodenschutz4],
    category: "zubehoer",
    rentwareCode: { krefeld: "EH43YT" }
  },
  // Mobile Tankstelle
  {
    id: "dieseltankstelle-400l",
    name: "Sirocco Mobile Dieseltankstelle 400L/50L",
    description: "Mobile Tankstelle mit AdBlue-Tank",
    image: imgDieseltankstelle1,
    images: [imgDieseltankstelle1, imgDieseltankstelle2],
    category: "zubehoer",
    rentwareCode: { krefeld: "KP5KOB" }
  },
];

// ============= ANHÄNGER ZUSATZ =============
export const anhaengerZusatzProducts: Product[] = [
  {
    id: "aggregatanhaenger-1300kg",
    name: "1300 kg Aggregatanhänger",
    description: "Anhänger für Transport von Aggregaten",
    image: "/placeholder.svg",
    images: ["/placeholder.svg"],
    weightKg: 1300,
    category: "aggregat",
    rentwareCode: { krefeld: "IK69DF" }
  },
];
