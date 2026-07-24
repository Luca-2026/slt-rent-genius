import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPER_ADMINS = ["l.sandhoff@slt-rental.de", "b.noechel@slt-rental.de"];

const ENTITY_LABELS: Record<string, string> = {
  auth: "Anmeldung",
  b2b_managed_products: "Produkt (CMS)",
  b2b_profiles: "B2B-Profil",
  b2b_invoices: "Rechnung",
  b2b_offers: "Angebot",
  b2b_delivery_notes: "Lieferschein",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: rows, error } = await supabase
      .from("admin_audit_log")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const total = rows?.length ?? 0;
    const byActor: Record<string, number> = {};
    const byEntity: Record<string, number> = {};
    for (const r of rows ?? []) {
      const a = r.actor_email ?? "System";
      byActor[a] = (byActor[a] ?? 0) + 1;
      byEntity[r.entity_type] = (byEntity[r.entity_type] ?? 0) + 1;
    }

    const rowsHtml = (rows ?? []).slice(0, 100).map((r: any) => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;color:#666;white-space:nowrap;">${new Date(r.created_at).toLocaleString("de-DE")}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:13px;">${r.actor_email ?? "System"}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:13px;"><strong>${r.action}</strong></td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:13px;">${ENTITY_LABELS[r.entity_type] ?? r.entity_type}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:13px;">${r.entity_label ?? r.entity_id ?? "—"}</td>
      </tr>
    `).join("");

    const statsHtml = `
      <p style="margin:0 0 8px;font-size:14px;color:#393d46;"><strong>Gesamt:</strong> ${total} Ereignisse in den letzten 24h</p>
      <p style="margin:0 0 4px;font-size:13px;color:#595959;"><strong>Nach Admin:</strong> ${Object.entries(byActor).map(([k, v]) => `${k} (${v})`).join(", ") || "—"}</p>
      <p style="margin:0 0 16px;font-size:13px;color:#595959;"><strong>Nach Bereich:</strong> ${Object.entries(byEntity).map(([k, v]) => `${ENTITY_LABELS[k] ?? k} (${v})`).join(", ") || "—"}</p>
    `;

    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;font-family:Montserrat,Arial,sans-serif;background:#fff;">
      <div style="max-width:800px;margin:0 auto;padding:24px;">
        <div style="border-bottom:3px solid #ff8e02;padding-bottom:12px;margin-bottom:20px;">
          <h1 style="color:#00507d;font-size:22px;margin:0;">SLT Rental – Admin Audit Report</h1>
          <p style="color:#666;font-size:12px;margin:4px 0 0;">Zeitraum: letzte 24 Stunden · Stand ${new Date().toLocaleString("de-DE")}</p>
        </div>
        ${statsHtml}
        ${total > 0 ? `
          <table style="width:100%;border-collapse:collapse;border:1px solid #eee;">
            <thead><tr style="background:#f5f5f5;">
              <th style="padding:8px;text-align:left;font-size:12px;">Zeit</th>
              <th style="padding:8px;text-align:left;font-size:12px;">Admin</th>
              <th style="padding:8px;text-align:left;font-size:12px;">Aktion</th>
              <th style="padding:8px;text-align:left;font-size:12px;">Bereich</th>
              <th style="padding:8px;text-align:left;font-size:12px;">Objekt</th>
            </tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          ${total > 100 ? `<p style="color:#666;font-size:12px;margin-top:8px;">… ${total - 100} weitere Einträge im Admin-Dashboard → Audit-Log.</p>` : ""}
        ` : `<p style="color:#666;">Keine Aktivitäten in den letzten 24 Stunden.</p>`}
        <p style="margin-top:24px;font-size:12px;color:#999;">Vollständige Historie: https://www.slt-rental.de/b2b/admin (Tab „Audit-Log")</p>
      </div>
    </body></html>`;

    const resendKey = Deno.env.get("RESEND_API_KEY")!;
    const domain = Deno.env.get("RESEND_DOMAIN") || "slt-rental.de";
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `SLT-Rental Monitoring <noreply@${domain}>`,
        to: SUPER_ADMINS,
        subject: `Admin Audit Report – ${total} Ereignisse (24h)`,
        html,
      }),
    });

    if (!emailRes.ok) {
      const t = await emailRes.text();
      console.error("Resend error:", t);
      return new Response(JSON.stringify({ error: t }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, total }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
