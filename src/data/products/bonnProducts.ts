// Bonn Location Products
// Images imported from shared assets

import benzinErdbohrer1 from "@/assets/products/benzin-erdbohrer-1.jpeg";
import benzinErdbohrer2 from "@/assets/products/benzin-erdbohrer-2.jpeg";
import akkuKettensaege1 from "@/assets/products/akku-kettensaege-1.jpeg";
import akkuKettensaege2 from "@/assets/products/akku-kettensaege-2.jpeg";
import akkuKettensaege3 from "@/assets/products/akku-kettensaege-3.jpeg";
import akkuKettensaege4 from "@/assets/products/akku-kettensaege-4.jpeg";
import freischneider1 from "@/assets/products/freischneider-1.jpeg";
// Benzin Bodenhacke images
import benzinBodenhacke1 from "@/assets/products/benzin-bodenhacke-1.jpeg";
import benzinBodenhacke2 from "@/assets/products/benzin-bodenhacke-2.jpeg";

// Shared images with Krefeld - Erdbewegung
import imgBodenschutz1 from "@/assets/products/erdbewegung/bodenschutz-fahrmatten-1.jpg";
import imgBodenschutz2 from "@/assets/products/erdbewegung/bodenschutz-fahrmatten-2.jpg";
import imgBodenschutz3 from "@/assets/products/erdbewegung/bodenschutz-fahrmatten-3.jpg";
import imgBodenschutz4 from "@/assets/products/erdbewegung/bodenschutz-fahrmatten-4.jpg";
import imgBobcatE10z1 from "@/assets/products/erdbewegung/bobcat-e10z-1.jpg";
import imgBobcatE10z2 from "@/assets/products/erdbewegung/bobcat-e10z-2.jpg";
import imgBobcatE10z3 from "@/assets/products/erdbewegung/bobcat-e10z-3.jpg";
import imgBobcatE10z4 from "@/assets/products/erdbewegung/bobcat-e10z-4.jpg";
import imgXcmgXe20e1 from "@/assets/products/erdbewegung/xcmg-xe20e-1.jpg";
import imgXcmgXe20e2 from "@/assets/products/erdbewegung/xcmg-xe20e-2.jpg";
import imgXcmgXe20e3 from "@/assets/products/erdbewegung/xcmg-xe20e-3.jpg";
import imgXcmgXe27e1 from "@/assets/products/erdbewegung/xcmg-xe27e-1.jpg";
import imgXcmgXe27e2 from "@/assets/products/erdbewegung/xcmg-xe27e-2.jpg";
import imgXcmgXe27e3 from "@/assets/products/erdbewegung/xcmg-xe27e-3.jpg";
import imgKramer1 from "@/assets/products/erdbewegung/kramer-5045-1.png";
import imgKramer2 from "@/assets/products/erdbewegung/kramer-5045-2.png";
import imgCormidi1 from "@/assets/products/erdbewegung/cormidi-c60-1.jpg";
import imgCormidi2 from "@/assets/products/erdbewegung/cormidi-c60-2.jpg";
import imgCormidi3 from "@/assets/products/erdbewegung/cormidi-c60-3.jpg";
import imgKnickdumper1 from "@/assets/products/erdbewegung/knickdumper-kde550-1.jpg";
import imgKnickdumper2 from "@/assets/products/erdbewegung/knickdumper-kde550-2.jpg";
// Shared images with Krefeld - Werkzeuge
import imgAbbruchhammer from "@/assets/products/werkzeuge/abbruchhammer-gsh16-28.png";
import imgWinkelschleifer from "@/assets/products/werkzeuge/winkelschleifer-gws18v-10.jpg";
import imgFugenschneider1 from "@/assets/products/werkzeuge/fugenschneider-bs50e-1.jpg";
import imgFugenschneider2 from "@/assets/products/werkzeuge/fugenschneider-bs50e-2.jpg";
import imgBetonruettler from "@/assets/products/werkzeuge/betonruettler-ir1000.jpg";

