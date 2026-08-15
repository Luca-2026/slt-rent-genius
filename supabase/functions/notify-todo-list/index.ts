import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const esc = (s: string) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const LOCATION_LABELS: Record<string, string> = {
  krefeld: "Krefeld",
  bonn: "Bonn",
  muelheim: "Mülheim an der Ruhr",
};

const PORTAL_URL = "https://www.slt-rental.de/b2b/aufgaben/";
const BRAND_BLUE = "#00507d";
const BRAND_ORANGE = "#ff8e02";

function fmtMinutes(min: number | null | undefined): string {
  if (!min && min !== 0) return "–";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h} h ${m} min`;
  if (h) return `${h} h`;
  return `${m} min`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendDomain = Deno.env.get("RESEND_DOMAIN") ?? "slt-rental.de";
    if (!resendApiKey) return json({ error: "RESEND_API_KEY not configured" }, 500);

    // Auth: nur eingeloggte Mitarbeiter dürfen Mails auslösen
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Nicht angemeldet" }, 401);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Nicht angemeldet" }, 401);

    const service = createClient(supabaseUrl, serviceRoleKey);
    const { data: isStaff } = await service.rpc("is_staff_member", { _user_id: user.id });
    if (!isStaff) return json({ error: "Keine Berechtigung" }, 403);

    const body = await req.json().catch(() => ({}));
    const listId = typeof body.list_id === "string" ? body.list_id : "";
    const kind = body.kind === "comment" ? "comment" : "assigned";
    const commentBody = typeof body.comment === "string" ? body.comment.slice(0, 2000) : "";
    if (!/^[0-9a-f-]{36}$/i.test(listId)) return json({ error: "list_id ist erforderlich" }, 400);

    const { data: list, error: listError } = await service
      .from("staff_todo_lists")
      .select("*")
      .eq("id", listId)
      .maybeSingle();
    if (listError || !list) return json({ error: "Aufgabenliste nicht gefunden" }, 404);

    const { data: items } = await service
      .from("staff_todo_items")
      .select("*")
      .eq("list_id", listId)
      .order("sort_order", { ascending: true });

    const { data: transfers } = await service
      .from("staff_material_transfers")
      .select("*")
      .eq("todo_list_id", listId)
      .order("tour_date", { ascending: true });

    // Empfänger: zugewiesene Person, sonst Standort-Postfach
    const recipients = new Set<string>();
    if (list.assigned_email) recipients.add(list.assigned_email);
    if (list.assigned_to) {
      const { data: staff } = await service
        .from("staff_profiles")
        .select("email")
        .eq("user_id", list.assigned_to)
        .maybeSingle();
      if (staff?.email) recipients.add(staff.email);
    }
    if (kind === "comment" && list.created_by) {
      const { data: creator } = await service
        .from("staff_profiles")
        .select("email")
        .eq("user_id", list.created_by)
        .maybeSingle();
      if (creator?.email) recipients.add(creator.email);
    }
    if (recipients.size === 0) recipients.add("info@slt-rental.de");

    const locLabel = list.location ? (LOCATION_LABELS[String(list.location).toLowerCase()] ?? list.location) : "–";

    const itemRows = (items ?? [])
      .map(
        (it: any) => `<tr>
          <td style="padding:8px 10px;border-bottom:1px solid #eaeaea;font-size:14px;">${it.is_done ? "&#10003;" : "&#9744;"} ${esc(it.title)}${
            it.note ? `<br><span style="color:#666;font-size:12px;">${esc(it.note)}</span>` : ""
          }</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eaeaea;font-size:13px;white-space:nowrap;">${fmtMinutes(it.estimated_minutes)}</td>
        </tr>`,
      )
      .join("");

    const transferRows = (transfers ?? [])
      .map(
        (t: any) => `<tr>
          <td style="padding:8px 10px;border-bottom:1px solid #eaeaea;font-size:14px;">${esc(t.item_name)} (${t.quantity} Stk.)</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eaeaea;font-size:13px;white-space:nowrap;">${esc(
            LOCATION_LABELS[String(t.from_location).toLowerCase()] ?? t.from_location,
          )} &rarr; ${esc(LOCATION_LABELS[String(t.to_location).toLowerCase()] ?? t.to_location)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eaeaea;font-size:13px;white-space:nowrap;">${
            t.tour_date ? esc(new Date(t.tour_date).toLocaleDateString("de-DE")) : "offen"
          }</td>
        </tr>`,
      )
      .join("");

    const subject =
      kind === "comment"
        ? `Neue Anmerkung zur Aufgabe: ${list.title}`
        : `Neue Aufgabenliste: ${list.title}`;

    const intro =
      kind === "comment"
        ? `<p style="font-size:15px;line-height:1.6;">Es gibt eine neue Anmerkung zur Aufgabenliste <strong>${esc(list.title)}</strong>:</p>
           <div style="background:#f6f8fa;border-left:4px solid ${BRAND_ORANGE};padding:12px 14px;font-size:14px;line-height:1.6;">${esc(commentBody).replace(/\n/g, "<br>")}</div>`
        : `<p style="font-size:15px;line-height:1.6;">Hallo${list.assigned_name ? ` ${esc(list.assigned_name)}` : ""},<br>
           ${esc(list.created_by_name || "Ein Kollege")} hat dir eine neue Aufgabenliste zugewiesen.</p>`;

    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;">
    <div style="background:${BRAND_BLUE};padding:20px 24px;">
      <div style="color:#ffffff;font-size:18px;font-weight:bold;">SLT-Rental &ndash; Aufgaben &amp; Dispo</div>
    </div>
    <div style="padding:24px;">
      ${intro}
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:6px 0;font-size:14px;color:#666;width:150px;">Aufgabe</td><td style="padding:6px 0;font-size:14px;"><strong>${esc(list.title)}</strong></td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#666;">Standort</td><td style="padding:6px 0;font-size:14px;">${esc(locLabel)}</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#666;">Fällig am</td><td style="padding:6px 0;font-size:14px;">${
          list.due_date ? esc(new Date(list.due_date).toLocaleDateString("de-DE")) : "–"
        }</td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#666;">Geschätzter Aufwand</td><td style="padding:6px 0;font-size:14px;">${fmtMinutes(list.estimated_minutes)}</td></tr>
      </table>
      ${list.description ? `<p style="font-size:14px;line-height:1.6;">${esc(list.description).replace(/\n/g, "<br>")}</p>` : ""}
      ${
        itemRows
          ? `<h3 style="font-size:15px;margin:20px 0 8px;">Aufgabenpunkte</h3>
             <table style="width:100%;border-collapse:collapse;">${itemRows}</table>`
          : ""
      }
      ${
        transferRows
          ? `<h3 style="font-size:15px;margin:20px 0 8px;">Materialdisposition</h3>
             <table style="width:100%;border-collapse:collapse;">${transferRows}</table>`
          : ""
      }
      <p style="margin:24px 0;">
        <a href="${PORTAL_URL}" style="background:${BRAND_ORANGE};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:15px;font-weight:bold;display:inline-block;">Im Portal öffnen</a>
      </p>
      <p style="font-size:12px;color:#777;line-height:1.5;">Du kannst die Aufgabe im B2B-Portal abhaken, deinen Zeitaufwand eintragen und Rückfragen direkt dort stellen.</p>
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
        from: `SLT-Rental Aufgaben <aufgaben@${resendDomain}>`,
        to: Array.from(recipients),
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[notify-todo-list] Resend error", res.status, text);
      return json({ error: "E-Mail konnte nicht gesendet werden" }, 502);
    }

    if (kind === "assigned") {
      await service
        .from("staff_todo_lists")
        .update({ email_sent: true, email_sent_at: new Date().toISOString() })
        .eq("id", listId);
    }

    return json({ success: true, recipients: Array.from(recipients) });
  } catch (err) {
    console.error("[notify-todo-list] error", err);
    return json({ error: "Unerwarteter Fehler" }, 500);
  }
});
