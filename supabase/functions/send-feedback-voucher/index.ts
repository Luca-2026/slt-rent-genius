import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Retired: manual codes and promotional coupon emails bypassed the one-per-customer flow.
Deno.serve((req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return new Response(JSON.stringify({ error: "Manueller Gutscheinversand wurde durch persönliche Feedback-Gutscheine ersetzt." }), {
    status: 410,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