// ==================== AGGREGAT ====================
export const bonnAggregateProducts = [
  {
    id: "bonn-aggregat-20kva",
    name: "20 kVA Aggregat",
    description: "Leistungsstarkes Stromaggregat für Baustellen und Events.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "GMKLML" },
  },
  {
    id: "bonn-aggregat-7-5kva",
    name: "7,5 kVA Aggregat",
    description: "Kompaktes Stromaggregat für mittleren Strombedarf.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "3PHDI2" },
  },
];

// ==================== ARBEITSBÜHNEN ====================
export const bonnArbeitsbuehnenProducts = [
  {
    id: "bonn-mastbuehne-11m",
    name: "11m Mastbühne ZMP09",
    description: "Kompakte Mastbühne für Arbeiten bis 11m Höhe.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "AN9D7X" },
  },
  {
    id: "bonn-anhaenger-arbeitsbuehne-18m",
    name: "18m Anhänger-Teleskop-Gelenk Arbeitsbühne",
    description: "Mobile Anhänger-Arbeitsbühne für flexible Einsätze bis 18m.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "32EVXI" },
  },
  {
    id: "bonn-scherenbuehne-8m",
    name: "8m Scherenbühne ZS0607AC",
    description: "Elektrische Scherenbühne für Innen- und Außeneinsatz.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "M4H2CP" },
  },
];

// ==================== ERDBEWEGUNG ====================
export const bonnErdbewegungProducts = [
  {
    id: "bonn-bobcat-e10",
    name: "1t Bobcat E10",
    description: "Kompakter Minibagger für enge Baustellen.",
    image: imgBobcatE10z1,
    images: [imgBobcatE10z1, imgBobcatE10z2, imgBobcatE10z3, imgBobcatE10z4],
    rentwareCode: { bonn: "FQZBM1" },
    weightKg: 1000,
    driveType: "diesel",
  },
  {
    id: "bonn-xcmg-xe20e",
    name: "2t XCMG XE20E",
    description: "Einsatzgewicht: 2.000 kg | Grabtiefe: 2.385 mm | Breite: 980 mm",
    image: imgXcmgXe20e1,
    images: [imgXcmgXe20e1, imgXcmgXe20e2, imgXcmgXe20e3],
    rentwareCode: { bonn: "PV2RQZ" },
    weightKg: 2000,
    driveType: "diesel",
  },
  {
    id: "bonn-xcmg-xe27e",
    name: "2,7t XCMG XE27E",
    description: "Einsatzgewicht: 2.700 kg | Grabtiefe: 2.800 mm | Breite: 1.500 mm",
    image: imgXcmgXe27e1,
    images: [imgXcmgXe27e1, imgXcmgXe27e2, imgXcmgXe27e3],
    rentwareCode: { bonn: "QU4BYW" },
    weightKg: 2700,
    driveType: "diesel",
  },
  {
    id: "bonn-radlader-kramer-5050",
    name: "Radlader 3t Kramer 5050",
    description: "Kompakter Radlader für vielseitige Einsätze.",
    image: imgKramer1,
    images: [imgKramer1, imgKramer2],
    rentwareCode: { bonn: "EEJXMU" },
    weightKg: 3000,
    driveType: "diesel",
  },
  {
    id: "bonn-cormidi-dumper",
    name: "Ketten-Dumper",
    description: "Kompakter Raupendumper für schwieriges Gelände.",
    image: imgCormidi1,
    images: [imgCormidi1, imgCormidi2, imgCormidi3],
    rentwareCode: { bonn: "7Y1UTP" },
    driveType: "diesel",
  },
  {
    id: "bonn-knickdumper-kde550",
    name: "Raddumper / Knickdumper KDe550",
    description: "Elektrischer Knickdumper mit 4x4 Antrieb - 8-10h Laufzeit.",
    image: imgKnickdumper1,
    images: [imgKnickdumper1, imgKnickdumper2],
    rentwareCode: { bonn: "CUDHTT" },
    driveType: "elektro",
  },
];

