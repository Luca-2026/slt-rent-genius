import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const LOCATION_EMAILS: Record<string, string> = {
  krefeld: "krefeld@slt-rental.de",
  bonn: "bonn@slt-rental.de",
  muelheim: "muelheim@slt-rental.de",
};

const LOCATION_LABELS: Record<string, string> = {
  krefeld: "Krefeld",
  bonn: "Bonn",
  muelheim: "Mülheim an der Ruhr",
};

const QUESTION_LABELS: Record<string, string> = {
  q1_buchung: "Buchung / Anfrage",
  q2_beratung: "Beratung & Erreichbarkeit",
  q3_preis: "Preise & Konditionen",
  q4_abholung: "Abholung / Lieferung",
  q5_zustand: "Zustand des Mietartikels",
  q6_einweisung: "Einweisung",
  q7_service: "Service während der Miete",
  q8_rueckgabe: "Rückgabe",
  q9_abrechnung: "Abrechnung",
  q10_gesamt: "Gesamteindruck",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendDomain = Deno.env.get("RESEND_DOMAIN") ?? "slt-rental.de";
    if (!resendApiKey) return json({ error: "RESEND_API_KEY not configured" }, 500);

    const body = await req.json().catch(() => ({}));
    const feedbackId = typeof body.feedback_id === "string" ? body.feedback_id : "";
    if (!/^[0-9a-f-]{36}$/i.test(feedbackId)) return json({ error: "feedback_id ist erforderlich" }, 400);

    const service = createClient(supabaseUrl, serviceRoleKey);
    const { data: fb, error } = await service
      .from("customer_feedback")
      .select("*")
      .eq("id", feedbackId)
      .maybeSingle();
    if (error || !fb) return json({ error: "Feedback nicht gefunden" }, 404);

    const locKey = (fb.location ?? "").toLowerCase();
    const to = LOCATION_EMAILS[locKey] ?? "info@slt-rental.de";
    const locLabel = LOCATION_LABELS[locKey] ?? (fb.location || "unbekannt");

    const ratings = (fb.ratings ?? {}) as Record<string, number>;
    const answers = (fb.answers ?? {}) as Record<string, string>;

    const rows = Object.keys(QUESTION_LABELS)
      .filter((k) => ratings[k] != null || answers[k])
      .map(
        (k) => `<tr>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:13px;">${esc(QUESTION_LABELS[k])}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:13px;white-space:nowrap;">${
            ratings[k] != null ? `${ratings[k]}/5 ★` : "–"
          }</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:13px;">${esc(answers[k] ?? "")}</td>
        </tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html><html lang="de"><body style="margin:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
  <div style="max-width:680px;margin:0 auto;padding:24px;">
    <div style="background:#00507d;color:#ffffff;padding:18px 22px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;font-size:19px;">Neues Kundenfeedback – ${esc(locLabel)}</h1>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:22px;">
      <p style="margin:0 0 14px;font-size:14px;">
        <strong>Buchungsnummer:</strong> ${esc(fb.order_ref ?? "–")}<br/>
        <strong>Gemietet:</strong> ${esc(fb.rented_items ?? "–")}<br/>
        <strong>Name:</strong> ${esc(fb.customer_name ?? "–")}<br/>
        <strong>E-Mail:</strong> ${esc(fb.customer_email ?? "–")}<br/>
        <strong>Kundentyp:</strong> ${esc(fb.customer_type ?? "–")}<br/>
        <strong>Ø Bewertung:</strong> ${fb.avg_rating != null ? `${fb.avg_rating} / 5` : "–"}<br/>
        <strong>Empfehlung (NPS):</strong> ${fb.recommend_score != null ? `${fb.recommend_score}/10` : "–"}<br/>
        <strong>Google-Bewertung abgegeben:</strong> ${fb.google_review_confirmed ? "ja" : "nein"}
      </p>
      ${rows ? `<table style="width:100%;border-collapse:collapse;margin-top:8px;">${rows}</table>` : ""}
      ${
        answers.gesamt_kommentar
          ? `<div style="margin-top:16px;background:#f6f7f9;border-radius:6px;padding:12px;">
               <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">Verbesserungsvorschlag</div>
               <div style="font-size:14px;white-space:pre-wrap;">${esc(answers.gesamt_kommentar)}</div>
             </div>`
          : ""
      }
      <p style="margin:20px 0 0;font-size:13px;color:#6b7280;">
        Auswertung und Gutscheinversand im B2B-Portal unter Admin-Dashboard → Feedback.
      </p>
    </div>
  </div>
</body></html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `SLT-Rental Feedback <noreply@${resendDomain}>`,
        to: [to],
        reply_to: fb.customer_email ?? undefined,
        subject: `Neues Kundenfeedback ${locLabel} – Buchung ${fb.order_ref ?? "?"}`,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Resend failed [${res.status}]: ${errText}`);
      return json({ error: "E-Mail-Versand fehlgeschlagen", status: res.status, details: errText }, res.status);
    }

    return json({ success: true, sent_to: to });
  } catch (e) {
    console.error("notify-feedback error:", e);
    return json({ error: e instanceof Error ? e.message : "Unbekannter Fehler" }, 500);
  }
});
