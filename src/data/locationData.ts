// Shared location data for the entire application

// Location images
import imgKrefeld from "@/assets/locations/krefeld.jpg";
import imgBonn from "@/assets/locations/bonn.webp";
import imgMuelheim from "@/assets/locations/muelheim.jpg";

// Team images
import imgBenedikt from "@/assets/team/benedikt-noechel.jpg";
import imgErsel from "@/assets/team/ersel-uzun.jpg";

export interface LocationManager {
  name: string;
  role: string;
  image: string | null;
  email: string;
}

export interface LocationHours {
  day: string;
  time: string;
}

export type LocationServiceCharacter =
  | "full-warehouse"
  | "service-handover"
  | "delivery-only";

export interface LocationInfo {
  id: string;
  name: string;
  shortName: string;
  subtitle: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  image: string | null;
  manager: LocationManager;
  hours: LocationHours[];
  hoursNote?: string;
  features: string[];
  mapUrl: string;

  // Optional standort-story fields (Sprint 1)
  storyHeadline?: string;
  storyIntro?: string;
  storyParagraphs?: string[];
  serviceCharacter?: LocationServiceCharacter;
  cataloguePromise?: string;
  deliveryRadius?: string[];
  industryFocus?: string[];
  futurePromise?: string;
}

export const locationData: LocationInfo[] = [
  {
    id: "krefeld",
    name: "Krefeld",
    shortName: "KR",
    subtitle: "Hauptsitz",
    description: "Miete bei uns Minibagger, Anhänger, Stromaggregate und vieles mehr für dein nächstes Projekt zum besten Preis!",
    address: "Anrather Straße 291",
    city: "47807 Krefeld-Fichtenhain",
    phone: "02151 417 99 04",
    email: "krefeld@slt-rental.de",
    image: imgKrefeld,
    manager: { name: "Benedikt Nöchel", role: "locations.locationManager", image: imgBenedikt, email: "b.noechel@slt-rental.de" },
    hours: [
      { day: "Mo. - Fr.", time: "07:30 - 18:00 Uhr" },
      { day: "Sa.", time: "08:00 - 14:30 Uhr*" },
      { day: "So.", time: "Geschlossen" },
    ],
    hoursNote: "*Öffnungszeiten nur mit vorheriger Buchung.",
    features: ["Große Auswahl", "Hauptlager", "Werkstatt vor Ort", "24/7 Anhänger-Buchung"],
    mapUrl: "https://maps.google.com/?q=Anrather+Straße+291+47807+Krefeld",
    serviceCharacter: "full-warehouse",
    storyHeadline: "Ihr zentraler Mietpark am Niederrhein",
    storyIntro:
      "Krefeld ist unser Hauptstandort. Hier liegt unser Zentrallager mit dem kompletten Sortiment, dem Service-Team und der Werkstatt. Direkt an der A44, mit kurzen Wegen ins gesamte westliche NRW.",
    storyParagraphs: [
      "Vom Standort Krefeld-Fichtenhain (Anrather Straße 291) aus betreuen wir Kunden in ganz Nordrhein-Westfalen. Hier finden Sie unser komplettes Mietsortiment vor Ort: über 350 Geräte und Maschinen, vom Minibagger bis zum kompletten Eventaufbau, von der Anhängerflotte bis zum Stromaggregat.",
      "Unser Niederrhein-Einzugsgebiet umfasst Krefeld selbst, die Nachbarstädte Meerbusch, Willich und Kaarst sowie die Großstädte Düsseldorf, Mönchengladbach und Duisburg-West. Lieferung und Abholung im Stadtgebiet sind in der Regel taggleich möglich.",
      "Krefeld ist gleichzeitig unser logistischer Hub: Geräte, die an unseren weiteren Standorten Bonn und Mülheim an der Ruhr benötigt werden, kommen aus Krefeld – meist innerhalb von 24 Stunden. Unsere Werkstatt sorgt für lückenlose Wartung und schnelle Reparatur, damit das Equipment immer einsatzbereit ist.",
    ],
    cataloguePromise: "Komplettes Mietsortiment vor Ort verfügbar.",
    deliveryRadius: [
      "Krefeld",
      "Meerbusch",
      "Willich",
      "Kaarst",
      "Mönchengladbach",
      "Düsseldorf",
      "Neuss",
      "Duisburg-West",
    ],
    industryFocus: ["Bauwirtschaft", "GaLaBau", "Eventbranche", "Industrie Niederrhein"],
  },
  {
    id: "bonn",
    name: "Bonn",
    shortName: "BN",
    subtitle: "Filiale",
    description: "Miete bei uns Minibagger, Anhänger, Stromaggregate und vieles mehr für dein nächstes Projekt zum besten Preis!",
    address: "Drachenburgstraße 8",
    city: "53179 Bonn",
    phone: "0228 504 660 61",
    email: "bonn@slt-rental.de",
    image: imgBonn,
    manager: { name: "Ersel Uzun", role: "locations.locationManager", image: imgErsel, email: "e.uzun@slt-rental.de" },
    hours: [
      { day: "Mo. - Fr.", time: "07:30 - 18:00 Uhr" },
      { day: "Sa.", time: "08:00 - 14:30 Uhr*" },
      { day: "So.", time: "Geschlossen" },
    ],
    hoursNote: "*Öffnungszeiten nur mit vorheriger Buchung.",
    features: ["Große Auswahl", "Werkstatt vor Ort", "24/7 Anhänger-Buchung"],
    mapUrl: "https://maps.google.com/?q=Drachenburgstraße+8+53179+Bonn",
    serviceCharacter: "full-warehouse",
    storyHeadline: "Ihr Mietpark für die Rheinschiene",
    storyIntro:
      "Bonn ist unser zweiter Standort mit eigenem Sortiment und vor-Ort-Übergabe. Damit erreichen wir Kunden in Bonn, Köln-Süd, dem Ahrtal und im Rhein-Sieg-Kreis ohne lange Lieferwege.",
    storyParagraphs: [
      "An unserem Standort Bonn (Drachenburgstraße 8) finden Sie ein eigenes, abgestimmtes Sortiment: die häufig gefragten Geräte für Tiefbau, Sanierung, Garten- und Landschaftsbau sowie für Veranstaltungen direkt vor Ort. Spezialteile aus dem erweiterten Sortiment liefern wir auf Anfrage aus unserem Hauptstandort Krefeld.",
      "Unser Bonn-Einzugsgebiet umfasst die Bundesstadt Bonn selbst sowie die Region zwischen Köln-Süd, dem Ahrtal und dem Rhein-Sieg-Kreis. Typische Lieferorte sind Wachtberg, Bad Honnef, Königswinter, Sankt Augustin und das südliche Köln-Stadtgebiet.",
      "Für Bauträger, Sanierungsbetriebe und Garten-/Landschaftsbauer in der Region sind wir die Mietalternative mit kurzen Wegen. Anfragen und Beratung vor Ort – das Bonn-Team berät persönlich, organisiert die Bereitstellung und kümmert sich um die Übergabe.",
    ],
    cataloguePromise: "Lokales Kernsortiment plus Lieferung aus Krefeld bei Bedarf.",
    deliveryRadius: [
      "Bonn",
      "Köln-Süd",
      "Wachtberg",
      "Bad Honnef",
      "Königswinter",
      "Sankt Augustin",
      "Bad Neuenahr-Ahrweiler",
      "Rhein-Sieg-Kreis",
    ],
    industryFocus: ["Tiefbau", "GaLaBau", "Sanierung", "Eventbranche Rheinland"],
  },
  {
    id: "muelheim",
    name: "Mülheim an der Ruhr",
    shortName: "MH",
    subtitle: "Corporate Filiale SLT x Bobcat",
    description: "Miete bei uns Minibagger, Anhänger und mehr für dein nächstes Projekt zum besten Preis!",
    address: "Ruhrorter Str. 122",
    city: "45478 Mülheim an der Ruhr",
    phone: "02151 417 99 04",
    email: "muelheim@slt-rental.de",
    image: imgMuelheim,
    manager: { name: "Andreas Scherzow", role: "locations.locationManager", image: null, email: "muelheim@slt-rental.de" },
    hours: [
      { day: "Online-Buchung", time: "24/7 verfügbar" },
      { day: "Abholung", time: "nach Vereinbarung" },
    ],
    features: ["Bagger & Anhänger", "Ruhrgebiet-Nähe", "24/7 Anhänger-Buchung", "Schnelle Abwicklung"],
    mapUrl: "https://maps.google.com/?q=Ruhrorter+Str.+122+45478+Mülheim",
    serviceCharacter: "service-handover",
    storyHeadline: "Beratung und Übergabe für das Ruhrgebiet",
    storyIntro:
      "Mülheim an der Ruhr ist unser Service-Standort für das gesamte Ruhrgebiet. Beratung, Übergabe und Rücknahme finden vor Ort statt – die Geräte kommen direkt aus unserem Zentrallager in Krefeld, mit kurzen Wegen über die A40.",
    storyParagraphs: [
      "Mülheim an der Ruhr ist strategisch im Herzen des Ruhrgebiets gelegen. Von hier aus erreichen wir Essen, Duisburg, Oberhausen und Bochum innerhalb von 30 Minuten. Was uns von reinen Online-Anbietern unterscheidet: Sie haben einen festen Ansprechpartner vor Ort, können Geräte persönlich abholen und übergeben, und werden vor Mietbeginn praktisch eingewiesen.",
      "Das vollständige Mietsortiment unseres Hauptlagers in Krefeld ist auch über den Standort Mülheim verfügbar. Bei Anfragen disponieren wir die benötigten Geräte aus Krefeld nach Mülheim – meist innerhalb von 24 Stunden, bei kurzfristigem Bedarf häufig auch am selben Werktag. Für planbare Mietzeiträume übernehmen wir die komplette Logistik.",
      "Unser Standort Mülheim entwickelt sich. Mittelfristig werden wir vor Ort ein eigenes Stamm-Sortiment führen – die Geräte, die im Ruhrgebiet am häufigsten gefragt sind: Minibagger, Aggregate, Anhänger und Eventtechnik. Bis dahin sorgen wir mit kurzen Lieferwegen aus Krefeld für die gleiche Verfügbarkeit wie an einem klassischen Mietpark-Standort.",
      "Branchen, die wir im Ruhrgebiet besonders bedienen: Bauunternehmen, Industrie-Dienstleister, Logistik-Firmen, Veranstalter und Privatkunden für größere Heim- und Gartenprojekte. Beratung kostenfrei, persönlich, vor Ort.",
    ],
    cataloguePromise:
      "Komplettes Mietsortiment verfügbar – Disposition und Lieferung aus dem Zentrallager Krefeld.",
    deliveryRadius: [
      "Mülheim an der Ruhr",
      "Essen",
      "Duisburg",
      "Oberhausen",
      "Bochum",
      "Gelsenkirchen",
      "Hattingen",
    ],
    industryFocus: ["Bauwirtschaft Ruhrgebiet", "Industrie", "Logistik", "Eventbranche"],
    futurePromise:
      "Eigenes Stamm-Sortiment vor Ort in Planung – bis dahin profitieren Sie von der Verbindung zur Vollausstattung in Krefeld.",
  },
];

export function getLocationInfoById(id: string): LocationInfo | undefined {
  return locationData.find((loc) => loc.id === id);
}