// ==================== ERDBEWEGUNG ZUBEHÖR (Schaufeln, Löffel) ====================
export const bonnErdbewegungZusatzProducts = [
  {
    id: "bonn-bodenschutz-fahrmatten",
    name: "Bodenschutz-/Fahrmatten 0,86m²",
    description: "Mit Nut & Feder für sicheren Untergrund.",
    image: imgBodenschutz1,
    images: [imgBodenschutz1, imgBodenschutz2, imgBodenschutz3, imgBodenschutz4],
    rentwareCode: { bonn: "E3IB5R" },
  },
  {
    id: "bonn-ms01-grabenraeumloffel-100cm",
    name: "MS01 Grabenräumlöffel hydr. 100cm/80l Symlock",
    description: "Hydraulischer Grabenräumlöffel für präzise Grabenarbeiten.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "E3DLEB" },
  },
  {
    id: "bonn-ms03-grabenraeumloffel-120cm",
    name: "MS03 Grabenräumlöffel hydr. 120cm/120l Symlock",
    description: "Großer hydraulischer Grabenräumlöffel.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "6RX3MS" },
  },
  {
    id: "bonn-ms01-ms03-sortiergreifer",
    name: "MS01/MS03 Sortiergreifer SSG 150",
    description: "Sortiergreifer für präzises Greifen und Sortieren.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "F7N9YA" },
  },
  {
    id: "bonn-ms01-kabelloffel-15cm",
    name: "MS01 Kabellöffel 15cm Symlock",
    description: "Schmaler Löffel für Kabelgräben.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "3PP7G6" },
  },
  {
    id: "bonn-ms01-roderechen",
    name: "MS01 Roderechen Symlock",
    description: "Roderechen zum Entfernen von Wurzeln und Gestrüpp.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "N2EKOE" },
  },
  {
    id: "bonn-ms03-kabelloffel-20cm",
    name: "MS03 Kabellöffel 20cm Symlock",
    description: "Kabellöffel für breitere Gräben.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "GS5BXN" },
  },
  {
    id: "bonn-ms01-tiefloffel-20cm",
    name: "MS01 Tieflöffel 20cm/14l",
    description: "Kompakter Tieflöffel für präzise Grabarbeiten.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "AIX9WF" },
  },
  {
    id: "bonn-ms03-tiefloffel-30cm",
    name: "MS03 Tieflöffel 30cm/41l Symlock",
    description: "Mittlerer Tieflöffel für Standardarbeiten.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "4I75NO" },
  },
];

// ==================== VERDICHTUNG ====================
export const bonnVerdichtungProducts = [
  {
    id: "bonn-stampfer-gs72",
    name: "Stampfer GS72-XH 70kg",
    description: "Vibrationsstampfer für die Verdichtung von Gräben.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "XZA2I2" },
  },
  {
    id: "bonn-ruettelplatte-vp16",
    name: "Rüttelplatte VP 16/44 100kg",
    description: "Kompakte Rüttelplatte für kleinere Flächen.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "4KI9AM" },
  },
  {
    id: "bonn-ruettelplatte-vp25",
    name: "Rüttelplatte VP 25/50 130kg",
    description: "Mittlere Rüttelplatte für Pflasterarbeiten.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "8I2GX3" },
  },
  {
    id: "bonn-ruettelplatte-hvp30",
    name: "Rüttelplatte HVP 30/50 180kg / reversierbar",
    description: "Reversierbare Rüttelplatte für effiziente Verdichtung.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "DKAF58" },
  },
  {
    id: "bonn-ruettelplatte-hvp38",
    name: "Rüttelplatte HVP 38/60 250kg / reversierbar",
    description: "Große reversierbare Rüttelplatte für große Flächen.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "OYOWC6" },
  },
];

// ==================== ANHÄNGER ====================
export const bonnAnhaengerProducts = [
  {
    id: "bonn-baumaschinenanhanger-1800",
    name: "1800 kg Baumaschinenanhänger",
    description: "Robuster Anhänger für den Transport von Baumaschinen.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "54GAQZ" },
    weightClass: "1300-2000",
  },
  {
    id: "bonn-aggregatanhaenger-1300",
    name: "1300 kg Aggregatanhänger",
    description: "Spezieller Anhänger für Stromaggregate.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "3S1FQQ" },
    weightClass: "1300-2000",
  },
];

