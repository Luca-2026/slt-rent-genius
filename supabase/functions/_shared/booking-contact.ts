export const BOOKING_CONTACT_FIELDS = ["name", "email", "phone", "street", "postalCode", "city"] as const;
export type BookingContactField = typeof BOOKING_CONTACT_FIELDS[number];
export type BookingContact = Record<BookingContactField, string>;
export function bookingContactErrors(contact: BookingContact): Partial<Record<BookingContactField, string>> {
  const errors: Partial<Record<BookingContactField, string>> = {};
  for (const key of BOOKING_CONTACT_FIELDS) {
    const value = contact[key].trim();
    if (!value) errors[key] = "Bitte ausfüllen.";
    else if (value.length > (key === "phone" ? 50 : key === "postalCode" ? 20 : key === "city" ? 100 : key === "email" ? 180 : 200)) errors[key] = "Bitte Eingabe kürzen.";
  }
  if (!errors.name && contact.name.trim().split(/\s+/).length < 2) errors.name = "Bitte Vor- und Nachname angeben.";
  if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) errors.email = "Bitte gültige E-Mail angeben.";
  if (!errors.phone && contact.phone.replace(/\D/g, "").length < 6) errors.phone = "Bitte gültige Telefonnummer angeben.";
  if (!errors.street && !/\d/.test(contact.street)) errors.street = "Bitte Straße und Hausnummer angeben.";
  return errors;
}