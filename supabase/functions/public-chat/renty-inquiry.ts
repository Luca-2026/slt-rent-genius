/**
 * Renty → Mietanfrage. Validiert die vom Chat gesammelten Angaben, legt eine
 * rental_inquiries-Zeile (source "renty_chat") an und benachrichtigt den Standort.
 * Fehler werden als Liste an das Modell zurückgegeben, damit Renty gezielt nachfragt.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { saveRentalInquiry, rentalInquiryLink } from "../_shared/inquiry-store.ts";

export type LocationId = "krefeld" | "bonn" | "muelheim";

export const LOCATIONS: Record<LocationId, { name: string; email: string; phone: string }> = {
  krefeld: { name: "Krefeld", email: "krefeld@slt-rental.de", phone: "02151 417 990 4" },
  bonn: { name: "Bonn", email: "bonn@slt-rental.de", phone: "0228 504 660 61" },
  muelheim: { name: "Mülheim an der Ruhr", email: "muelheim@slt-rental.de", phone: "02151 417 990 4" },
};

/** Testanfragen (Domain example.com/.test) gehen nie an echte Postfächer. */
const TEST_RECIPIENT = "luca@sandhoff.org";
export function isTestEmail(email: string) {
  return /@(example\.(com|org|net)|[a-z0-9-]+\.test)$/i.test(email.trim());
}

export interface InquiryArgs {
  location: string;
  items: Array<{ product_name: string; quantity: number; product_url: string | null }>;
  start_date: string;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  open_ended: boolean;
  delivery: boolean;
  delivery_street: string | null;
  delivery_postal_code: string | null;
  delivery_city: string | null;
  customer_kind: string;
  company_name: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_street: string | null;
  customer_postal_code: string | null;
  customer_city: string | null;
  project_description: string | null;
  customer_confirmed_summary: boolean;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const EMAIL_RE = /^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}\.[a-z]{2,24}$/i;

const clean = (v: unknown, max = 200) => (typeof v === "string" ? v.replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, max) : "");
const optional = (v: unknown, max = 200) => clean(v, max) || null;

function berlinToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date());
}

export function validateInquiry(raw: InquiryArgs, today = berlinToday()) {
  const errors: string[] = [];
  const location = (["krefeld", "bonn", "muelheim"] as const).find((l) => l === raw?.location);
  if (!location) errors.push("Standort fehlt (Krefeld, Bonn oder Mülheim an der Ruhr).");
  const items = (Array.isArray(raw?.items) ? raw.items : [])
    .map((i) => ({
      product_name: clean(i?.product_name, 160),
      quantity: Math.floor(Number(i?.quantity)),
      product_url: /^https:\/\/www\.slt-rental\.de\/mieten\/[a-z0-9/-]+$/.test(String(i?.product_url ?? "")) ? String(i.product_url) : null,
    }))
    .filter((i) => i.product_name.length >= 2);
  if (items.length === 0) errors.push("Mindestens ein Mietartikel fehlt.");
  if (items.length > 20) errors.push("Maximal 20 Positionen pro Anfrage.");
  if (items.some((i) => !Number.isFinite(i.quantity) || i.quantity < 1 || i.quantity > 999)) errors.push("Menge je Artikel fehlt oder ist ungültig.");

  const start = clean(raw?.start_date, 10);
  if (!DATE_RE.test(start) || Number.isNaN(Date.parse(start))) errors.push("Mietbeginn (Datum) fehlt.");
  else if (start < today) errors.push("Mietbeginn liegt in der Vergangenheit.");
  const openEnded = raw?.open_ended === true;
  const end = clean(raw?.end_date, 10) || null;
  if (!openEnded) {
    if (!end || !DATE_RE.test(end) || Number.isNaN(Date.parse(end))) errors.push("Mietende fehlt (oder als unbefristet markieren).");
    else if (DATE_RE.test(start) && end < start) errors.push("Mietende liegt vor dem Mietbeginn.");
  }
  const startTime = clean(raw?.start_time, 5) || null;
  const endTime = clean(raw?.end_time, 5) || null;
  if (startTime && !TIME_RE.test(startTime)) errors.push("Uhrzeit Mietbeginn ungültig (HH:MM).");
  if (endTime && !TIME_RE.test(endTime)) errors.push("Uhrzeit Mietende ungültig (HH:MM).");

  const delivery = raw?.delivery === true;
  const dStreet = optional(raw?.delivery_street), dZip = optional(raw?.delivery_postal_code, 10), dCity = optional(raw?.delivery_city, 80);
  if (delivery && (!dStreet || !dZip || !/^\d{5}$/.test(dZip) || !dCity)) errors.push("Lieferadresse unvollständig (Straße + Hausnummer, 5-stellige PLZ, Ort).");

  const kind = raw?.customer_kind === "business" ? "business" : raw?.customer_kind === "private" ? "private" : null;
  if (!kind) errors.push("Privat- oder Geschäftskunde fehlt.");
  const company = optional(raw?.company_name, 160);
  if (kind === "business" && !company) errors.push("Firmenname fehlt.");

  const name = clean(raw?.customer_name, 120);
  if (name.length < 3 || !/\s/.test(name)) errors.push("Vor- und Nachname fehlen.");
  const email = clean(raw?.customer_email, 254).toLowerCase();
  if (!EMAIL_RE.test(email)) errors.push("Gültige E-Mail-Adresse fehlt.");
  const phone = clean(raw?.customer_phone, 40);
  if (phone.replace(/\D/g, "").length < 6 || !/^[+\d][\d\s/()-]+$/.test(phone)) errors.push("Gültige Telefonnummer fehlt.");
  if (raw?.customer_confirmed_summary !== true) errors.push("Der Kunde hat die Zusammenfassung noch nicht ausdrücklich bestätigt.");

  return {
    errors,
    value: {
      location: location as LocationId, items, start, end: openEnded ? null : end, openEnded, startTime, endTime,
      delivery, dStreet, dZip, dCity, kind: kind ?? "private", company, name, email, phone,
      cStreet: optional(raw?.customer_street), cZip: optional(raw?.customer_postal_code, 10), cCity: optional(raw?.customer_city, 80),
      project: optional(raw?.project_description, 1500),
    },
  };
}