// ==================== GARTENPFLEGE ====================
export const bonnGartenpflegeProducts = [
  {
    id: "bonn-unkrautbrenner-gloria",
    name: "GLORIA Thermoflamm bio Professional PLUS",
    description: "Gas Unkrautbrenner & Abflammgerät mit 5m Schlauch.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "XQOA86" },
  },
  {
    id: "bonn-akku-kettensaege",
    name: "Akku Kettensäge GKE 18V-40",
    description: "Bosch Akku-Kettensäge für kabelloses Sägen.",
    image: akkuKettensaege1,
    images: [akkuKettensaege1, akkuKettensaege2, akkuKettensaege3, akkuKettensaege4],
    rentwareCode: { bonn: "UWKKF9" },
  },
  {
    id: "bonn-akku-heckenschere",
    name: "Akku Heckenschere GHE 18V-60",
    description: "Bosch Akku-Heckenschere für präzisen Heckenschnitt.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "7I8923" },
  },
  {
    id: "bonn-freischneider-ps162",
    name: "Benzin-Freischneider PS162",
    description: "Leistungsstarker Freischneider für Gras und Gestrüpp.",
    image: freischneider1,
    images: [freischneider1],
    rentwareCode: { bonn: "UISB2E" },
  },
  {
    id: "bonn-erdbohrer-benzin",
    name: "Benzin-Erdbohrer",
    description: "Handlicher Erdbohrer für Pflanzlöcher und Pfähle.",
    image: benzinErdbohrer1,
    images: [benzinErdbohrer1, benzinErdbohrer2],
    rentwareCode: { bonn: "9FJJ7O" },
  },
  {
    id: "bonn-bodenhacke-af1212",
    name: "Benzin Bodenhacke / Gartenfräse 6 PS AF1212",
    description: "Kraftvolle Gartenfräse für Bodenbearbeitung.",
    image: benzinBodenhacke1,
    images: [benzinBodenhacke1, benzinBodenhacke2],
    rentwareCode: { bonn: "1JEK78" },
  },
  {
    id: "bonn-baumstumpffraese-f360",
    name: "Baumstumpffräse F-360",
    description: "Fräst Baumstümpfe bis unter die Erdoberfläche.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "W4I4YI" },
  },
  {
    id: "bonn-haecksler-axt25tc",
    name: "Häcksler AXT25TC",
    description: "Elektrischer Leisehäcksler für Gartenabfälle.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "3VVG1Y" },
  },
  {
    id: "bonn-haecksler-ls95gx",
    name: "Häcksler LS-95 GX",
    description: "Benzin-Häcksler für größere Äste und Zweige.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "A373OH" },
  },
  {
    id: "bonn-vertikutierer-sa35v",
    name: "Vertikutierer SA35-V EL",
    description: "Elektrischer Vertikutierer für die Rasenpflege.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "BQ4RKS" },
  },
  {
    id: "bonn-vertikutierer-sa38bv",
    name: "Vertikutierer SA38 BV",
    description: "Benzin-Vertikutierer für größere Rasenflächen.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "L3EJDP" },
  },
  {
    id: "bonn-rasenwalze",
    name: "Rasenwalze",
    description: "Für ebene Rasenflächen nach der Aussaat.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "S3ATTY" },
  },
];

