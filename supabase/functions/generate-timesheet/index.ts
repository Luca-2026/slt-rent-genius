import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { generateTimesheetPdf, MONTH_NAMES, fmtHours, fmtDecimalHours } from "./pdf.ts";
import { periodFor, periodRangeLabel } from "../_shared/payroll-period.ts";

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
/** Geschäftsführung / Super-Admins: Freigabeinstanz für alle Stundenzettel. */
const SUPER_ADMIN_EMAILS = ["l.sandhoff@slt-rental.de", "b.noechel@slt-rental.de"];
// Lohnbuchhaltung Steuerbüro Altmann – erhält den Stundenzettel erst nach Freigabe
const PAYROLL_EMAIL = "y.luetke-wiesmann@altmann-steuerberater.de";
const PAYROLL_NAME = "Jannik Lütke-Wiesmann";

const shell = (title: string, inner: string) => `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;">
    <div style="background:${BRAND_BLUE};padding:20px 24px;color:#ffffff;font-size:18px;font-weight:bold;">SLT-Rental &ndash; ${title}</div>
    <div style="padding:24px;">${inner}</div>
    <div style="background:#f4f5f7;padding:16px 24px;font-size:11px;color:#777;">
      SLT Technology Group GmbH &amp; Co. KG &middot; Anrather Straße 291 &middot; 47807 Krefeld
    </div>
  </div>
</body></html>`;

const summaryRows = (rangeLabel: string, total: number, dateLabel: string, dateValue: string) => `
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:6px 0;font-size:14px;color:#666;width:200px;">Abrechnungszeitraum</td><td style="padding:6px 0;font-size:14px;"><strong>${rangeLabel}</strong></td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#666;">Gesamte Arbeitszeit</td><td style="padding:6px 0;font-size:14px;"><strong>${fmtHours(total)}</strong> (${fmtDecimalHours(total)} Std.)</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#666;">${dateLabel}</td><td style="padding:6px 0;font-size:14px;">${dateValue}</td></tr>
      </table>`;

const ctaButton = `<p style="margin:24px 0;">
        <a href="${PORTAL_URL}" style="background:${BRAND_ORANGE};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block;">Im Portal öffnen</a>
      </p>`;