function esc(v: unknown) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
const deDate = (d: string | null) => (d ? d.split("-").reverse().join(".") : "");

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

function service() {
  const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

export async function submitInquiry(raw: InquiryArgs, ctx: { ip: string; transcript: string }) {
  const { errors, value: v } = validateInquiry(raw);
  if (errors.length) return { ok: false, missing_or_invalid: errors };

  const db = service();
  if (!db) return { ok: false, error: "Speichern derzeit nicht möglich – bitte Standort kontaktieren." };
  const ipHash = await sha256(`renty:${ctx.ip}`);
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Doppelte Absendung im selben Gespräch → bestehende Anfrage zurückgeben.
  const { data: dup } = await db.from("rental_inquiries").select("id").eq("source", "renty_chat")
    .eq("customer_email", v.email).gte("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString()).limit(1);
  if (dup?.length) return { ok: true, already_submitted: true, reference: dup[0].id.slice(0, 8).toUpperCase() };
  const { count } = await db.from("rental_inquiries").select("id", { count: "exact", head: true })
    .eq("source", "renty_chat").gte("created_at", since).filter("raw_payload->>ip_hash", "eq", ipHash);
  if ((count ?? 0) >= 3) return { ok: false, error: "Zu viele Anfragen in kurzer Zeit. Bitte den Standort direkt kontaktieren." };

  const loc = LOCATIONS[v.location];
  const test = isTestEmail(v.email);
  const items = v.items.map((i) => ({ product_name: i.product_name, quantity: i.quantity, product_url: i.product_url }));
  const message = [
    v.project ? `Projekt/Einsatz: ${v.project}` : null,
    v.openEnded ? "Mietdauer: unbefristet / offen" : null,
    "Quelle: Website-Chat Renty",
  ].filter(Boolean).join("\n");

  const id = await saveRentalInquiry({
    source: "renty_chat",
    location: loc.name,
    location_email: loc.email,
    product_name: items[0].product_name,
    quantity: items[0].quantity,
    requested_items: items,
    start_date: v.start, start_time: v.startTime, end_date: v.end, end_time: v.endTime,
    delivery_requested: v.delivery, delivery_street: v.dStreet, delivery_postal_code: v.dZip, delivery_city: v.dCity,
    customer_name: v.name, customer_email: v.email, customer_phone: v.phone,
    customer_street: v.cStreet, customer_postal_code: v.cZip, customer_city: v.cCity,
    customer_kind: v.kind,
    message,
    raw_payload: { ip_hash: ipHash, test, company_name: v.company, transcript: ctx.transcript.slice(0, 20000) },
  });
  if (!id) return { ok: false, error: "Speichern fehlgeschlagen – bitte Standort kontaktieren." };
  if (v.company) await db.from("rental_inquiries").update({ company_name: v.company }).eq("id", id);

  const reference = id.slice(0, 8).toUpperCase();
  await notify(v, loc, id, reference, test, ctx.transcript);
  return { ok: true, reference, location: loc.name, test_mode: test };
}

async function notify(v: ReturnType<typeof validateInquiry>["value"], loc: typeof LOCATIONS[LocationId], id: string, reference: string, test: boolean, transcript: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) { console.log("[renty] no RESEND_API_KEY, inquiry", id); return; }
  const period = `${deDate(v.start)}${v.startTime ? ` ${v.startTime}` : ""} – ${v.openEnded ? "unbefristet" : `${deDate(v.end)}${v.endTime ? ` ${v.endTime}` : ""}`}`;
  const rows = [
    ["Standort", loc.name], ["Zeitraum", period],
    ["Übergabe", v.delivery ? `Lieferung: ${v.dStreet}, ${v.dZip} ${v.dCity}` : "Selbstabholung"],
    ["Kundenart", v.kind === "business" ? `Geschäftskunde${v.company ? ` – ${v.company}` : ""}` : "Privatkunde"],
    ["Name", v.name], ["E-Mail", v.email], ["Telefon", v.phone],
    ["Adresse", [v.cStreet, [v.cZip, v.cCity].filter(Boolean).join(" ")].filter(Boolean).join(", ") || "–"],
    ["Projekt", v.project ?? "–"],
  ];
  const html = `<div style="font-family:Arial,sans-serif;max-width:640px;color:#1f2937">
<h2 style="color:#00507d;margin:0 0 4px">Neue Mietanfrage über Renty${test ? " (TEST)" : ""}</h2>
<p style="margin:0 0 16px;color:#6b7280">Referenz ${reference}</p>
<table style="border-collapse:collapse;width:100%;margin-bottom:16px">
<tr><th align="left" style="border-bottom:2px solid #00507d;padding:6px">Artikel</th><th align="right" style="border-bottom:2px solid #00507d;padding:6px">Menge</th></tr>
${v.items.map((i) => `<tr><td style="border-bottom:1px solid #e5e7eb;padding:6px">${i.product_url ? `<a href="${esc(i.product_url)}">${esc(i.product_name)}</a>` : esc(i.product_name)}</td><td align="right" style="border-bottom:1px solid #e5e7eb;padding:6px">${i.quantity}</td></tr>`).join("")}
</table>
<table style="border-collapse:collapse;width:100%">${rows.map(([k, val]) => `<tr><td style="padding:4px 8px 4px 0;color:#6b7280;vertical-align:top;width:120px">${k}</td><td style="padding:4px 0">${esc(val)}</td></tr>`).join("")}</table>
<p style="margin:20px 0"><a href="${rentalInquiryLink(id)}" style="background:#ff8e02;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold">Im Portal öffnen</a></p>
<details><summary style="color:#6b7280">Chatverlauf</summary><pre style="white-space:pre-wrap;font-size:12px;background:#f3f4f6;padding:10px">${esc(transcript.slice(0, 12000))}</pre></details>
</div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "Idempotency-Key": `renty-inquiry-${id}` },
      body: JSON.stringify({
        from: "Anfragen <anfragen@slt-rental.de>",
        to: [test ? TEST_RECIPIENT : loc.email],
        reply_to: v.email,
        subject: `${test ? "[TEST] " : ""}Mietanfrage via Renty: ${v.items[0].product_name}${v.items.length > 1 ? ` + ${v.items.length - 1} weitere` : ""} – ${loc.name}`,
        html,
      }),
    });
    if (!res.ok) console.error("[renty] resend error", res.status, await res.text());
  } catch (e) {
    console.error("[renty] resend threw", e);
  }
}
