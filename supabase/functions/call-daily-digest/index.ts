/**
 * Tageszusammenfassung der Telefonate je Standort-Postfach (20 Uhr Berlin).
 * Vollständig: jeder Anruf des Tages erscheint, sortiert nach Priorität.
 * Die KI schreibt nur einen kurzen Tagesüberblick oben; fällt sie aus, geht die Mail trotzdem raus.
 * Zuordnung: Assistent Bonn → bonn@, Assistent Krefeld (Krefeld + Mülheim) → krefeld@.
 * Testlauf (nur Mitarbeiter): POST { "test_to": "...", "date": "YYYY-MM-DD" } – keine Protokollierung.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { LOCATION_CONTACTS } from "../_shared/inquiry-offer-math.ts";
import { CALL_MODEL, readSse } from "../_shared/phoneCallAnalysis.ts";
import { PRIORITY_LABEL, priorityRank, type CallPriority } from "../_shared/callPriority.ts";

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const berlin = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleString("de-DE", { timeZone: "Europe/Berlin", ...o });
const berlinDay = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
const INTENT: Record<string, string> = {
  rental_inquiry: "Mietanfrage", offer_change: "Angebotsänderung", complaint_damage: "Reklamation/Schaden",
  callback: "Rückruf", info: "Information", other: "Sonstiges",
};
const STATUS: Record<string, string> = { open: "Offen", in_progress: "In Bearbeitung", done: "Erledigt" };
const PRIO_COLOR: Record<string, string> = { sofort: "#b91c1c", heute: "#c2410c", woche: "#00507d", info: "#6b7280" };
const LOC: Record<string, string> = { krefeld: "Krefeld", bonn: "Bonn", muelheim: "Mülheim an der Ruhr" };

const mailboxOf = (c: any): "krefeld" | "bonn" =>
  c.assistant === "bonn" || c.assistant === "krefeld" ? c.assistant : c.location === "bonn" ? "bonn" : "krefeld";

async function overview(calls: any[], mailbox: string): Promise<string | null> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key || !calls.length) return null;
  const lines = calls.map((c, i) => `${i + 1}. [${c.priority ?? "?"}] ${INTENT[c.intent] ?? "?"} – ${c.company_name || c.customer_name || "unbekannt"}: ${c.summary || c.provider_summary || "keine Zusammenfassung"}${c.open_points?.length ? ` | Offen: ${c.open_points.join("; ")}` : ""} | Status: ${STATUS[c.status]}`).join("\n");
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: CALL_MODEL, stream: true, store: false,
        reasoning: { effort: "low", summary: "auto" }, include: ["reasoning.encrypted_content"],
        instructions: "Du schreibst für das Team eines Baumaschinenverleihs (Standort " + mailbox + ") einen Tagesüberblick der Telefonate. Deutsch, sachlich, höchstens 5 kurze Sätze als Fließtext, kein Markdown. Nenne zuerst, was dringend ist und wer zurückgerufen werden muss, dann die Zahl der Mietanfragen und auffällige Themen. Erfinde nichts, nutze nur die gelieferten Angaben.",
        input: [{ role: "user", content: lines.slice(0, 30000) }],
      }),
    });
    if (!res.ok || !res.body) { console.error("KI-Überblick", res.status, await res.text().catch(() => "")); return null; }
    return (await readSse(res.body)).trim() || null;
  } catch (e) { console.error("KI-Überblick fehlgeschlagen", e); return null; }
}

function renderCall(c: any, i: number): string {
  const p = (c.priority ?? "info") as CallPriority;
  const who = [c.company_name, c.customer_name ?? c.caller_name].filter(Boolean).join(" · ") || "Unbekannter Anrufer";
  const time = berlin(new Date(c.call_started_at ?? c.created_at), { hour: "2-digit", minute: "2-digit" });
  const d = c.details ?? {};
  const items = (d.items?.length ? d.items.map((x: any) => `${x.quantity ? x.quantity + " × " : ""}${x.name}${x.note ? ` (${x.note})` : ""}`) : c.mentioned_items ?? []).join(", ");
  const period = [c.rental_start, d.rental_end].filter(Boolean).map((x: string) => new Date(x).toLocaleDateString("de-DE")).join(" – ");
  const row = (l: string, v: string | null | undefined) => v ? `<tr><td style="color:#6b7280;padding:2px 8px 2px 0;vertical-align:top;white-space:nowrap;">${l}</td><td style="padding:2px 0;">${esc(v)}</td></tr>` : "";
  const link = `https://www.slt-rental.de/b2b/anrufe`;
  return `<div style="border:1px solid #e5e7eb;border-left:4px solid ${PRIO_COLOR[p]};border-radius:6px;padding:12px;margin:0 0 12px;">
<div style="font-size:12px;color:${PRIO_COLOR[p]};font-weight:bold;">${i}. ${esc(PRIORITY_LABEL[p] ?? p)} · ${esc(INTENT[c.intent] ?? "Nicht ausgewertet")} · ${esc(time)} Uhr · ${esc(STATUS[c.status] ?? c.status)}</div>
<div style="font-size:15px;font-weight:bold;margin:4px 0;">${esc(who)}</div>
<p style="margin:4px 0 8px;">${esc(c.summary || c.provider_summary || (c.analysis_status === "failed" ? "Keine Auswertung möglich – bitte Transkript im Portal ansehen." : "Noch nicht ausgewertet – bitte im Portal ansehen."))}</p>
<table style="font-size:13px;border-collapse:collapse;">
${row("Telefon", d.callback_phone || c.caller_phone)}${row("E-Mail", c.email)}${row("Standort", LOC[c.location] ?? null)}${row("Artikel", items)}${row("Zeitraum", period)}
${row("Lieferung", d.delivery?.wanted ? ["gewünscht", d.delivery.address].filter(Boolean).join(": ") : null)}${row("Rückruf", d.callback_time)}
${row("Offen", c.open_points?.length ? c.open_points.join(" · ") : null)}${row("Priorität", c.priority_reason)}
</table>
<a href="${link}" style="font-size:13px;color:#00507d;">Im Portal öffnen</a>
</div>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const testTo = typeof body.test_to === "string" ? body.test_to.trim() : "";
    const now = new Date();

    if (testTo) {
      const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
      const { data: u } = await svc.auth.getUser(token);
      if (!u?.user) return json({ error: "Unauthorized" }, 401);
      const { data: isStaff } = await svc.rpc("is_staff_member", { _user_id: u.user.id });
      if (!isStaff) return json({ error: "Forbidden" }, 403);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testTo)) return json({ error: "Ungültige Test-Adresse" }, 400);
    } else {
      // Geplanter Lauf: nur um 20 Uhr Berliner Zeit (Cron läuft 18 und 19 UTC wegen Sommer-/Winterzeit).
      const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", hourCycle: "h23" }).formatToParts(now).find((x) => x.type === "hour")?.value);
      if (hour !== 20) return json({ skipped: `Berlin ${hour} Uhr` });
    }

    const day = typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date) && testTo ? body.date : berlinDay(now);
    // Tagesfenster großzügig laden, dann exakt nach Berliner Datum filtern.
    const from = new Date(`${day}T00:00:00Z`); from.setUTCHours(from.getUTCHours() - 3);
    const to = new Date(`${day}T23:59:59Z`); to.setUTCHours(to.getUTCHours() + 3);
    const { data, error } = await svc.from("phone_calls").select("*").gte("created_at", from.toISOString()).lte("created_at", to.toISOString()).limit(1000);
    if (error) throw error;
    const calls = (data ?? []).filter((c: any) => berlinDay(new Date(c.call_started_at ?? c.created_at)) === day);

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) return json({ error: "E-Mail-Versand ist nicht konfiguriert" }, 500);

    const results: Record<string, unknown>[] = [];
    for (const mailbox of ["krefeld", "bonn"] as const) {
      const list = calls.filter((c: any) => mailboxOf(c) === mailbox).sort((a: any, b: any) =>
        (priorityRank(a.priority) - priorityRank(b.priority)) || String(a.call_started_at ?? a.created_at).localeCompare(String(b.call_started_at ?? b.created_at)));
      const contact = LOCATION_CONTACTS[mailbox];
      if (!testTo) {
        const { data: done } = await svc.from("call_digest_log").select("id").eq("digest_date", day).eq("mailbox", mailbox).maybeSingle();
        if (done) { results.push({ mailbox, skipped: "bereits gesendet" }); continue; }
      }
      const counts = (["sofort", "heute", "woche", "info"] as CallPriority[]).map((p) => [p, list.filter((c: any) => (c.priority ?? "info") === p).length] as const).filter(([, n]) => n > 0);
      const ai = await overview(list, contact.name);
      const dateLabel = new Date(`${day}T12:00:00Z`).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
      const html = `<div style="font-family:Arial,sans-serif;max-width:680px;color:#111827;">
<h2 style="color:#00507d;margin:0 0 4px;">Anrufe ${esc(dateLabel)}</h2>
<p style="margin:0 0 12px;color:#6b7280;">Telefonassistenz ${esc(mailbox === "krefeld" ? "Krefeld / Mülheim an der Ruhr" : "Bonn")} · ${list.length} ${list.length === 1 ? "Anruf" : "Anrufe"}${counts.length ? " · " + counts.map(([p, n]) => `${n}× ${PRIORITY_LABEL[p]}`).join(", ") : ""}</p>
${ai ? `<div style="background:#f1f5f9;border-radius:6px;padding:12px;margin:0 0 16px;"><strong>Tagesüberblick</strong><p style="margin:6px 0 0;">${esc(ai)}</p></div>` : ""}
${list.length ? list.map((c: any, i: number) => renderCall(c, i + 1)).join("") : "<p>Heute sind über die Telefonassistenz keine Anrufe eingegangen.</p>"}
<p style="font-size:12px;color:#6b7280;margin-top:16px;">Automatische Tageszusammenfassung aus dem SLT-Rental-Portal. Vollständige Transkripte und Aufnahmen unter „Anrufe“ im Portal.</p></div>`;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `SLT-Rental Portal <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
          to: [testTo || contact.email],
          subject: `${testTo ? "[TEST] " : ""}Anrufe ${new Date(`${day}T12:00:00Z`).toLocaleDateString("de-DE")} – ${mailbox === "krefeld" ? "Krefeld/Mülheim" : "Bonn"} (${list.length})`,
          html,
        }),
      });
      if (!res.ok) { const t = await res.text(); console.error("Resend", res.status, t); results.push({ mailbox, error: `Versand fehlgeschlagen (${res.status})` }); continue; }
      if (!testTo) await svc.from("call_digest_log").insert({ digest_date: day, mailbox, call_count: list.length });
      results.push({ mailbox, to: testTo || contact.email, calls: list.length, ai_overview: Boolean(ai) });
    }
    return json({ day, results });
  } catch (e) {
    console.error("call-daily-digest", e);
    return json({ error: "Unerwarteter Fehler" }, 500);
  }
});
