import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { berlinToday, currentPeriod, periodRangeLabel, REMINDER_DAY } from "../_shared/payroll-period.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const esc = (s: string) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const BRAND_BLUE = "#00507d";
const BRAND_ORANGE = "#ff8e02";
const PORTAL_URL = "https://www.slt-rental.de/b2b/aufgaben/?tab=zeiten";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const service = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const force = body?.force === true; // manueller Test-Trigger
    const dryRun = body?.dry_run === true;

    const today = berlinToday();
    if (!force && today.day !== REMINDER_DAY) {
      return json({ skipped: true, reason: `Erinnerung nur am ${REMINDER_DAY}. eines Monats`, today });
    }

    const period = currentPeriod();

    const { data: staff, error: staffErr } = await service
      .from("staff_profiles")
      .select("user_id, first_name, last_name, email")
      .eq("is_active", true);
    if (staffErr) throw staffErr;

    const { data: submitted } = await service
      .from("staff_timesheets")
      .select("user_id")
      .eq("year", period.year)
      .eq("month", period.month)
      .eq("status", "submitted");
    const submittedIds = new Set((submitted ?? []).map((s) => s.user_id));

    const { data: alreadySent } = await service
      .from("staff_timesheet_reminders")
      .select("user_id")
      .eq("period_end", period.end)
      .eq("channel", "email");
    const sentIds = new Set((alreadySent ?? []).map((r) => r.user_id));

    const targets = (staff ?? []).filter(
      (m) => m.email && !submittedIds.has(m.user_id) && (force || !sentIds.has(m.user_id)),
    );

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendDomain = Deno.env.get("RESEND_DOMAIN") ?? "slt-rental.de";
    const results: { email: string; ok: boolean; error?: string }[] = [];

    for (const m of targets) {
      const name = `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || "Kollege/Kollegin";

      // Aktueller Stand des Zeitraums (nur zur Info in der Mail)
      const { data: entries } = await service
        .from("staff_time_entries")
        .select("work_date, start_time, end_time, break_minutes")
        .eq("user_id", m.user_id)
        .gte("work_date", period.start)
        .lte("work_date", period.end);
      const daysFilled = (entries ?? []).filter((e) => e.start_time && e.end_time).length;

      if (dryRun) {
        results.push({ email: m.email, ok: true });
        continue;
      }

      if (!resendApiKey) {
        results.push({ email: m.email, ok: false, error: "RESEND_API_KEY fehlt" });
        continue;
      }

      const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;">
    <div style="background:${BRAND_BLUE};padding:20px 24px;color:#ffffff;font-size:18px;font-weight:bold;">SLT-Rental &ndash; Stundenzettel f&auml;llig</div>
    <div style="padding:24px;">
      <p style="font-size:15px;line-height:1.6;">Hallo ${esc(name)},<br>
      bitte trage deine Arbeitszeiten f&uuml;r den Abrechnungszeitraum <strong>${periodRangeLabel(period)}</strong> ein und best&auml;tige den Zeitraum im Portal.</p>
      <p style="font-size:15px;line-height:1.6;">Die Lohnabrechnung wird am <strong>20.</strong> erstellt. <strong>Danach ist der Zeitraum gesperrt</strong> und kann von dir nicht mehr ge&auml;ndert werden.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:6px 0;font-size:14px;color:#666;width:220px;">Abrechnungszeitraum</td><td style="padding:6px 0;font-size:14px;"><strong>${periodRangeLabel(period)}</strong></td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#666;">Bereits erfasste Tage</td><td style="padding:6px 0;font-size:14px;">${daysFilled}</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#666;">Status</td><td style="padding:6px 0;font-size:14px;">noch nicht best&auml;tigt</td></tr>
      </table>
      <p style="margin:24px 0;">
        <a href="${PORTAL_URL}" style="background:${BRAND_ORANGE};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block;">Stunden jetzt eintragen</a>
      </p>
      <p style="font-size:12px;color:#777;line-height:1.5;">Du findest die Zeiterfassung im B2B-Portal unter &bdquo;Interne Verwaltung &rarr; Zeiterfassung&ldquo;.</p>
    </div>
    <div style="background:#f4f5f7;padding:16px 24px;font-size:11px;color:#777;">
      SLT Technology Group GmbH &amp; Co. KG &middot; Anrather Stra&szlig;e 291 &middot; 47807 Krefeld
    </div>
  </div>
</body></html>`;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `SLT-Rental Zeiterfassung <aufgaben@${resendDomain}>`,
          to: [m.email],
          subject: `Erinnerung: Stundenzettel ${periodRangeLabel(period)} bis morgen einreichen`,
          html,
        }),
      });

      if (res.ok) {
        results.push({ email: m.email, ok: true });
        await service
          .from("staff_timesheet_reminders")
          .upsert(
            { user_id: m.user_id, period_end: period.end, channel: "email", sent_at: new Date().toISOString() },
            { onConflict: "user_id,period_end,channel" },
          );
      } else {
        const txt = await res.text();
        console.error("[timesheet-reminder] resend", res.status, txt);
        results.push({ email: m.email, ok: false, error: txt.slice(0, 200) });
      }
    }

    return json({
      success: true,
      period: { start: period.start, end: period.end },
      checked: (staff ?? []).length,
      notified: results.filter((r) => r.ok).length,
      results,
    });
  } catch (err) {
    console.error("[timesheet-reminder] error", err);
    return json({ error: "Unerwarteter Fehler beim Versand der Erinnerungen" }, 500);
  }
});
