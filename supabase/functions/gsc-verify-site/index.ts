// Google Site Verification helper using a service account.
// POST { action: "getToken" | "verify", identifier: "https://www.slt-rental.de/" }

import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SCOPE = "https://www.googleapis.com/auth/siteverification";
const TOKEN_URI = "https://oauth2.googleapis.com/token";

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
  if (!clientEmail || !privateKeyPem) throw new Error("Missing service account secrets");

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
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action ?? "getToken";
    const identifier: string = body?.identifier ?? "https://www.slt-rental.de/";
    const token = await getAccessToken();

    if (action === "getToken") {
      const r = await fetch("https://www.googleapis.com/siteVerification/v1/token", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ site: { identifier, type: "SITE" }, verificationMethod: "META" }),
      });
      const text = await r.text();
      return new Response(text, { status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "verify") {
      const r = await fetch(
        "https://www.googleapis.com/siteVerification/v1/webResource?verificationMethod=META",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ site: { identifier, type: "SITE" } }),
        },
      );
      const text = await r.text();
      return new Response(text, { status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