// ==================== WERKZEUG ====================
export const bonnWerkzeugProducts = [
  {
    id: "bonn-fugenschneider-bs50e",
    name: "Fugenschneider BS50E - 13PS",
    description: "Leistungsstarker Fugenschneider für Asphalt und Beton.",
    image: imgFugenschneider1,
    images: [imgFugenschneider1, imgFugenschneider2],
    rentwareCode: { bonn: "RC3QNC" },
  },
  {
    id: "bonn-abbruchhammer-gsh16",
    name: "Bosch Abbruchhammer GSH 16-28",
    description: "Schwerer Abbruchhammer für harten Einsatz.",
    image: imgAbbruchhammer,
    images: [imgAbbruchhammer],
    rentwareCode: { bonn: "226JZO" },
  },
  {
    id: "bonn-steinsaege-80cm",
    name: "Steinsäge 80cm Nasschneidetisch",
    description: "Nassschneidetisch für präzise Steinschnitte.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "RVQWQN" },
  },
  {
    id: "bonn-zwangsmischer-140l",
    name: "Zwangsmischer 140L",
    description: "Betonmischer für gleichmäßige Mischungen.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "VSE9XB" },
  },
  {
    id: "bonn-bohrschrauber-gsr18v55",
    name: "Bosch Akku Bohrschrauber GSR 18V-55",
    description: "Leistungsstarker Akku-Bohrschrauber.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "LK67CV" },
  },
  {
    id: "bonn-betonruettler-ir1000",
    name: "Beton Rüttler 2m IR 1000",
    description: "Innenrüttler für die Betonverdichtung.",
    image: imgBetonruettler,
    images: [imgBetonruettler],
    rentwareCode: { bonn: "LJ66QJ" },
  },
  {
    id: "bonn-handkreissaege-gks18v",
    name: "Bosch Akku Hand-Kreissäge GKS 18V-57G",
    description: "Präzise Akku-Handkreissäge für Holzschnitte.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "PKQ1ID" },
  },
  {
    id: "bonn-fliesenschneider-80cm",
    name: "Fliesenschneider 80cm",
    description: "Manueller Fliesenschneider für präzise Schnitte.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "ATIOQF" },
  },
  {
    id: "bonn-diamantbohrer-gdb180",
    name: "Bosch Diamantbohrer GDB 180 WE",
    description: "Diamantbohrmaschine für Kernbohrungen.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "SYBKDJ" },
  },
  {
    id: "bonn-nasstrockensauger-gas35",
    name: "Nass-/Trockensauger GAS 35 M AFC",
    description: "Professioneller Industriesauger mit Filterreinigung.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "5FSVCT" },
  },
  {
    id: "bonn-rotationslaser-grl400h",
    name: "Bosch Rotationslaser GRL 400H",
    description: "Rotationslaser für horizontale Nivellierungen.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "LYH46M" },
  },
  {
    id: "bonn-mauerschlitzfraese",
    name: "Mauerschlitzfräse",
    description: "Für präzise Schlitze in Mauerwerk.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "KWUY1N" },
  },
  {
    id: "bonn-winkelschleifer-gws18v",
    name: "Bosch Akku Winkelschleifer GWS 18V-10",
    description: "Kraftvoller Akku-Winkelschleifer.",
    image: imgWinkelschleifer,
    images: [imgWinkelschleifer],
    rentwareCode: { bonn: "UL9XG5" },
  },
];

// ==================== TROCKNUNG ====================
export const bonnTrocknungProducts = [
  {
    id: "bonn-bautrockner-kt200",
    name: "Bautrockner KT200",
    description: "Kompakter Bautrockner für kleine bis mittlere Räume.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "QSWO1M" },
  },
  {
    id: "bonn-bautrockner-kt554",
    name: "Allegra Bautrockner KT554",
    description: "Leistungsstarker Bautrockner für große Flächen.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "XK3ZV4" },
  },
];

// ==================== HEIZUNG ====================
export const bonnHeizungProducts = [
  {
    id: "bonn-heizpilz-2kw",
    name: "2 kW Elektro Heizpilz",
    description: "Elektrischer Heizpilz für Terrassen und Events.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "MSKYPD" },
  },
  {
    id: "bonn-heizluefter-3kw",
    name: "Allegra 3 kW Elektro Heizlüfter",
    description: "Kompakter Heizlüfter für schnelle Wärme.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "YWLOT7" },
  },
];