async function sendMail(payload: Record<string, unknown>, tag: string) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const resendDomain = Deno.env.get("RESEND_DOMAIN") ?? "slt-rental.de";
  if (!resendApiKey) {
    console.warn(`[generate-timesheet] ${tag}: RESEND_API_KEY fehlt`);
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: `SLT-Rental Zeiterfassung <aufgaben@${resendDomain}>`, ...payload }),
  });
  if (!res.ok) {
    console.error(`[generate-timesheet] ${tag} resend`, res.status, await res.text());
    return false;
  }
  return true;
}

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
    const { data: isSuperAdmin } = await service.rpc("is_super_admin", { _user_id: user.id });
    if (!isStaff && !isAdmin) return json({ error: "Keine Berechtigung" }, 403);

    const body = await req.json().catch(() => ({}));
    const year = Number(body.year);
    const month = Number(body.month);
    const action: "preview" | "submit" | "approve" =
      body.action === "submit" ? "submit" : body.action === "approve" ? "approve" : "preview";
    const targetUserId =
      typeof body.user_id === "string" && /^[0-9a-f-]{36}$/i.test(body.user_id) && isAdmin
        ? body.user_id
        : user.id;

    if (!Number.isInteger(year) || year < 2020 || year > 2100) return json({ error: "Ungültiges Jahr" }, 400);
    if (!Number.isInteger(month) || month < 1 || month > 12) return json({ error: "Ungültiger Monat" }, 400);
    if (action === "submit" && targetUserId !== user.id) {
      return json({ error: "Nur der Mitarbeitende kann den Monat bestätigen" }, 403);
    }
    if (action === "approve" && !isSuperAdmin) {
      return json({ error: "Nur die Geschäftsführung darf Stundenzettel freigeben" }, 403);
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
      .select("status, submitted_at, period_start, period_end, approved_at, payroll_sent_at, total_minutes")
      .eq("user_id", targetUserId)
      .eq("year", year)
      .eq("month", month)
      .maybeSingle();

    const isConfirmed = existingSheet?.status === "submitted" || existingSheet?.status === "approved";
    if (action === "preview" && !isConfirmed) {
      return json({ error: "Der Monat ist noch nicht bestätigt – erst danach steht das PDF bereit." }, 403);
    }
    if (action === "approve") {
      if (!existingSheet) return json({ error: "Kein Stundenzettel für diesen Zeitraum vorhanden" }, 404);
      if (existingSheet.status !== "submitted") {
        return json({ error: "Dieser Stundenzettel wartet nicht auf Freigabe (bereits freigegeben?)" }, 409);
      }
    }
    if (action === "submit" && existingSheet && isConfirmed) {
      return json({ error: "Dieser Zeitraum wurde bereits bestätigt" }, 409);
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
    const rangeLabel = periodRangeLabel({ start: first, end: last });

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
    const attachments = [{ filename: fileName, content: encodeBase64(pdfBytes) }];

    // ---------- Schritt 1: Mitarbeitende/r bestätigt → Freigabe durch Geschäftsführung ----------
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

      const submittedLabel = `${new Date(submittedAt).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })} Uhr`;

      // a) Freigabe-Anforderung an die Geschäftsführung
      await sendMail(
        {
          to: SUPER_ADMIN_EMAILS,
          subject: `Freigabe erforderlich: Arbeitszeitnachweis ${rangeLabel} – ${staffName}`,
          html: shell(
            "Stundenzettel zur Freigabe",
            `<p style="font-size:15px;line-height:1.6;"><strong>${esc(staffName)}</strong> hat den Arbeitszeitnachweis für den Abrechnungszeitraum <strong>${rangeLabel}</strong> (Lohnabrechnung ${MONTH_NAMES[month - 1]} ${year}) bestätigt und zur Freigabe eingereicht.</p>
      ${summaryRows(rangeLabel, total, "Eingereicht am", submittedLabel)}
      <p style="font-size:15px;line-height:1.6;">Bitte prüfe den angehängten Nachweis und gib ihn im Portal frei. Erst danach geht der Stundenzettel an das Steuerbüro (${esc(PAYROLL_NAME)}).</p>
      ${ctaButton}`,
          ),
          attachments,
        },
        "submit/approval-request",
      );

      // b) Eingangsbestätigung an die Mitarbeitenden
      if (staffEmail) {
        await sendMail(
          {
            to: [staffEmail],
            subject: `Arbeitszeitnachweis ${rangeLabel} eingereicht – ${staffName}`,
            html: shell(
              "Arbeitszeitnachweis eingereicht",
              `<p style="font-size:15px;line-height:1.6;">Hallo ${esc(staffName)},<br>
      dein Arbeitszeitnachweis für den Abrechnungszeitraum <strong>${rangeLabel}</strong> wurde bestätigt und an die Geschäftsführung zur Freigabe gesendet. Nach der Freigabe geht er automatisch an das Steuerbüro.</p>
      ${summaryRows(rangeLabel, total, "Eingereicht am", submittedLabel)}
      ${ctaButton}
      <p style="font-size:12px;color:#777;line-height:1.5;">Das PDF steht dir jederzeit im Portal unter „Interne Verwaltung &rarr; Zeiterfassung“ zum Download bereit.</p>`,
            ),
            attachments,
          },
          "submit/staff-copy",
        );
      }

      return json({
        success: true,
        status: "submitted",
        file_name: fileName,
        path,
        total_minutes: total,
        pdf_base64: encodeBase64(pdfBytes),
      });
    }

    // ---------- Schritt 2: Geschäftsführung gibt frei → Versand an das Steuerbüro ----------
    if (action === "approve") {
      const approvedAt = new Date().toISOString();
      const approverName =
        (user.user_metadata?.first_name
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name ?? ""}`.trim()
          : null) ?? user.email ?? "Geschäftsführung";
      const approvedLabel = `${new Date(approvedAt).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })} Uhr`;

      const cc = Array.from(
        new Set([...SUPER_ADMIN_EMAILS, ...(staffEmail ? [staffEmail] : [])].filter(
          (e) => e.toLowerCase() !== PAYROLL_EMAIL.toLowerCase(),
        )),
      );

      const sent = await sendMail(
        {
          to: [PAYROLL_EMAIL],
          cc,
          subject: `Arbeitszeitnachweis ${rangeLabel} – ${staffName} (freigegeben)`,
          html: shell(
            "Arbeitszeitnachweis (freigegeben)",
            `<p style="font-size:15px;line-height:1.6;">Hallo ${esc(PAYROLL_NAME)},<br>
      anbei der von der Geschäftsführung freigegebene Arbeitszeitnachweis für <strong>${esc(staffName)}</strong>, Abrechnungszeitraum <strong>${rangeLabel}</strong> (Lohnabrechnung ${MONTH_NAMES[month - 1]} ${year}).</p>
      ${summaryRows(rangeLabel, total, "Freigegeben am", `${approvedLabel} durch ${esc(approverName)}`)}
      <p style="font-size:12px;color:#777;line-height:1.5;">Diese E-Mail wurde automatisch aus dem SLT-Rental Portal versendet.</p>`,
          ),
          attachments,
        },
        "approve/payroll",
      );

      if (!sent) return json({ error: "E-Mail an das Steuerbüro konnte nicht versendet werden" }, 502);

      const { error: updErr } = await service
        .from("staff_timesheets")
        .update({
          status: "approved",
          approved_at: approvedAt,
          approved_by: user.id,
          approved_by_name: approverName,
          payroll_sent_at: approvedAt,
          payroll_sent_to: PAYROLL_EMAIL,
        })
        .eq("user_id", targetUserId)
        .eq("year", year)
        .eq("month", month);
      if (updErr) console.error("[generate-timesheet] approve update", updErr);

      // Info an die Mitarbeitenden
      if (staffEmail) {
        await sendMail(
          {
            to: [staffEmail],
            subject: `Arbeitszeitnachweis ${rangeLabel} freigegeben`,
            html: shell(
              "Arbeitszeitnachweis freigegeben",
              `<p style="font-size:15px;line-height:1.6;">Hallo ${esc(staffName)},<br>
      dein Arbeitszeitnachweis für <strong>${rangeLabel}</strong> wurde von der Geschäftsführung freigegeben und an das Steuerbüro zur Lohnabrechnung übermittelt.</p>
      ${summaryRows(rangeLabel, total, "Freigegeben am", `${approvedLabel} durch ${esc(approverName)}`)}
      ${ctaButton}`,
            ),
          },
          "approve/staff-info",
        );
      }

      return json({
        success: true,
        status: "approved",
        approved_at: approvedAt,
        payroll_sent_to: PAYROLL_EMAIL,
        file_name: fileName,
        total_minutes: total,
      });
    }

    // ---------- Preview / Download ----------
    return json({
      success: true,
      status: existingSheet?.status ?? "submitted",
      file_name: fileName,
      path: null,
      total_minutes: total,
      pdf_base64: encodeBase64(pdfBytes),
    });
  } catch (err) {
    console.error("[generate-timesheet] error", err);
    return json({ error: "Unerwarteter Fehler bei der PDF-Erstellung" }, 500);
  }
});
