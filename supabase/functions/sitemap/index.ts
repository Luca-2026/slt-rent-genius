// Edge Function `sitemap`
// -----------------------
// SINGLE SOURCE OF TRUTH: der statische Build erzeugt aus derselben Routen-
// Liste (`dist/.prerender-routes.json` → `dist/sitemap.xml`) genau eine
// Sitemap und deployt sie unter https://www.slt-rental.de/sitemap.xml.
// robots.txt verweist ausschließlich auf diese Datei.
//
// Diese Edge Function bleibt als Fallback/Alt-Endpoint bestehen und
// spiegelt lediglich die kanonische Datei. So können Frontend, Prerender
// und Edge Function niemals auseinanderlaufen. Der frühere, hart kodierte
// staticPages/locationCategories-Block ist bewusst entfernt.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CANONICAL_SITEMAP_URL = "https://www.slt-rental.de/sitemap.xml";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const upstream = await fetch(CANONICAL_SITEMAP_URL, {
      headers: { "Accept": "application/xml" },
    });
    if (!upstream.ok) {
      const body = await upstream.text();
      console.error(`sitemap upstream fetch failed [${upstream.status}]: ${body.slice(0, 200)}`);
      return new Response(
        JSON.stringify({ error: "Upstream sitemap unavailable", status: upstream.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const xml = await upstream.text();
    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "X-Sitemap-Source": CANONICAL_SITEMAP_URL,
      },
    });
  } catch (err) {
    console.error("sitemap edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Sitemap fetch failed", details: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
