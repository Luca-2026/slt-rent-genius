import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPER_ADMINS = ["l.sandhoff@slt-rental.de", "b.noechel@slt-rental.de"];
const TIME_ZONE = "Europe/Berlin";
const dateTimeFormatter = new Intl.DateTimeFormat("de-DE", {
  timeZone: TIME_ZONE,
  dateStyle: "short",
  timeStyle: "medium",
});

const ENTITY_LABELS: Record<string, string> = {
  auth: "Anmeldung",
  b2b_managed_products: "Produkt (CMS)",
  b2b_profiles: "B2B-Profil",
  b2b_invoices: "Rechnung",
  b2b_offers: "Angebot",
  b2b_delivery_notes: "Lieferschein",
};

const formatGermanTime = (value: string | Date) => dateTimeFormatter.format(new Date(value));

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

    // Group by section for a clearly consolidated report
    const SECTIONS: { key: string; title: string; entities: string[] }[] = [
      { key: "auth", title: "Anmeldungen", entities: ["auth"] },
      { key: "cms", title: "CMS – Produkte", entities: ["b2b_managed_products"] },
      {
        key: "b2b",
        title: "B2B – Profile, Angebote, Rechnungen, Lieferscheine",
        entities: ["b2b_profiles", "b2b_offers", "b2b_invoices", "b2b_delivery_notes"],
      },
    ];
    const knownEntities = new Set(SECTIONS.flatMap((s) => s.entities));

    const renderRows = (subset: any[]) =>
      subset.slice(0, 100).map((r: any) => `
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;color:#666;white-space:nowrap;">${formatGermanTime(r.created_at)}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:13px;">${r.actor_email ?? "System"}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:13px;"><strong>${r.action}</strong></td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:13px;">${ENTITY_LABELS[r.entity_type] ?? r.entity_type}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:13px;">${r.entity_label ?? r.entity_id ?? "—"}</td>
        </tr>
      `).join("");

    const sectionsHtml = SECTIONS.map((s) => {
      let subset = (rows ?? []).filter((r: any) => s.entities.includes(r.entity_type));
      if (s.key === "b2b") {
        const extra = (rows ?? []).filter((r: any) => !knownEntities.has(r.entity_type));
        subset = [...subset, ...extra];
      }
      if (subset.length === 0) {
        return `<h2 style="color:#00507d;font-size:16px;margin:24px 0 8px;border-bottom:2px solid #ff8e02;padding-bottom:4px;">${s.title} <span style="color:#999;font-weight:normal;font-size:13px;">(0)</span></h2>
          <p style="color:#999;font-size:13px;margin:0 0 8px;">Keine Ereignisse.</p>`;
      }
      return `
        <h2 style="color:#00507d;font-size:16px;margin:24px 0 8px;border-bottom:2px solid #ff8e02;padding-bottom:4px;">${s.title} <span style="color:#666;font-weight:normal;font-size:13px;">(${subset.length})</span></h2>
        <table style="width:100%;border-collapse:collapse;border:1px solid #eee;">
          <thead><tr style="background:#f5f5f5;">
            <th style="padding:8px;text-align:left;font-size:12px;">Zeit (Deutschland)</th>
            <th style="padding:8px;text-align:left;font-size:12px;">Nutzer</th>
            <th style="padding:8px;text-align:left;font-size:12px;">Aktion</th>
            <th style="padding:8px;text-align:left;font-size:12px;">Bereich</th>
            <th style="padding:8px;text-align:left;font-size:12px;">Objekt</th>
          </tr></thead>
          <tbody>${renderRows(subset)}</tbody>
        </table>
        ${subset.length > 100 ? `<p style="color:#666;font-size:12px;margin-top:8px;">… ${subset.length - 100} weitere Einträge im Admin-Dashboard → Audit-Log.</p>` : ""}
      `;
    }).join("");

    const actorRows = Object.entries(byActor)
      .sort((a, b) => b[1] - a[1])
      .map(([a, n]) => `<li style="font-size:13px;color:#333;">${a}: <strong>${n}</strong></li>`)
      .join("");
    const entityRows = Object.entries(byEntity)
      .sort((a, b) => b[1] - a[1])
      .map(([e, n]) => `<li style="font-size:13px;color:#333;">${ENTITY_LABELS[e] ?? e}: <strong>${n}</strong></li>`)
      .join("");
    const statsHtml = `
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;">
        <div style="flex:1;min-width:200px;background:#f5f9fc;border-left:3px solid #00507d;padding:12px 16px;">
          <div style="color:#00507d;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Gesamt</div>
          <div style="font-size:24px;font-weight:bold;color:#00507d;">${total}</div>
        </div>
        <div style="flex:2;min-width:240px;background:#fafafa;padding:12px 16px;">
          <div style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Nach Nutzer</div>
          <ul style="margin:0;padding-left:18px;">${actorRows || '<li style="color:#999;font-size:13px;">—</li>'}</ul>
        </div>
        <div style="flex:2;min-width:240px;background:#fafafa;padding:12px 16px;">
          <div style="color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Nach Bereich</div>
          <ul style="margin:0;padding-left:18px;">${entityRows || '<li style="color:#999;font-size:13px;">—</li>'}</ul>
        </div>
      </div>
    `;

    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;font-family:Montserrat,Arial,sans-serif;background:#fff;">
      <div style="max-width:800px;margin:0 auto;padding:24px;">
        <div style="border-bottom:3px solid #ff8e02;padding-bottom:12px;margin-bottom:20px;">
          <h1 style="color:#00507d;font-size:22px;margin:0;">SLT Rental – Täglicher Admin-Report</h1>
          <p style="color:#666;font-size:12px;margin:4px 0 0;">Konsolidiert alle Bereiche · Zeitraum: letzte 24 Stunden · Stand ${formatGermanTime(new Date())} deutscher Zeit</p>
        </div>
        ${statsHtml}
        ${total > 0 ? sectionsHtml : `<p style="color:#666;">Keine Aktivitäten in den letzten 24 Stunden.</p>`}
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
        subject: `SLT Admin-Report (24h) – ${total} Ereignisse · Anmeldungen · CMS · B2B`,
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
