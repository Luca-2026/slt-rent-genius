// Straßen-Entfernung Standort → Ziel (Google Routes). Gleiche Basis für Website-Rechner und Anfrageprüfung.
export const LOCATION_ORIGINS: Record<string, string> = {
  krefeld: "Anrather Straße 291, 47807 Krefeld, Germany",
  bonn: "Drachenburgstraße 8, 53179 Bonn, Germany",
  muelheim: "Ruhrorter Straße 122, 45478 Mülheim an der Ruhr, Germany",
};

export async function routeDistance(apiKey: string, locationId: string, destination: { placeId: string } | { address: string }) {
  const origin = LOCATION_ORIGINS[locationId];
  if (!origin) return null;
  const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "routes.distanceMeters,routes.duration" },
    body: JSON.stringify({ origin: { address: origin }, destination, travelMode: "DRIVE", routingPreference: "TRAFFIC_UNAWARE", regionCode: "DE", languageCode: "de" }),
  });
  if (!res.ok) { console.error(`Routes failed for ${locationId}`, res.status, await res.text()); return null; }
  const route = (await res.json())?.routes?.[0];
  if (!route?.distanceMeters) return null;
  const meters = Number(route.distanceMeters);
  const km = meters / 1000;
  return { locationId, origin, distanceMeters: meters, distanceKm: km, roundedKm: Math.max(5, Math.ceil(km / 5) * 5), durationSeconds: Number(String(route.duration ?? "0s").replace(/\D/g, "")) || null };
}
