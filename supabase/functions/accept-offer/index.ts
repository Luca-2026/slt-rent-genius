import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { offer_id } = await req.json();

    if (!offer_id) {
      return new Response(JSON.stringify({ error: "offer_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch the offer
    const { data: offer, error: offerError } = await serviceClient
      .from("b2b_offers")
      .select("*, b2b_profiles!inner(user_id)")
      .eq("id", offer_id)
      .single();

    if (offerError || !offer) {
      console.error("Offer not found:", offerError);
      return new Response(JSON.stringify({ error: "Offer not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the user owns this offer (via their b2b_profile)
    if ((offer as any).b2b_profiles?.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Access denied" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check offer is in a confirmable state
    if (offer.status !== "sent") {
      return new Response(
        JSON.stringify({ error: `Offer cannot be accepted (current status: ${offer.status})` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Customer accepting offer:", offer.offer_number, "by user:", user.id);

    // Update offer status to accepted
    const { error: updateOfferError } = await serviceClient
      .from("b2b_offers")
      .update({ status: "accepted" })
      .eq("id", offer_id);

    if (updateOfferError) {
      console.error("Failed to update offer:", updateOfferError);
      return new Response(JSON.stringify({ error: "Failed to accept offer" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update reservation status to confirmed (if linked)
    if (offer.reservation_id) {
      const { error: updateResError } = await serviceClient
        .from("b2b_reservations")
        .update({ status: "confirmed" })
        .eq("id", offer.reservation_id);

      if (updateResError) {
        console.error("Failed to update reservation:", updateResError);
      }
    }

    console.log("Offer accepted successfully:", offer.offer_number);

    return new Response(
      JSON.stringify({
        success: true,
        offer_number: offer.offer_number,
        reservation_updated: !!offer.reservation_id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
