// Google Indexing API notifier for JobPosting URLs
// Generates a Google OAuth2 access token via service account JWT, then
// POSTs URL_UPDATED notifications to https://indexing.googleapis.com/v3/urlNotifications:publish

import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SCOPE = "https://www.googleapis.com/auth/indexing";
const TOKEN_URI = "https://oauth2.googleapis.com/token";
const PUBLISH_URL = "https://indexing.googleapis.com/v3/urlNotifications:publish";

function pemToArrayBuffer(pem: string): ArrayBuffer {
  let cleaned = pem.trim();
  // strip wrapping quotes if user pasted the JSON-quoted value
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  cleaned = cleaned
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "")
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s+/g, "");
  console.log("PEM debug", { len: cleaned.length, first20: cleaned.slice(0, 20), last20: cleaned.slice(-20) });
  const binary = atob(cleaned);
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

  const now = getNumericDate(0);
  const exp = getNumericDate(60 * 60);
  const jwt = await create(
    { alg: "RS256", typ: "JWT" },
    {
      iss: clientEmail,
      scope: SCOPE,
      aud: TOKEN_URI,
      iat: now,
      exp,
    },
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
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

async function notifyUrl(token: string, url: string, type: "URL_UPDATED" | "URL_DELETED") {
  const res = await fetch(PUBLISH_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, type }),
  });
  const text = await res.text();
  return { url, status: res.status, ok: res.ok, body: text };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const urls: string[] = Array.isArray(body?.urls) ? body.urls : [];
    const type: "URL_UPDATED" | "URL_DELETED" = body?.type === "URL_DELETED" ? "URL_DELETED" : "URL_UPDATED";

    if (urls.length === 0) {
      return new Response(
        JSON.stringify({ error: "Provide non-empty 'urls' array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (urls.length > 100) {
      return new Response(
        JSON.stringify({ error: "Maximum 100 URLs per request" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const token = await getAccessToken();
    const results = [];
    for (const url of urls) {
      try {
        results.push(await notifyUrl(token, url, type));
      } catch (e) {
        results.push({ url, status: 0, ok: false, body: (e as Error).message });
      }
    }

    const successCount = results.filter((r) => r.ok).length;
    return new Response(
      JSON.stringify({ successCount, total: results.length, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("notify-google-indexing error", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
