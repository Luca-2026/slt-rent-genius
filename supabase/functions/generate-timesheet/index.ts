import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { generateTimesheetPdf, MONTH_NAMES, fmtHours, fmtDecimalHours } from "./pdf.ts";
import { periodFor, periodRangeLabel, isPeriodLocked } from "../_shared/payroll-period.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const esc = (s: string) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const BRAND_BLUE = "#00507d";
const BRAND_ORANGE = "#ff8e02";
const PORTAL_URL = "https://www.slt-rental.de/b2b/aufgaben/?tab=zeiten";
const ADMIN_EMAIL = "info@slt-rental.de";
/** Geschäftsführung / Super-Admins erhalten jeden bestätigten Monatsnachweis. */
const SUPER_ADMIN_EMAILS = ["l.sandhoff@slt-rental.de", "b.noechel@slt-rental.de"];
// Lohnbuchhaltung Steuerbüro – erhält Stundenzettel in CC
const PAYROLL_EMAIL = "y.luetke-wiesmann@altmann-steuerberater.de";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Nicht angemeldet" }, 401);

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Nicht angemeldet" }, 401);

    const service = createClient(supabaseUrl, serviceRoleKey);
    const { data: isStaff } = await service.rpc("is_staff_member", { _user_id: user.id });
    const { data: isAdmin } = await service.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isStaff && !isAdmin) return json({ error: "Keine Berechtigung" }, 403);

    const body = await req.json().catch(() => ({}));
    const year = Number(body.year);
    const month = Number(body.month);
    const action = body.action === "submit" ? "submit" : "preview";
    const targetUserId =
      typeof body.user_id === "string" && /^[0-9a-f-]{36}$/i.test(body.user_id) && isAdmin
        ? body.user_id
        : user.id;

    if (!Number.isInteger(year) || year < 2020 || year > 2100) return json({ error: "Ungültiges Jahr" }, 400);
    if (!Number.isInteger(month) || month < 1 || month > 12) return json({ error: "Ungültiger Monat" }, 400);
    if (action === "submit" && targetUserId !== user.id) {
      return json({ error: "Nur der Mitarbeitende kann den Monat bestätigen" }, 403);
    }

    const { data: staff } = await service
      .from("staff_profiles")
      .select("first_name, last_name, email")
      .eq("user_id", targetUserId)
      .maybeSingle();

    const staffName = staff
      ? `${staff.first_name ?? ""} ${staff.last_name ?? ""}`.trim()
      : (user.user_metadata?.first_name
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name ?? ""}`.trim()
          : (user.email ?? "Mitarbeiter/in"));
    const staffEmail = staff?.email ?? (targetUserId === user.id ? user.email : null);

    // Download nur für bereits bestätigte Monate (PDF entsteht erst mit der Bestätigung)
    const { data: existingSheet } = await service
      .from("staff_timesheets")
      .select("status, submitted_at, period_start, period_end")
      .eq("user_id", targetUserId)
      .eq("year", year)
      .eq("month", month)
      .maybeSingle();

    if (action === "preview" && existingSheet?.status !== "submitted") {
      return json({ error: "Der Monat ist noch nicht bestätigt – erst danach steht das PDF bereit." }, 403);
    }

    // Abrechnungszeitraum 21.–20.; Altnachweise (ohne period_start) bleiben Kalendermonat.
    const period = periodFor(year, month);
    const legacy = !!existingSheet && !existingSheet.period_start;
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const first = legacy
      ? `${year}-${String(month).padStart(2, "0")}-01`
      : (existingSheet?.period_start ?? period.start);
    const last = legacy
      ? `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
      : (existingSheet?.period_end ?? period.end);

    const { data: entries } = await service
      .from("staff_time_entries")
      .select("work_date, start_time, end_time, break_minutes, note, location")
      .eq("user_id", targetUserId)
      .gte("work_date", first)
      .lte("work_date", last)
      .order("work_date", { ascending: true });

    const submittedAt =
      action === "submit" ? new Date().toISOString() : (existingSheet?.submitted_at ?? new Date().toISOString());
    const pdfBytes = await generateTimesheetPdf({
      staffName,
      staffEmail,
      year,
      month,
      entries: (entries ?? []) as any[],
      submittedAt,
      confirmed: true,
      periodStart: legacy ? null : first,
      periodEnd: legacy ? null : last,
    });

    // Gesamtminuten (identische Logik wie im PDF)
    let total = 0;
    for (const e of (entries ?? []) as any[]) {
      if (!e.start_time || !e.end_time) continue;
      const toMin = (t: string) => {
        const [h, m] = t.split(":").map((n: string) => parseInt(n, 10));
        return h * 60 + m;
      };
      const s = toMin(e.start_time);
      let en = toMin(e.end_time);
      if (en < s) en += 1440;
      const net = en - s - Math.max(0, e.break_minutes ?? 0);
      if (net > 0) total += net;
    }

    const fileName = `Arbeitszeitnachweis_${year}-${String(month).padStart(2, "0")}_${staffName.replace(/[^A-Za-z0-9]+/g, "-")}.pdf`;
    const path = `${targetUserId}/${year}-${String(month).padStart(2, "0")}.pdf`;

    if (action === "submit") {
      const { error: upErr } = await service.storage
        .from("timesheets")
        .upload(path, pdfBytes, { contentType: "application/pdf", upsert: true });
      if (upErr) console.error("[generate-timesheet] upload", upErr);

      await service.from("staff_timesheets").upsert(
        {
          user_id: targetUserId,
          staff_name: staffName,
          staff_email: staffEmail,
          year,
          month,
          status: "submitted",
          total_minutes: total,
          period_start: first,
          period_end: last,
          submitted_at: submittedAt,
          pdf_path: path,
        },
        { onConflict: "user_id,year,month" },
      );

      // E-Mail an Mitarbeitende/n + Admin-Postfach
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      const resendDomain = Deno.env.get("RESEND_DOMAIN") ?? "slt-rental.de";
      if (resendApiKey) {
        const primary = (staffEmail || ADMIN_EMAIL) as string;
        const ccList = Array.from(
          new Set(
            ([ADMIN_EMAIL, ...SUPER_ADMIN_EMAILS, PAYROLL_EMAIL].filter(Boolean) as string[])
              .filter((e) => e.toLowerCase() !== primary.toLowerCase()),
          ),
        );
        const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;">
    <div style="background:${BRAND_BLUE};padding:20px 24px;color:#ffffff;font-size:18px;font-weight:bold;">SLT-Rental &ndash; Arbeitszeitnachweis</div>
    <div style="padding:24px;">
      <p style="font-size:15px;line-height:1.6;">Hallo ${esc(staffName)},<br>
      dein Arbeitszeitnachweis für den Abrechnungszeitraum <strong>${periodRangeLabel({ start: first, end: last })}</strong> (Lohnabrechnung ${MONTH_NAMES[month - 1]} ${year}) wurde bestätigt und ist als PDF angehängt.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:6px 0;font-size:14px;color:#666;width:200px;">Abrechnungszeitraum</td><td style="padding:6px 0;font-size:14px;"><strong>${periodRangeLabel({ start: first, end: last })}</strong></td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#666;">Gesamte Arbeitszeit</td><td style="padding:6px 0;font-size:14px;"><strong>${fmtHours(total)}</strong> (${fmtDecimalHours(total)} Std.)</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#666;">Bestätigt am</td><td style="padding:6px 0;font-size:14px;">${new Date(submittedAt).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })} Uhr</td></tr>
      </table>
      <p style="margin:24px 0;">
        <a href="${PORTAL_URL}" style="background:${BRAND_ORANGE};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block;">Im Portal öffnen</a>
      </p>
      <p style="font-size:12px;color:#777;line-height:1.5;">Das PDF steht dir jederzeit im B2B-Portal unter „Interne Verwaltung &rarr; Zeiterfassung“ zum Download bereit.</p>
    </div>
    <div style="background:#f4f5f7;padding:16px 24px;font-size:11px;color:#777;">
      SLT Technology Group GmbH &amp; Co. KG &middot; Anrather Straße 291 &middot; 47807 Krefeld
    </div>
  </div>
</body></html>`;

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: `SLT-Rental Zeiterfassung <aufgaben@${resendDomain}>`,
            to: [primary],
            cc: ccList,
            subject: `Arbeitszeitnachweis ${periodRangeLabel({ start: first, end: last })} – ${staffName}`,
            html,
            attachments: [{ filename: fileName, content: encodeBase64(pdfBytes) }],
          }),
        });
        if (!res.ok) console.error("[generate-timesheet] resend", res.status, await res.text());
      }
    }

    return json({
      success: true,
      file_name: fileName,
      path: action === "submit" ? path : null,
      total_minutes: total,
      pdf_base64: encodeBase64(pdfBytes),
    });
  } catch (err) {
    console.error("[generate-timesheet] error", err);
    return json({ error: "Unerwarteter Fehler bei der PDF-Erstellung" }, 500);
  }
});