// ==================== STROM & KABEL ====================
export const bonnStromProducts = [
  {
    id: "bonn-cee32a-uv",
    name: "CEE 32A UV auf 2x 16A CEE, 6x 16A Schuko",
    description: "Stromverteiler für professionelle Anwendungen.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "X7ZVYH" },
  },
  {
    id: "bonn-cee-kabel-32a-20m",
    name: "CEE Kabel 32A rot 20m",
    description: "Verlängerungskabel CEE 32A, 20 Meter.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "9L9EQZ" },
  },
];

// ==================== LEITERN & GERÜSTE ====================
export const bonnLeiternProducts = [
  {
    id: "bonn-hailo-l60-6",
    name: "Hailo L60 - 6 Stufen",
    description: "Stabile Stehleiter mit 6 Stufen.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "K5IH5O" },
  },
  {
    id: "bonn-mehrzweckleiter-3x12",
    name: "Mehrzweckleiter 3x12",
    description: "Vielseitige Mehrzweckleiter als Steh- oder Anlegeleiter.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "V5ZJYP" },
  },
  {
    id: "bonn-kaiserthal-l50-5",
    name: "Kaiserthal L50 - 5 Stufen",
    description: "Kompakte Stehleiter mit 5 Stufen.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "GQKKRB" },
  },
];

// ==================== GERÜSTTEILE ====================
export const bonnGeruestteileProducts = [
  {
    id: "bonn-krause-auslegerstuetze",
    name: "BN Krause Auslegerstütze",
    description: "Auslegerstütze für zusätzliche Stabilität.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "YXBLVG" },
  },
  {
    id: "bonn-krause-diagonale-2m",
    name: "BN Krause Diagonale Feldlänge 2,00m",
    description: "Diagonalstrebe für Rollgerüste.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "ZG9FCD" },
  },
  {
    id: "bonn-krause-belagbuehne-durchstieg-2m",
    name: "BN Krause Belagbühne mit Durchstieg 2,00m",
    description: "Belagbühne mit integriertem Durchstieg.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "H214RR" },
  },
  {
    id: "bonn-krause-bordbrettset-75cm",
    name: "Krause Bordbrettset 75cm Breite",
    description: "Sicherheitsbordbretter für Rollgerüste.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "ZXSD8P" },
  },
  {
    id: "bonn-krause-fahrbase-75",
    name: "Krause Fahrbase 75",
    description: "Fahrbare Basis für Rollgerüste.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "ENFQN4" },
  },
  {
    id: "bonn-krause-guardmatic-2m",
    name: "Krause GuardMatic-System | Feldlänge 2,00m",
    description: "Sicherheitsgeländersystem.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "66ISCJ" },
  },
  {
    id: "bonn-krause-vertikalrahmen-1x075",
    name: "Krause Vertikalrahmen 1,00 x 0,75m",
    description: "Vertikalrahmen für den Gerüstaufbau.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "B322OO" },
  },
  {
    id: "bonn-krause-vertikalrahmen-2x075",
    name: "Krause Vertikalrahmen 2,00 x 0,75m",
    description: "Hoher Vertikalrahmen für den Gerüstaufbau.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "HCUHDP" },
  },
];

// ==================== ZELTE ====================
export const bonnZelteProducts = [
  {
    id: "bonn-partyzelt-3x3",
    name: "Partyzelt 3x3m",
    description: "Kompaktes Partyzelt für kleine Feiern.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "ZPBA4S" },
  },
  {
    id: "bonn-sonnenschirm",
    name: "Sonnenschirm",
    description: "Großer Sonnenschirm für Terrasse und Garten.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "S8U5XL" },
  },
  {
    id: "bonn-partyzelt-4x6",
    name: "Partyzelt 4x6m",
    description: "Mittelgroßes Partyzelt für Gartenpartys.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "6GI1UN" },
  },
];

