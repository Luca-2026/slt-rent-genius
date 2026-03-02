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
  },
  {
    id: "muelheim",
    name: "Mülheim an der Ruhr",
    shortName: "MH",
    subtitle: "Filiale",
    description: "Miete bei uns Minibagger, Anhänger und mehr für dein nächstes Projekt zum besten Preis!",
    address: "Ruhrorter Str. 100",
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
    mapUrl: "https://maps.google.com/?q=Ruhrorter+Str.+100+45478+Mülheim",
  },
];

export function getLocationInfoById(id: string): LocationInfo | undefined {
  return locationData.find((loc) => loc.id === id);
}
