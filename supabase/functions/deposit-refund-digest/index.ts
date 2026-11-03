/**
 * Täglich 18 Uhr (Berlin): Kassenprotokoll aller Barzahlungen (mit DATEV-CSV) und Liste aller Kautionserstattungen per Überweisung der letzten 24 Stunden
 * an die Buchhaltung. Stripe-Erstattungen sind ausgenommen. Keine Daten → Hinweis-Mail.
 * Testlauf (nur Mitarbeiter): POST { "test_to": "luca@sandhoff.org" } – keine Protokollierung.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { isCronCall, staffUserId } from "../_shared/cronAuth.ts";
import { buildDatevCashCsv, type CashEntry } from "../_shared/datev-cash-csv.ts";

const RECIPIENT = "buchhaltung@slt-tg.de";
const TEST_RECIPIENTS = new Set(["luca@sandhoff.org"]);
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const eur = (n: number) => n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const berlinDay = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const testTo = typeof body.test_to === "string" ? body.test_to.trim().toLowerCase() : "";
    const now = new Date();

    if (testTo) {
      if (!(await staffUserId(req, svc)) && !(await isCronCall(req, svc))) return json({ error: "Unauthorized" }, 401);
      if (!TEST_RECIPIENTS.has(testTo)) return json({ error: "Testversand nur an die Testadresse" }, 403);
    } else {
      if (!(await isCronCall(req, svc))) return json({ error: "Unauthorized" }, 401);
      const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", hourCycle: "h23" }).formatToParts(now).find((x) => x.type === "hour")?.value);
      if (hour !== 18) return json({ skipped: `Berlin ${hour} Uhr` });
    }

    const day = berlinDay(now);
    if (!testTo) {
      const { data: done } = await svc.from("deposit_refund_digest_log").select("id").eq("digest_date", day).maybeSingle();
      if (done) return json({ skipped: "bereits gesendet" });
    }

    const since = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
    const { data, error } = await svc.from("deposit_settlements")
      .select("balance, settled_at, rental_inquiries(customer_name, company_name, order_code)")
      .eq("payout_method", "transfer").gt("balance", 0)
      .gte("settled_at", since).lte("settled_at", now.toISOString())
      .order("settled_at");
    if (error) throw error;
    // deno-lint-ignore no-explicit-any
    const rows = (data ?? []).map((r: any) => ({
      name: r.rental_inquiries?.customer_name ?? "",
      company: r.rental_inquiries?.company_name ?? "",
      code: r.rental_inquiries?.order_code ? `#${r.rental_inquiries.order_code}` : "",
      amount: Number(r.balance),
    }));
    const total = Math.round(rows.reduce((s, r) => s + r.amount, 0) * 100) / 100;
    const { data: cashData, error: cashErr } = await svc.from("cash_journal").select("*")
      .gte("logged_at", since).lte("logged_at", now.toISOString()).order("payment_date").order("logged_at");
    if (cashErr) throw cashErr;
    // deno-lint-ignore no-explicit-any
    let cash: CashEntry[] = (cashData ?? []).map((c: any) => ({
      amount: Number(c.amount), paymentDate: c.payment_date, orderCode: c.order_code, documentNumber: c.document_number,
      customerName: c.customer_name, companyName: c.company_name,
      label: c.kind === "payment_removed" ? `Storno ${c.label ?? "Barzahlung"}` : c.label,
      register: c.cash_register ?? null,
    }));
    // Nur Testversand: theoretische Beispielbuchungen, nichts wird gespeichert.
    if (testTo && body.sample_cash === true) {
      cash = [
        { amount: 119, paymentDate: day, orderCode: "TEST01", documentNumber: "RE-M-TEST-0001", customerName: "Max Mustermann", companyName: null, register: "krefeld", label: "Bar Miete" },
        { amount: 300, paymentDate: day, orderCode: "TEST01", documentNumber: null, customerName: "Max Mustermann", companyName: null, register: "krefeld", label: "Bar Kaution" },
        { amount: 1785.5, paymentDate: day, orderCode: "TEST02", documentNumber: "RE-V-TEST-0001", customerName: "Erika Musterfrau", companyName: "Muster Bau GmbH", register: "bonn", label: "Bar Verkauf" },
        { amount: -300, paymentDate: day, orderCode: "TEST03", documentNumber: null, customerName: "Hans Beispiel", companyName: null, register: "bonn", label: "Bar Kautionsauszahlung" },
      ] as CashEntry[];
    }
    const cashTotal = Math.round(cash.reduce((s, c) => s + c.amount, 0) * 100) / 100;
    const REG_LABEL: Record<string, string> = { krefeld: "Krefeld", bonn: "Bonn", "": "Ohne Standort" };
    const regKey = (c: CashEntry) => (c.register === "krefeld" || c.register === "bonn") ? c.register : "";
    const groups = ["krefeld", "bonn", ""].map((k) => ({ key: k, entries: cash.filter((c) => regKey(c) === k) }))
      .filter((g) => g.entries.length || g.key !== "");
    const attachments = groups.map((g) => {
      const csv = buildDatevCashCsv(g.entries);
      const name = g.key ? `Kassenbuch_${REG_LABEL[g.key]}_DATEV_${day}.csv` : `Kassenbuch_OHNE_STANDORT_${day}.csv`;
      return { filename: name, content: btoa(String.fromCharCode(...new TextEncoder().encode(csv))), csv };
    });
    const dateLabel = new Date(`${day}T12:00:00Z`).toLocaleDateString("de-DE");
    const td = 'style="border:1px solid #d1d5db;padding:6px 10px;"';
    const table = rows.length
      ? `<table style="border-collapse:collapse;font-size:14px;"><thead><tr style="background:#00507d;color:#ffffff;">
<th ${td}>Name</th><th ${td}>Firma</th><th ${td}>Auftrags-ID</th><th ${td}>Betrag</th></tr></thead><tbody>
${rows.map((r) => `<tr><td ${td}>${esc(r.name)}</td><td ${td}>${esc(r.company || "–")}</td><td ${td}>${esc(r.code)}</td><td ${td} align="right">${esc(eur(r.amount))}</td></tr>`).join("")}
<tr><td ${td} colspan="3"><strong>Summe</strong></td><td ${td} align="right"><strong>${esc(eur(total))}</strong></td></tr></tbody></table>`
      : `<p><strong>Keine Kautionen zu erstatten.</strong></p>`;
    const cashTable = cash.length
      ? `<table style="border-collapse:collapse;font-size:14px;"><thead><tr style="background:#00507d;color:#ffffff;">
<th ${td}>Kasse</th><th ${td}>Datum</th><th ${td}>Name</th><th ${td}>Firma</th><th ${td}>Auftrags-ID</th><th ${td}>Art</th><th ${td}>Betrag</th></tr></thead><tbody>
${cash.map((c) => `<tr><td ${td}>${esc(REG_LABEL[regKey(c)])}</td><td ${td}>${esc(new Date(c.paymentDate + "T12:00:00Z").toLocaleDateString("de-DE"))}</td><td ${td}>${esc(c.customerName || "")}</td><td ${td}>${esc(c.companyName || "–")}</td><td ${td}>${esc(c.orderCode ? "#" + c.orderCode : "")}</td><td ${td}>${esc(c.label || "")}</td><td ${td} align="right">${esc(eur(c.amount))}</td></tr>`).join("")}
<tr><td ${td} colspan="6"><strong>Saldo</strong></td><td ${td} align="right"><strong>${esc(eur(cashTotal))}</strong></td></tr></tbody></table>`
      : `<p><strong>Keine Barzahlungen.</strong></p>`;
    const html = `<div style="font-family:Arial,sans-serif;max-width:680px;color:#111827;">
<h2 style="color:#00507d;margin:0 0 8px;">Tagesabschluss ${esc(dateLabel)}</h2>
<p style="color:#6b7280;margin:0 0 12px;">Zeitraum: letzte 24 Stunden bis ${esc(now.toLocaleString("de-DE", { timeZone: "Europe/Berlin" }))} Uhr. Kautionserstattungen über Stripe sind nicht enthalten.</p>
<h3 style="color:#00507d;margin:16px 0 8px;">Kautionserstattungen per Überweisung</h3>
${table}
<h3 style="color:#00507d;margin:24px 0 8px;">Kassenprotokoll Barzahlungen</h3>
${cashTable}
${groups.filter((g) => g.key).map((g) => `<p style="font-size:13px;margin:4px 0;">Saldo Kasse ${REG_LABEL[g.key]}: <strong>${esc(eur(Math.round(g.entries.reduce((s, c) => s + c.amount, 0) * 100) / 100))}</strong></p>`).join("")}
${groups.some((g) => !g.key) ? `<p style="color:#b91c1c;"><strong>Achtung:</strong> Einige Barzahlungen haben keinen Standort. Sie stehen in einer separaten Datei und müssen manuell der richtigen Kasse zugeordnet werden.</p>` : ""}
<p style="font-size:12px;color:#6b7280;">Je Kasse liegt eine eigene CSV-Datei bei (Krefeld inkl. Mülheim an der Ruhr, Bonn). Jede Datei nur in die gleichnamige Kasse importieren; die Datei ist für den Import in DATEV Kassenbuch online vorbereitet (Kassenübersicht → Optionen → Kassenbewegungen importieren). Bitte nicht in Excel bearbeiten und nur einmal importieren.</p>
<p style="font-size:12px;color:#6b7280;margin-top:16px;">Automatische Liste aus dem SLT-Rental-Portal.</p></div>`;

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) return json({ error: "E-Mail-Versand ist nicht konfiguriert" }, 500);
    const to = testTo || RECIPIENT;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `SLT-Rental Portal <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
        to: [to],
        subject: `${testTo ? "[TEST] " : ""}Tagesabschluss ${dateLabel}: Kautionserstattungen (${rows.length}) und Kassenprotokoll (${cash.length})`,
        html,
        attachments: attachments.map(({ filename, content }) => ({ filename, content })),
      }),
    });
    if (!res.ok) { console.error("Resend", res.status, await res.text()); return json({ error: `Versand fehlgeschlagen (${res.status})` }, 502); }
    if (!testTo) await svc.from("deposit_refund_digest_log").insert({ digest_date: day, refund_count: rows.length, total_amount: total });
    return json({ to, count: rows.length, total, cash: cash.length, cashTotal, files: attachments.map(({ filename, csv }) => ({ filename, csv })) });
  } catch (e) {
    console.error("deposit-refund-digest", e);
    return json({ error: "Unerwarteter Fehler" }, 500);
  }
});