// ==================== MÖBEL ====================
export const bonnMoebelProducts = [
  {
    id: "bonn-bierzeltgarnitur-hussen-weiss",
    name: "Bierzeltgarnitur Hussen-Set weiß",
    description: "Elegante Bierzeltgarnitur mit weißen Hussen.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "6AVVWR" },
  },
  {
    id: "bonn-bierzeltgarnitur-set",
    name: "Bierzeltgarnitur-Set",
    description: "Klassische Bierzeltgarnitur mit Tisch und 2 Bänken.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "PTPDTD" },
  },
  {
    id: "bonn-stehtisch",
    name: "Stehtisch",
    description: "Robuster Stehtisch für Events.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "DYAJ56" },
  },
  {
    id: "bonn-stehtisch-husse-weiss",
    name: "Stehtisch Husse weiß",
    description: "Elegante weiße Husse für Stehtische.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "QGPZGO" },
  },
  {
    id: "bonn-stuhl-weiss",
    name: "Stuhl weiß",
    description: "Stapelbarer Kunststoffstuhl in Weiß.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "671OZJ" },
  },
];

// ==================== GESCHIRR ====================
export const bonnGeschirrProducts = [
  {
    id: "bonn-getraenkekuehlschrank-236l",
    name: "Getränkekühlschrank 236l",
    description: "Großer Kühlschrank für Getränke bei Events.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "MY5VGV" },
  },
  {
    id: "bonn-dessertteller-simply-19",
    name: "Dessertteller SIMPLY 19, 10er Set",
    description: "Elegante Dessertteller im 10er Set.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "1RWUHC" },
  },
  {
    id: "bonn-kaffeetasse-12er",
    name: "Kaffeetasse, 12er Set",
    description: "Klassische Kaffeetassen im 12er Set.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "UY8AV1" },
  },
  {
    id: "bonn-schuessel-simply-15",
    name: "Schüssel SIMPLY 15, 10er Set",
    description: "Vielseitige Schüsseln im 10er Set.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "BD226L" },
  },
  {
    id: "bonn-teller-simply-25",
    name: "Teller SIMPLY 25, 10er Set",
    description: "Große Speiseteller im 10er Set.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "UGNDNW" },
  },
  {
    id: "bonn-teller-tief-simply-20",
    name: "Teller tief SIMPLY 20, 10er Set",
    description: "Tiefe Teller für Suppen und Pasta.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "HAZLZ4" },
  },
  {
    id: "bonn-spuelmaschine-gastro",
    name: "Gastro-Spülmaschine Frontlader",
    description: "Professionelle Gastro-Spülmaschine.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "EEZP7X" },
  },
];

// ==================== BESTECK ====================
export const bonnBesteckProducts = [
  {
    id: "bonn-gabel-simply-19",
    name: "Gabel SIMPLY 19, 10er Set",
    description: "Elegante Gabeln im 10er Set.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "GT8B4N" },
  },
  {
    id: "bonn-loeffel-simply-13",
    name: "Löffel SIMPLY 13, 10er Set",
    description: "Kleine Löffel für Desserts.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "E941H1" },
  },
  {
    id: "bonn-loeffel-simply-19",
    name: "Löffel SIMPLY 19, 10er Set",
    description: "Große Löffel im 10er Set.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "ML5SL8" },
  },
  {
    id: "bonn-messer-simply-20",
    name: "Messer SIMPLY 20, 10er Set",
    description: "Klassische Messer im 10er Set.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "ISUEVC" },
  },
];

// ==================== BESCHALLUNG ====================
export const bonnBeschallungProducts = [
  {
    id: "bonn-soundboks-batteryboks",
    name: "Soundboks Batteryboks",
    description: "Zusatzakku für Soundboks Speaker.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "O567KS" },
  },
  {
    id: "bonn-soundboks-gen3",
    name: "Soundboks Gen.3",
    description: "Leistungsstarker mobiler Bluetooth-Lautsprecher.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "7ELXMB" },
  },
  {
    id: "bonn-soundsystem-2-1-1400w",
    name: "2.1 Soundsystem 1400W RMS",
    description: "Kompaktes PA-System mit Subwoofer.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "SIHY5A" },
  },
  {
    id: "bonn-funkmikrofon",
    name: "Funkmikrofon",
    description: "Kabelloses Mikrofon für Reden und Präsentationen.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "PX1N8H" },
  },
];

