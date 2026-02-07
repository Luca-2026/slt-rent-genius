/**
 * Maps German postal codes (PLZ) to the nearest SLT Rental location.
 * 
 * SLT Locations with approximate coordinates:
 * - Krefeld (47807): 51.338°N, 6.585°E
 * - Bonn (53179): 50.734°N, 7.100°E  
 * - Mülheim an der Ruhr (45478): 51.427°N, 6.883°E
 * 
 * Uses a PLZ prefix mapping based on geographic proximity.
 */

// PLZ first 2 digits → nearest SLT location
const plzPrefixMap: Record<string, string> = {
  // Niederrhein / Düsseldorf area → Krefeld
  "40": "krefeld",
  "41": "krefeld",
  "47": "krefeld",
  
  // Bergisches Land → Mülheim (closer to Ruhr)
  "42": "muelheim",
  "43": "muelheim",
  
  // Ruhrgebiet → Mülheim
  "44": "muelheim",
  "45": "muelheim",
  "46": "muelheim",
  
  // Münsterland → Mülheim
  "48": "muelheim",
  "49": "muelheim",
  
  // Köln area → Bonn
  "50": "bonn",
  "51": "bonn",
  
  // Aachen area → Bonn
  "52": "bonn",
  
  // Bonn area → Bonn
  "53": "bonn",
  
  // Eifel / Trier → Bonn
  "54": "bonn",
  "55": "bonn",
  "56": "bonn",
  
  // Siegerland / Sauerland → Mülheim
  "57": "muelheim",
  "58": "muelheim",
  "59": "muelheim",
};

/**
 * Determines the nearest SLT location based on a German postal code (PLZ).
 * Falls back to "krefeld" (Hauptsitz) for unknown PLZ ranges.
 */
export function getNearestLocation(postalCode: string): string {
  const trimmed = postalCode.trim();
  if (trimmed.length < 2) return "krefeld";
  
  const prefix = trimmed.substring(0, 2);
  return plzPrefixMap[prefix] || "krefeld";
}

/**
 * Returns a human-readable location name for a location ID.
 */
export function getLocationDisplayName(locationId: string): string {
  const names: Record<string, string> = {
    krefeld: "Krefeld",
    bonn: "Bonn",
    muelheim: "Mülheim an der Ruhr",
  };
  return names[locationId] || locationId;
}
