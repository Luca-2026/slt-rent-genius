// Google Site Verification helper using a service account.
// Requires authenticated admin user.
// POST { action: "getToken" | "verify", identifier: "https://www.slt-rental.de/" }

import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized: missing Bearer token");
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    throw new Error("Unauthorized: invalid token");
  }

  const userId = claimsData.claims.sub;
  const { data: hasRole, error: roleError } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });

  if (roleError || !hasRole) {
    throw new Error("Forbidden: admin role required");
  }

  return userId;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    await requireAdmin(req);

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
    const errMsg = (e as Error).message;
    const status = errMsg.startsWith("Unauthorized") ? 401 : errMsg.startsWith("Forbidden") ? 403 : 500;
    return new Response(JSON.stringify({ error: errMsg }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
