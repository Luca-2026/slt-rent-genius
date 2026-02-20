import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authenticate the user
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

    // Fetch customer context in parallel
    const [profileRes, reservationsRes, invoicesRes] = await Promise.all([
      supabase
        .from("b2b_profiles")
        .select("company_name, contact_first_name, contact_last_name, status, credit_limit, used_credit, payment_due_days, assigned_location, city")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("b2b_reservations")
        .select("product_name, start_date, end_date, status, location, quantity, discounted_price, original_price")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("b2b_invoices")
        .select("invoice_number, invoice_date, due_date, gross_amount, status, payment_due_days")
        .eq("b2b_profile_id", 
          (await supabase.from("b2b_profiles").select("id").eq("user_id", user.id).single()).data?.id || "")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const profile = profileRes.data;
    const reservations = reservationsRes.data || [];
    const invoices = invoicesRes.data || [];

    // Calculate credit usage
    const creditUsagePercent = profile && profile.credit_limit > 0
      ? Math.round((profile.used_credit / profile.credit_limit) * 100)
      : 0;

    const openInvoices = invoices.filter(i => i.status === "open" || i.status === "overdue");
    const overdueInvoices = invoices.filter(i => i.status === "overdue");
    const activeRentals = reservations.filter(r => r.status === "confirmed" || r.status === "active");

    // Build system prompt with customer context
    const systemPrompt = `Du bist ein freundlicher KI-Assistent für das B2B-Kundenportal von SLT Rent (Baumaschinen- und Geräteverleih). Du hilfst Kunden bei Fragen zu ihren Mietverträgen, Rechnungen und ihrem Konto.

WICHTIG: Antworte immer auf Deutsch, sei präzise und freundlich. Verwende die bereitgestellten Kundendaten, um personalisierte Antworten zu geben.

=== KUNDENDATEN ===
Unternehmen: ${profile?.company_name || "Unbekannt"}
Ansprechpartner: ${profile?.contact_first_name || ""} ${profile?.contact_last_name || ""}
Kontostatus: ${profile?.status === "approved" ? "Freigegeben" : profile?.status || "Unbekannt"}
Standort: ${profile?.assigned_location || profile?.city || "Nicht zugewiesen"}
Kreditlimit: ${profile?.credit_limit?.toLocaleString("de-DE") || 0} €
Genutztes Kreditlimit: ${profile?.used_credit?.toLocaleString("de-DE") || 0} € (${creditUsagePercent}%)
Zahlungsziel: ${profile?.payment_due_days || 14} Tage

=== AKTIVE MIETVORGÄNGE (${activeRentals.length}) ===
${activeRentals.length === 0 ? "Keine aktiven Mietvorgänge" : activeRentals.map(r =>
  `• ${r.product_name || "Produkt"}: ${r.start_date} bis ${r.end_date || "offen"} – Status: ${r.status} – Standort: ${r.location} – Menge: ${r.quantity} – Preis: ${(r.discounted_price || r.original_price || 0).toLocaleString("de-DE")} €`
).join("\n")}

=== OFFENE RECHNUNGEN (${openInvoices.length}) ===
${openInvoices.length === 0 ? "Keine offenen Rechnungen" : openInvoices.map(r =>
  `• ${r.invoice_number}: ${r.gross_amount?.toLocaleString("de-DE")} € – Fällig: ${r.due_date || "unbekannt"} – Status: ${r.status === "overdue" ? "ÜBERFÄLLIG" : "Offen"}`
).join("\n")}

${overdueInvoices.length > 0 ? `⚠️ ÜBERFÄLLIGE RECHNUNGEN: ${overdueInvoices.length} Rechnung(en) sind überfällig!` : ""}

=== LETZTE MIETVORGÄNGE (${reservations.length}) ===
${reservations.length === 0 ? "Keine Mietvorgänge" : reservations.slice(0, 5).map(r =>
  `• ${r.product_name || "Produkt"}: ${r.start_date} – Status: ${r.status}`
).join("\n")}

=== ANLEITUNG ===
- Beantworte Fragen zu Mietvorgängen, Rechnungen, Kreditlimit und Kontoinfos anhand der obigen Daten
- Für technische Probleme oder Änderungen verweise auf den Kontakt: mieten@slt-rental.de oder Tel. 02151 417 990 4
- Du kannst keine Änderungen vornehmen, nur Informationen geben
- Wenn du etwas nicht weißt, sage es ehrlich und verweise auf den Kundendienst
- Nenne IMMER den korrekten Firmennamen "SLT Rental" – niemals "SLT Rent"
- Fragen zu Preisen für neue Produkte kannst du nicht beantworten`;

    const { messages } = await req.json();

    // Call Lovable AI Gateway with streaming
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "KI-Dienst vorübergehend überlastet. Bitte versuche es in Kürze erneut." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "KI-Dienst nicht verfügbar. Bitte kontaktiere den Support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "KI-Dienst Fehler" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(aiResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error: any) {
    console.error("b2b-chat error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unbekannter Fehler" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