// ==================== BELEUCHTUNG ====================
export const bonnBeleuchtungProducts = [
  {
    id: "bonn-dj-power-spark-v1",
    name: "DJ Power Spark V1",
    description: "Kalt-Funkenfontäne für spektakuläre Effekte.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "EDWHU1" },
  },
  {
    id: "bonn-led-outdoor-tourled50",
    name: "LED Outdoorscheinwerfer TourLED 50 XCR",
    description: "Wetterfester LED-Scheinwerfer für Außeneinsatz.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "7NA19B" },
  },
  {
    id: "bonn-led-4er-bar",
    name: "LED 4er Bar",
    description: "Kompakte LED-Lichtleiste mit 4 Spots.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "ZKOF2K" },
  },
  {
    id: "bonn-led-moving-head",
    name: "LED Moving Head Vector Spot Zoom 2.0",
    description: "Professioneller Moving Head für Events.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "EKOMK2" },
  },
];

// ==================== HÜPFBURGEN ====================
export const bonnHuepfburgProducts = [
  {
    id: "bonn-huepfburg-lamar",
    name: "HappyHop Hüpfburg Lamar 2,8x2,1m",
    description: "Kompakte Hüpfburg für Kindergeburtstage.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "WKM6GJ" },
  },
  {
    id: "bonn-huepfburg-wasserpark",
    name: "Hüpfburg Wasserpark 3m x4m",
    description: "Hüpfburg mit Wasserrutsche für heiße Tage.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "2NA195" },
  },
];

// ==================== ABSPERRTECHNIK ====================
export const bonnAbsperrtechnikProducts = [
  {
    id: "bonn-warnleuchte-gelb",
    name: "TL-Warnleuchte, gelb",
    description: "LED-Warnleuchte für Absperrbaken.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "P82DB9" },
  },
  {
    id: "bonn-fussplatte-k1",
    name: "Fußplatte K1 TL",
    description: "Standfuß für Verkehrsschilder.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "JDKD4X" },
  },
  {
    id: "bonn-schrankenzaun-ra2",
    name: "Schrankenzaun RA2 weiß/rot",
    description: "Mobiler Schrankenzaun für Absperrungen.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "IRL7WZ" },
  },
  {
    id: "bonn-wemas-klemmschelle",
    name: "Wemas Klemmschelle K1",
    description: "Klemmschelle zur Schilderbefestigung.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "KSVK2T" },
  },
  {
    id: "bonn-warnbarke-ra2",
    name: "Warnbarke weiß/rot, RA 2",
    description: "Reflektierende Warnbarke Klasse RA2.",
    image: "/placeholder.svg",
    rentwareCode: { bonn: "FD2IMJ" },
  },
];

// ==================== EXPORT ALL BONN PRODUCTS ====================
export const allBonnProducts = {
  aggregate: bonnAggregateProducts,
  arbeitsbuehnen: bonnArbeitsbuehnenProducts,
  erdbewegung: bonnErdbewegungProducts,
  erdbewegungZusatz: bonnErdbewegungZusatzProducts,
  verdichtung: bonnVerdichtungProducts,
  anhaenger: bonnAnhaengerProducts,
  gartenpflege: bonnGartenpflegeProducts,
  werkzeug: bonnWerkzeugProducts,
  trocknung: bonnTrocknungProducts,
  heizung: bonnHeizungProducts,
  strom: bonnStromProducts,
  leitern: bonnLeiternProducts,
  geruestteile: bonnGeruestteileProducts,
  zelte: bonnZelteProducts,
  moebel: bonnMoebelProducts,
  geschirr: bonnGeschirrProducts,
  besteck: bonnBesteckProducts,
  beschallung: bonnBeschallungProducts,
  beleuchtung: bonnBeleuchtungProducts,
  huepfburg: bonnHuepfburgProducts,
  absperrtechnik: bonnAbsperrtechnikProducts,
};
