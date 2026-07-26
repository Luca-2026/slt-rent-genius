import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendDomain = Deno.env.get("RESEND_DOMAIN") ?? "slt-rental.de";
    if (!resendApiKey) return json({ error: "RESEND_API_KEY not configured" }, 500);

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await userClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    const service = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await service
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleData) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const feedbackId = typeof body.feedback_id === "string" ? body.feedback_id : "";
    const voucherCode = typeof body.voucher_code === "string" ? body.voucher_code.trim().slice(0, 60) : "";
    if (!feedbackId || !voucherCode) return json({ error: "feedback_id und voucher_code sind erforderlich" }, 400);

    const { data: fb, error: fbError } = await service
      .from("customer_feedback")
      .select("id, customer_name, customer_email, order_ref, voucher_sent_at")
      .eq("id", feedbackId)
      .maybeSingle();
    if (fbError || !fb) return json({ error: "Feedback nicht gefunden" }, 404);
    if (!fb.customer_email) return json({ error: "Für dieses Feedback ist keine E-Mail-Adresse hinterlegt." }, 400);

    const name = (fb.customer_name ?? "").trim();
    const greeting = name ? `Hallo ${escapeHtml(name)},` : "Hallo,";

    const html = `<!DOCTYPE html><html lang="de"><body style="margin:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:#00507d;color:#ffffff;padding:20px 24px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;font-size:20px;">Dein 10 % Cashback-Gutschein</h1>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
      <p style="margin:0 0 12px;">${greeting}</p>
      <p style="margin:0 0 16px;">vielen Dank für dein Feedback zum Mietprozess${fb.order_ref ? ` (Buchung ${escapeHtml(fb.order_ref)})` : ""} und für deine Google-Bewertung. Als Dankeschön erhältst du 10 % Rabatt auf deine nächste Miete.</p>
      <div style="text-align:center;margin:24px 0;">
        <div style="display:inline-block;background:#fff3e6;border:2px dashed #ff8e02;border-radius:8px;padding:16px 28px;">
          <div style="font-size:12px;color:#6b7280;letter-spacing:1px;">GUTSCHEINCODE</div>
          <div style="font-size:26px;font-weight:bold;color:#ff8e02;letter-spacing:2px;">${escapeHtml(voucherCode)}</div>
        </div>
      </div>
      <p style="margin:0 0 16px;">Gib den Code einfach bei deiner nächsten Buchung an oder nenne ihn unserem Team vor Ort.</p>
      <p style="margin:24px 0 0;">Beste Grüße<br/>Dein Team von SLT Rental</p>
    </div>
    <p style="font-size:11px;color:#6b7280;margin-top:16px;">SLT Rental · info@slt-rental.de · www.slt-rental.de</p>
  </div>
</body></html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `SLT-Rental <noreply@${resendDomain}>`,
        to: [fb.customer_email],
        subject: "Dein 10 % Cashback-Gutschein von SLT Rental",
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Resend failed [${res.status}]: ${errText}`);
      return json({ error: "E-Mail-Versand fehlgeschlagen", status: res.status, details: errText }, res.status);
    }

    const { error: updError } = await service
      .from("customer_feedback")
      .update({
        voucher_code: voucherCode,
        voucher_sent_at: new Date().toISOString(),
        voucher_sent_to: fb.customer_email,
        status: "done",
        updated_at: new Date().toISOString(),
      })
      .eq("id", feedbackId);
    if (updError) console.error("Update failed:", updError.message);

    return json({ success: true, sent_to: fb.customer_email });
  } catch (e) {
    console.error("send-feedback-voucher error:", e);
    return json({ error: e instanceof Error ? e.message : "Unbekannter Fehler" }, 500);
  }
});
