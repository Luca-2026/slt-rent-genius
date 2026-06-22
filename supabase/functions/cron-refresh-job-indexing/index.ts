// Cron-getriggert: pingt die Google Indexing API für alle JobPosting-URLs.
// Geschützt per CRON_SECRET Header (kein User-JWT, läuft als pg_cron Job).

import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SCOPE = "https://www.googleapis.com/auth/indexing";
const TOKEN_URI = "https://oauth2.googleapis.com/token";
const PUBLISH_URL = "https://indexing.googleapis.com/v3/urlNotifications:publish";
const BASE = "https://www.slt-rental.de";

// Synchron mit src/components/karriere/jobData.ts gehalten.
const JOB_SLUGS = [
  "standortleiter-niederlassungsleiter-vermietung-bonn",
  "lieferfahrer-baumaschinen-krefeld",
  "ausbildung-kaufmann-bueromanagement-krefeld-bonn",
  "baumaschinentechniker-servicetechniker-krefeld",
  "vertriebsmitarbeiter-baumaschinen-zoomlion-nrw",
  "kundenberater-disponent-miete-verkauf-krefeld-bonn",
];

function pemToArrayBuffer(pem: string): ArrayBuffer {
  let s = pem
    .replace(/\\n/g, "")
    .replace(/\\r/g, "")
    .replace(/-----BEGIN[^-]+-----/g, "")
    .replace(/-----END[^-]+-----/g, "")
    .replace(/\s+/g, "");
  const idx = s.indexOf("MII");
  if (idx > 0) s = s.slice(idx);
  s = s.replace(/[^A-Za-z0-9+/=]/g, "");
  const binary = atob(s);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getAccessToken(): Promise<string> {
  const clientEmail = Deno.env.get("GOOGLE_INDEXING_CLIENT_EMAIL");
  const privateKeyPem = Deno.env.get("GOOGLE_INDEXING_PRIVATE_KEY");
  if (!clientEmail || !privateKeyPem) {
    throw new Error("Missing GOOGLE_INDEXING_CLIENT_EMAIL or GOOGLE_INDEXING_PRIVATE_KEY");
  }
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const jwt = await create(
    { alg: "RS256", typ: "JWT" },
    { iss: clientEmail, scope: SCOPE, aud: TOKEN_URI, iat: getNumericDate(0), exp: getNumericDate(3600) },
    key,
  );
  const res = await fetch(TOKEN_URI, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const provided = req.headers.get("x-cron-secret");
    if (!cronSecret || provided !== cronSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getAccessToken();
    const results = [];
    for (const slug of JOB_SLUGS) {
      const url = `${BASE}/karriere/${slug}/`;
      try {
        const r = await fetch(PUBLISH_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ url, type: "URL_UPDATED" }),
        });
        const text = await r.text();
        results.push({ url, status: r.status, ok: r.ok, body: text.slice(0, 200) });
        if (!r.ok) console.error(`Indexing failed for ${url}: ${r.status} ${text}`);
        else console.log(`Indexing ok for ${url}`);
      } catch (e) {
        results.push({ url, status: 0, ok: false, body: (e as Error).message });
      }
    }
    const successCount = results.filter((r) => r.ok).length;
    return new Response(
      JSON.stringify({ successCount, total: results.length, results, ranAt: new Date().toISOString() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("cron-refresh-job-indexing error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
