/**
 * Öffentliche Standortfakten (Adresse, Kontakt, Öffnungszeiten) – führende Quelle für Website (src/data/locationData.ts)
 * und Renty (public-chat). Nur freigegebene, öffentliche Angaben; keine personenbezogenen Daten.
 */
export interface PublicLocationHours { day: string; time: string }
export interface PublicLocationFacts { address: string; city: string; phone: string; email: string; hours: PublicLocationHours[]; hoursNote?: string }
export const PUBLIC_LOCATION_IDS = ["krefeld", "bonn", "muelheim"] as const;
export type PublicLocationId = typeof PUBLIC_LOCATION_IDS[number];
export const PUBLIC_LOCATION_NAMES: Record<PublicLocationId, string> = { krefeld: "Krefeld", bonn: "Bonn", muelheim: "Mülheim an der Ruhr" };
export const PUBLIC_LOCATION_FACTS: Record<PublicLocationId, PublicLocationFacts> = {
  krefeld: {
    address: "Anrather Straße 291",
    city: "47807 Krefeld-Fichtenhain",
    phone: "02151 417 99 04",
    email: "krefeld@slt-rental.de",
    hours: [
      { day: "Mo. - Fr.", time: "08:00 - 18:00 Uhr" },
      { day: "Sa.", time: "10:00 - 14:30 Uhr*" },
      { day: "So.", time: "Geschlossen" },
    ],
    hoursNote: "*Samstags früher nach vorheriger Buchung möglich.",
  },
  bonn: {
    address: "Drachenburgstraße 8",
    city: "53179 Bonn",
    phone: "0228 504 660 61",
    email: "bonn@slt-rental.de",
    hours: [
      { day: "Mo. - Do.", time: "07:00 - 16:30 Uhr" },
      { day: "Fr.", time: "07:00 - 18:00 Uhr" },
      { day: "Sa.", time: "Geschlossen" },
      { day: "So.", time: "Geschlossen" },
    ],
    hoursNote: "Anhänger-Abholung und -Rückgabe per Code weiterhin 24/7.",
  },
  muelheim: {
    address: "Ruhrorter Str. 122",
    city: "45478 Mülheim an der Ruhr",
    phone: "02151 417 99 04",
    email: "muelheim@slt-rental.de",
    hours: [
      { day: "Online-Buchung", time: "24/7 verfügbar" },
      { day: "Abholung", time: "nach Vereinbarung" },
    ],
  },
};
