import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      userId,
      companyName,
      legalForm,
      taxId,
      tradeRegisterNumber,
      firstName,
      lastName,
      position,
      phone,
      email,
      billingEmail,
      street,
      houseNumber,
      postalCode,
      city,
      assignedLocation,
      postalInvoice,
      documentBase64,
      documentFilename,
    } = await req.json();

    if (!userId || !companyName || !firstName || !lastName || !phone || !email || !street || !postalCode || !city) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to create profile (user has no session yet - email not confirmed)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if profile already exists
    const { data: existing } = await serviceClient
      .from("b2b_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true, profile_id: existing.id, already_exists: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upload document if provided
    let documentUrl: string | null = null;
    if (documentBase64 && documentFilename) {
      const fileExt = documentFilename.split(".").pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;
      
      // Convert base64 to Uint8Array
      const binaryStr = atob(documentBase64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const { error: uploadError } = await serviceClient.storage
        .from("b2b-documents")
        .upload(filePath, bytes, {
          contentType: documentFilename.endsWith(".pdf") ? "application/pdf" : "application/octet-stream",
        });

      if (!uploadError) {
        const { data: urlData } = serviceClient.storage
          .from("b2b-documents")
          .getPublicUrl(filePath);
        documentUrl = urlData.publicUrl;
      } else {
        console.error("Document upload error:", uploadError);
      }
    }

    // Create b2b_profile
    const { data: profile, error: profileError } = await serviceClient
      .from("b2b_profiles")
      .insert({
        user_id: userId,
        company_name: companyName,
        legal_form: legalForm || null,
        tax_id: taxId || null,
        trade_register_number: tradeRegisterNumber || null,
        contact_first_name: firstName,
        contact_last_name: lastName,
        contact_position: position || null,
        contact_phone: phone,
        contact_email: email,
        billing_email: billingEmail || null,
        street,
        house_number: houseNumber || null,
        postal_code: postalCode,
        city,
        assigned_location: assignedLocation || null,
        postal_invoice: postalInvoice || false,
        document_url: documentUrl,
        document_filename: documentFilename || null,
        status: "pending",
        email_confirmed: false,
      })
      .select("id")
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`B2B profile created for ${companyName} (user: ${userId}, profile: ${profile.id})`);

    return new Response(JSON.stringify({ success: true, profile_id: profile.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("create-b2b-profile error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
