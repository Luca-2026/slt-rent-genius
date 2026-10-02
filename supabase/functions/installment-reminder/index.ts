/**
 * Tägliche Erinnerung an fällige Abschlagsrechnungen.
 * Eine Sammel-E-Mail je Standort; jeder Auftrag wird höchstens einmal pro Tag erinnert.
 * Testlauf: POST { "dry_run": true } mit Mitarbeiter-Anmeldung – liefert nur die Liste.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { isCronCall, staffUserId } from "../_shared/cronAuth.ts";
import { LOCATION_CONTACTS, resolveLocationKey } from "../_shared/inquiry-offer-math.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const money = (n: number) =>
  new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " €";

const berlinToday = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });

interface DueRow {
  kind: "rental" | "sales";
  id: string;
  offer_number: string | null;
  customer: string;
  location: string;
  next_due: string;
  amount_net: number | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const dryRun = body?.dry_run === true;

    if (!(await isCronCall(req, service)) && !(await staffUserId(req, service))) {
      return json({ error: "Unauthorized" }, 401);
    }

    const today = berlinToday();
    const cols = "id, offer_number, company_name, location, installment_next_due, installment_amount_net, installment_reminded_on, status";
    const [rent, sales] = await Promise.all([
      service.from("rental_inquiries").select(`${cols}, customer_name`).eq("installment_enabled", true).lte("installment_next_due", today).neq("status", "rejected"),
      service.from("sales_inquiries").select(`${cols}, first_name, last_name`).eq("installment_enabled", true).lte("installment_next_due", today).neq("status", "rejected"),
    ]);
    if (rent.error || sales.error) throw new Error(rent.error?.message || sales.error?.message);

    const pending = (r: { installment_reminded_on: string | null }) => dryRun || r.installment_reminded_on !== today;
    const rows: DueRow[] = [
      ...(rent.data ?? []).filter(pending).map((r: any) => ({
        kind: "rental" as const, id: r.id, offer_number: r.offer_number, location: resolveLocationKey(r.location),
        customer: r.company_name || r.customer_name || "Kunde", next_due: r.installment_next_due, amount_net: r.installment_amount_net,
      })),
      ...(sales.data ?? []).filter(pending).map((r: any) => ({
        kind: "sales" as const, id: r.id, offer_number: r.offer_number, location: resolveLocationKey(r.location),
        customer: r.company_name || [r.first_name, r.last_name].filter(Boolean).join(" ") || "Kunde",
        next_due: r.installment_next_due, amount_net: r.installment_amount_net,
      })),
    ];
    if (dryRun || rows.length === 0) return json({ today, due: rows, sent: 0, dry_run: dryRun });

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) return json({ error: "E-Mail-Versand ist nicht konfiguriert" }, 500);

    const byLocation = new Map<string, DueRow[]>();
    for (const r of rows) byLocation.set(r.location, [...(byLocation.get(r.location) ?? []), r]);

    let sent = 0;
    for (const [loc, list] of byLocation) {
      const contact = LOCATION_CONTACTS[loc];
      const items = list.map((r) => {
        const path = r.kind === "rental" ? "mietanfragen" : "verkaufsanfragen";
        const link = `https://www.slt-rental.de/b2b/${path}?status=all&anfrage=${r.id}`;
        return `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${esc(r.customer)}<br><span style="color:#6b7280;font-size:12px;">${r.kind === "rental" ? "Miete" : "Verkauf"} · Angebot ${esc(r.offer_number ?? "—")}</span></td>` +
          `<td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${esc(new Date(r.next_due).toLocaleDateString("de-DE"))}</td>` +
          `<td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">${r.amount_net ? money(Number(r.amount_net)) + " netto" : "—"}</td>` +
          `<td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;"><a href="${link}" style="color:#00507d;">Öffnen</a></td></tr>`;
      }).join("");
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `SLT-Rental Portal <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
          to: [contact.email],
          subject: `Fällige Abschlagsrechnungen (${list.length}) – Standort ${contact.name}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:640px;"><h2 style="color:#00507d;">Fällige Abschlagsrechnungen</h2>` +
            `<p>Für folgende Aufträge am Standort ${esc(contact.name)} ist eine Abschlagsrechnung fällig. Im Portal unter „Abschlagsrechnungen“ erstellen – danach springt die Fälligkeit automatisch weiter.</p>` +
            `<table style="width:100%;border-collapse:collapse;font-size:14px;"><tr style="text-align:left;color:#6b7280;"><th style="padding:6px 8px;">Kunde</th><th style="padding:6px 8px;">Fällig seit</th><th style="padding:6px 8px;text-align:right;">Vorschlag</th><th></th></tr>${items}</table></div>`,
        }),
      });
      if (!res.ok) {
        console.error("Resend error", res.status, await res.text());
        continue;
      }
      sent++;
      const rentIds = list.filter((r) => r.kind === "rental").map((r) => r.id);
      const salesIds = list.filter((r) => r.kind === "sales").map((r) => r.id);
      if (rentIds.length) await service.from("rental_inquiries").update({ installment_reminded_on: today }).in("id", rentIds);
      if (salesIds.length) await service.from("sales_inquiries").update({ installment_reminded_on: today }).in("id", salesIds);
    }
    return json({ today, due: rows.length, sent });
  } catch (err) {
    console.error("installment-reminder error:", err);
    return json({ error: "Unerwarteter Fehler" }, 500);
  }
});
