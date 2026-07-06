import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fixed origin addresses per SLT location — used for distance calculation.
const LOCATION_ORIGINS: Record<string, string> = {
  krefeld: "Anrather Straße 291, 47807 Krefeld, Germany",
  bonn: "Drachenburgstraße 8, 53179 Bonn, Germany",
  muelheim: "Ruhrorter Straße 122, 45478 Mülheim an der Ruhr, Germany",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!apiKey) {
      return json({ error: "GOOGLE_PLACES_API_KEY is not configured" }, 500);
    }

    const body = await req.json();
    const action = body?.action as string | undefined;

    if (action === "autocomplete") {
      const input = String(body.input ?? "").trim();
      const sessionToken = String(body.sessionToken ?? "");
      if (input.length < 3) return json({ suggestions: [] });

      const res = await fetch(
        "https://places.googleapis.com/v1/places:autocomplete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
              "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
          },
          body: JSON.stringify({
            input,
            sessionToken: sessionToken || undefined,
            includedRegionCodes: ["de"],
            languageCode: "de",
          }),
        },
      );

      if (!res.ok) {
        const t = await res.text();
        console.error("Autocomplete failed", res.status, t);
        return json({ error: "Autocomplete failed", details: t }, 502);
      }

      const data = await res.json();
      const suggestions = (data?.suggestions ?? [])
        .map((s: any) => s?.placePrediction)
        .filter(Boolean)
        .map((p: any) => ({
          placeId: p.placeId as string,
          text: p.text?.text as string,
          mainText: p.structuredFormat?.mainText?.text as string | undefined,
          secondaryText: p.structuredFormat?.secondaryText?.text as string | undefined,
        }));

      return json({ suggestions });
    }

    if (action === "distance" || action === "distanceAll") {
      const placeId = body.placeId ? String(body.placeId) : undefined;
      const address = body.address ? String(body.address).trim() : undefined;
      if (!placeId && !address) {
        return json({ error: "placeId or address is required" }, 400);
      }
      const destination = placeId ? { placeId } : { address };

      async function computeFor(locationId: string) {
        const origin = LOCATION_ORIGINS[locationId];
        if (!origin) return null;
        const res = await fetch(
          "https://routes.googleapis.com/directions/v2:computeRoutes",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": apiKey,
              "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
            },
            body: JSON.stringify({
              origin: { address: origin },
              destination,
              travelMode: "DRIVE",
              routingPreference: "TRAFFIC_UNAWARE",
              regionCode: "DE",
              languageCode: "de",
            }),
          },
        );
        if (!res.ok) {
          const t = await res.text();
          console.error(`Routes failed for ${locationId}`, res.status, t);
          return null;
        }
        const data = await res.json();
        const route = data?.routes?.[0];
        if (!route?.distanceMeters) return null;
        const meters = Number(route.distanceMeters);
        const km = meters / 1000;
        const roundedKm = Math.max(5, Math.ceil(km / 5) * 5);
        return {
          locationId,
          origin,
          distanceMeters: meters,
          distanceKm: km,
          roundedKm,
          durationSeconds:
            Number(String(route.duration ?? "0s").replace(/\D/g, "")) || null,
        };
      }

      if (action === "distance") {
        const locationId = String(body.locationId ?? "");
        if (!LOCATION_ORIGINS[locationId]) {
          return json({ error: "Unknown locationId" }, 400);
        }
        const result = await computeFor(locationId);
        if (!result) return json({ error: "No route found" }, 404);
        return json(result);
      }

      // distanceAll: compute for all origins in parallel, return sorted list + best
      const ids = Object.keys(LOCATION_ORIGINS);
      const results = (await Promise.all(ids.map(computeFor))).filter(Boolean) as Array<{
        locationId: string;
        distanceKm: number;
        roundedKm: number;
      }>;
      if (results.length === 0) return json({ error: "No route found" }, 404);
      results.sort((a, b) => a.distanceKm - b.distanceKm);
      return json({ best: results[0], results });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error(err);
    return json({ error: String(err) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
