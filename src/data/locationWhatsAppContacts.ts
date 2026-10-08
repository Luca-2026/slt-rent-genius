import { bonnDirectContact } from "@/data/bonnContact";

export const krefeldDirectContact = Object.freeze({
  name: "Benedikt Nöchel",
  phone: "+49 15789150872",
  whatsappUrl: "https://wa.me/4915789150872",
});

export function getLocationWhatsAppContact(location?: string | null) {
  switch (location?.trim().toLowerCase()) {
    case "krefeld": return krefeldDirectContact;
    case "bonn": return bonnDirectContact;
    default: return null;
  }
}