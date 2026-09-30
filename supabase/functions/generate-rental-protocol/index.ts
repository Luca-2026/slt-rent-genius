// Übergabe- und Rückgabeprotokoll zu einer Mietanfrage (Privat- und Firmenkunden).
// Fotos (max. 15) kommen verkleinert als Base64, werden gespeichert und ins PDF eingebettet.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { encodeBase64, decodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { z } from "https://esm.sh/zod@3.23.8";
import { mirrorDamagesToInventory } from "../_shared/inventory-damages.ts";
import { renderProtocolPdf, berlin, type ProtocolPdfPhoto } from "./pdf.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

export const MAX_PHOTOS = 15;
const MAX_PHOTO_B64 = 4_000_000; // ~3 MB je Foto nach Verkleinerung

const Photo = z.object({ data: z.string().min(10).max(MAX_PHOTO_B64), taken_at: z.string().min(10).max(40), caption: z.string().max(200).nullable().optional() });
const Body = z.object({
  kind: z.enum(["delivery", "return"]),
  rental_inquiry_id: z.string().uuid(),
  staff_name: z.string().trim().min(2).max(120),
  staff_signature: z.string().startsWith("data:image/png;base64,").max(600_000),
  customer_not_present: z.boolean(),
  customer_signature: z.string().startsWith("data:image/png;base64,").max(600_000).nullable(),
  customer_signer_name: z.string().trim().max(120).nullable(),
  id_checked: z.boolean(),
  id_check_type: z.string().max(40).nullable(),
  agb_accepted: z.boolean(),
  items_confirmed: z.boolean(),
  operating_hours: z.string().max(40).nullable(),
  fuel_level: z.string().max(20).nullable(),
  cleanliness_rating: z.number().int().min(1).max(5).nullable(),
  known_defects: z.string().max(2000).nullable(),
  notes: z.string().max(2000).nullable(),
  all_items_returned: z.boolean().nullable(),
  missing_items_notes: z.string().max(1000).nullable(),
  items: z.array(z.object({ name: z.string().min(1).max(300), quantity: z.number().int().min(1).max(100000), detail: z.string().max(300).nullable() })).min(1).max(60),
  photos: z.array(Photo).max(MAX_PHOTOS),
  damages: z.array(z.object({
    item_name: z.string().max(300).nullable(),
    category: z.string().min(1).max(40),
    description: z.string().trim().min(1).max(2000),
    amount: z.number().min(0).max(1_000_000).nullable(),
    needs_repair: z.boolean(),
    reduces_stock: z.boolean(),
    quantity: z.number().int().min(1).max(10000),
    photos: z.array(Photo).max(MAX_PHOTOS),
  })).max(30),
  send_email: z.boolean(),
});

const LOCATIONS: Record<string, { name: string; address: string; email: string; phone: string }> = {
  krefeld: { name: "Krefeld", address: "Anrather Stra\u00DFe 291, 47807 Krefeld", email: "krefeld@slt-rental.de", phone: "02151 417 990 4" },
  bonn: { name: "Bonn", address: "Drachenburgstra\u00DFe 8, 53179 Bonn", email: "bonn@slt-rental.de", phone: "0228 504 660 61" },
  muelheim: { name: "M\u00FClheim an der Ruhr", address: "Ruhrorter Str. 122, 45478 M\u00FClheim an der Ruhr", email: "muelheim@slt-rental.de", phone: "02151 417 990 4" },
};
const locKey = (raw: string | null) => {
  const v = (raw ?? "").toLowerCase();
  if (v.includes("bonn")) return "bonn";
  if (v.includes("lheim")) return "muelheim";
  return "krefeld";
};
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fileSafe = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss").replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 60);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "Nicht angemeldet." }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await userClient.auth.getUser(auth.slice(7));
    if (!user) return json({ error: "Nicht angemeldet." }, 401);
    const svc = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const [{ data: isStaff }, { data: isAdmin }] = await Promise.all([
      svc.rpc("is_staff_member", { _user_id: user.id }),
      svc.rpc("has_role", { _user_id: user.id, _role: "admin" }),
    ]);
    if (!isStaff && !isAdmin) return json({ error: "Nur f\u00FCr Mitarbeiter." }, 403);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Ung\u00FCltige Angaben.", details: parsed.error.flatten().fieldErrors }, 400);
    const b = parsed.data;
    const isReturn = b.kind === "return";

    const totalPhotos = b.photos.length + b.damages.reduce((n, d) => n + d.photos.length, 0);
    if (totalPhotos > MAX_PHOTOS) return json({ error: `Maximal ${MAX_PHOTOS} Fotos je Protokoll (gesendet: ${totalPhotos}).` }, 400);
    if (!b.customer_not_present) {
      if (!b.customer_signature || !b.customer_signer_name) return json({ error: "Unterschrift und Name des Kunden fehlen." }, 400);
      if (!b.id_checked) return json({ error: "Der Ausweisabgleich fehlt." }, 400);
      if (!b.items_confirmed || (!isReturn && !b.agb_accepted)) return json({ error: "Die Best\u00E4tigungen des Kunden fehlen." }, 400);
    }

    const { data: inq, error: inqErr } = await svc.from("rental_inquiries").select("*").eq("id", b.rental_inquiry_id).maybeSingle();
    if (inqErr || !inq) return json({ error: "Mietanfrage nicht gefunden." }, 404);
    if (inq.status !== "accepted") return json({ error: "Protokolle sind nur f\u00FCr angenommene Auftr\u00E4ge m\u00F6glich." }, 409);

    const [{ data: existingDn }, { data: existingRp }] = await Promise.all([
      svc.from("b2b_delivery_notes").select("id,delivery_note_number").eq("rental_inquiry_id", inq.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      svc.from("b2b_return_protocols").select("id").eq("rental_inquiry_id", inq.id).limit(1).maybeSingle(),
    ]);
    if (existingRp) return json({ error: "F\u00FCr diesen Auftrag gibt es bereits ein R\u00FCckgabeprotokoll." }, 409);
    if (!isReturn && existingDn) return json({ error: `F\u00FCr diesen Auftrag gibt es bereits das \u00DCbergabeprotokoll ${existingDn.delivery_note_number}.` }, 409);
    if (isReturn && !existingDn) return json({ error: "Zuerst muss das \u00DCbergabeprotokoll erstellt werden." }, 409);

    const { data: number, error: numErr } = await svc.rpc(isReturn ? "generate_return_protocol_number" : "generate_delivery_note_number");
    if (numErr || !number) return json({ error: "Protokollnummer konnte nicht vergeben werden." }, 500);

    // Fotos speichern (Reihenfolge: Zustandsfotos, dann Schadensfotos)
    const now = new Date();
    const folder = `protocols/${inq.id}/${number}`;
    const pdfPhotos: ProtocolPdfPhoto[] = [];
    const storedPhotos: { path: string; taken_at: string; caption: string | null; damage_no: number | null }[] = [];
    const store = async (p: z.infer<typeof Photo>, damageNo: number | null) => {
      const bytes = decodeBase64(p.data);
      const path = `${folder}/foto-${String(pdfPhotos.length + 1).padStart(2, "0")}.jpg`;
      const { error } = await svc.storage.from("b2b-documents").upload(path, bytes, { contentType: "image/jpeg", upsert: true });
      if (error) throw new Error(`Foto ${pdfPhotos.length + 1} konnte nicht gespeichert werden.`);
      pdfPhotos.push({ bytes, takenAt: p.taken_at, caption: p.caption ?? null, damageNo });
      storedPhotos.push({ path, taken_at: p.taken_at, caption: p.caption ?? null, damage_no: damageNo });
      return pdfPhotos.length;
    };
    for (const p of b.photos) await store(p, null);
    const damageRows = [];
    for (let i = 0; i < b.damages.length; i++) {
      const d = b.damages[i];
      const nos: number[] = [];
      for (const p of d.photos) nos.push(await store(p, i + 1));
      damageRows.push({ ...d, no: i + 1, photoNos: nos, paths: nos.map((n) => storedPhotos[n - 1].path) });
    }

    const lk = locKey(inq.location);
    const loc = LOCATIONS[lk];
    const payload = (inq.offer_payload ?? {}) as Record<string, any>;
    const sigBytes = (s: string | null) => (s ? decodeBase64(s.split(",")[1] ?? "") : null);
    const deliveryAddress = inq.delivery_requested && (inq.delivery_street || inq.delivery_city)
      ? [inq.delivery_street, [inq.delivery_postal_code, inq.delivery_city].filter(Boolean).join(" ")].filter(Boolean).join(", ")
      : null;
    const customerLabel = [inq.company_name, inq.customer_name].filter(Boolean).join(" \u00B7 ") || inq.customer_email;

    const pdf = await renderProtocolPdf({
      kind: b.kind,
      number,
      createdAt: now,
      customer: {
        company: inq.company_name, name: inq.customer_name, street: inq.customer_street,
        postalCity: [inq.customer_postal_code, inq.customer_city].filter(Boolean).join(" ") || null,
        email: inq.customer_email, phone: inq.customer_phone,
      },
      order: {
        confirmationNumber: inq.order_confirmation_number, offerNumber: inq.offer_number ?? payload.offer_number ?? null,
        location: `SLT-Rental ${loc.name}`, locationAddress: loc.address, start: inq.start_date ? `${String(inq.start_date).slice(0, 10)}${inq.start_time ? " " + inq.start_time : ""}` : null,
        end: inq.end_date ? `${String(inq.end_date).slice(0, 10)}${inq.end_time ? " " + inq.end_time : ""}` : null,
        deliveryAddress, deliveryNoteNumber: existingDn?.delivery_note_number ?? null,
      },
      items: b.items,
      condition: {
        operatingHours: b.operating_hours, fuelLevel: b.fuel_level, cleanliness: b.cleanliness_rating,
        knownDefects: b.known_defects, notes: b.notes, allReturned: isReturn ? b.all_items_returned : null, missingNotes: b.missing_items_notes,
      },
      idCheck: { checked: b.id_checked, type: b.id_check_type },
      confirmations: { agb: b.agb_accepted, items: b.items_confirmed, customerNotPresent: b.customer_not_present },
      damages: damageRows.map((d) => ({
        no: d.no, itemName: d.item_name, category: d.category, description: d.description, amount: d.amount,
        needsRepair: d.needs_repair, reducesStock: d.reduces_stock, quantity: d.quantity, photoNos: d.photoNos,
      })),
      photos: pdfPhotos,
      signatures: { customer: sigBytes(b.customer_signature), customerName: b.customer_signer_name, staff: sigBytes(b.staff_signature), staffName: b.staff_name },
    });

    const fileName = `${isReturn ? "Rueckgabeprotokoll" : "Uebergabeprotokoll"}_${number}_${fileSafe(customerLabel || "Kunde")}.pdf`;
    const pdfPath = `protocols/${inq.id}/${fileName}`;
    const { error: upErr } = await svc.storage.from("b2b-invoices").upload(pdfPath, pdf, { contentType: "application/pdf", upsert: true });
    if (upErr) return json({ error: "PDF konnte nicht gespeichert werden." }, 500);
    const { data: signed } = await svc.storage.from("b2b-invoices").createSignedUrl(pdfPath, 60 * 60 * 24 * 365);
    const fileUrl = signed?.signedUrl ?? null;

    const photoUrls: string[] = [];
    for (const p of storedPhotos) {
      const { data: s } = await svc.storage.from("b2b-documents").createSignedUrl(p.path, 60 * 60 * 24 * 365);
      photoUrls.push(s?.signedUrl ?? p.path);
    }
    const protocolData = {
      customer_label: customerLabel,
      order_confirmation_number: inq.order_confirmation_number,
      pdf_path: pdfPath,
      items: b.items,
      photos: storedPhotos,
      operating_hours: b.operating_hours, fuel_level: b.fuel_level, cleanliness_rating: b.cleanliness_rating,
      customer_not_present: b.customer_not_present, customer_signer_name: b.customer_signer_name,
      items_confirmed: b.items_confirmed, created_by: user.id,
    };
    const status = b.customer_not_present ? "signed_staff_only" : "signed";
    const common = {
      rental_inquiry_id: inq.id, b2b_profile_id: inq.b2b_profile_id ?? null, status,
      staff_signature_data: b.staff_signature, staff_name: b.staff_name, notes: b.notes,
      signed_at: now.toISOString(), file_url: fileUrl, file_name: fileName, photo_urls: photoUrls,
      id_checked: b.id_checked, id_check_type: b.id_check_type, id_checked_at: b.id_checked ? now.toISOString() : null,
      protocol_data: protocolData,
    };

    let protocolId: string;
    if (!isReturn) {
      const { data: row, error } = await svc.from("b2b_delivery_notes").insert({
        ...common, delivery_note_number: number, signature_data: b.customer_signature, known_defects: b.known_defects,
        agb_accepted: b.agb_accepted, agb_accepted_at: b.agb_accepted ? now.toISOString() : null,
        additional_defects: damageRows.length ? damageRows.map((d) => `Schaden ${d.no}: ${d.description}`).join("\n") : null,
      }).select("id").single();
      if (error) throw error;
      protocolId = row.id;
      await svc.from("b2b_delivery_note_items").insert(b.items.map((it) => ({ delivery_note_id: protocolId, product_name: it.name, quantity: it.quantity, description: it.detail })));
    } else {
      const damagesTotal = damageRows.reduce((s, d) => s + (d.amount ?? 0), 0);
      const { data: row, error } = await svc.from("b2b_return_protocols").insert({
        ...common, return_protocol_number: number, delivery_note_id: existingDn!.id, customer_signature_data: b.customer_signature,
        condition_notes: b.known_defects, cleaning_required: (b.cleanliness_rating ?? 5) <= 2,
        all_items_returned: b.all_items_returned ?? true, missing_items_notes: b.missing_items_notes,
        meter_reading_end: b.operating_hours, damages_total: damagesTotal,
        overall_condition: damageRows.length ? "damaged" : "good",
        damage_description: damageRows.length ? damageRows.map((d) => `Schaden ${d.no}: ${d.description}`).join("\n") : null,
        additional_defects_at_return: b.known_defects,
      }).select("id").single();
      if (error) throw error;
      protocolId = row.id;
      await svc.from("b2b_return_protocol_items").insert(b.items.map((it) => ({ return_protocol_id: protocolId, product_name: it.name, quantity: it.quantity, description: it.detail })));
    }

    if (damageRows.length) {
      const rows = damageRows.map((d) => ({
        protocol_type: isReturn ? "return_protocol" : "delivery_note",
        delivery_note_id: isReturn ? null : protocolId, return_protocol_id: isReturn ? protocolId : null,
        b2b_profile_id: inq.b2b_profile_id ?? null, item_name: d.item_name, category: d.category, description: d.description,
        photo_urls: d.photoNos.map((n) => photoUrls[n - 1]), amount: d.amount, created_by: user.id,
      }));
      const { error } = await svc.from("b2b_protocol_damages").insert(rows);
      if (error) console.error("protocol damages insert", error);
      await mirrorDamagesToInventory(svc, {
        damages: damageRows.map((d) => ({ ...d, photo_urls: d.photoNos.map((n) => photoUrls[n - 1]) })),
        location: lk, protocolType: isReturn ? "return_protocol" : "delivery_note", protocolNumber: number, profileId: inq.b2b_profile_id ?? null,
      });
    }

    // E-Mail mit PDF an den Kunden (Kopie an den Standort)
    let emailSent = false;
    const recipient: string | null = inq.customer_email || null;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (b.send_email && recipient && resendKey) {
      const title = isReturn ? "R\u00FCckgabeprotokoll" : "\u00DCbergabeprotokoll";
      const greeting = inq.customer_name ? `Hallo ${esc(inq.customer_name)},` : "Guten Tag,";
      const html = `<!DOCTYPE html><html lang="de"><body style="margin:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2328;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;">
<div style="padding:24px 32px;text-align:center;border-bottom:3px solid #00507d;"><img src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png" alt="SLT-Rental" style="height:64px;width:auto;"></div>
<div style="padding:28px 32px;font-size:15px;line-height:1.55;">
<p>${greeting}</p>
<p>anbei erh\u00E4ltst du das ${title} <strong>${esc(number)}</strong> vom ${esc(berlin(now))} als PDF.</p>
<ul style="padding-left:18px;">${b.items.map((it) => `<li>${it.quantity} \u00D7 ${esc(it.name)}</li>`).join("")}</ul>
${damageRows.length ? `<p style="color:#b91c1c;"><strong>${damageRows.length} Schaden/Sch\u00E4den dokumentiert</strong> \u2013 Details und Fotos findest du im PDF.</p>` : ""}
<p>Bei Fragen erreichst du uns unter ${esc(loc.phone)} oder ${esc(loc.email)}.</p>
<p>Viele Gr\u00FC\u00DFe<br>dein Team von SLT-Rental ${esc(loc.name)}</p>
</div></div></body></html>`;
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`,
            to: [recipient], bcc: [loc.email], reply_to: loc.email,
            subject: `Dein ${title} ${number} \u2013 SLT-Rental`,
            html,
            attachments: [{ filename: fileName, content: encodeBase64(pdf), content_type: "application/pdf" }],
          }),
        });
        emailSent = res.ok;
        if (!res.ok) console.error("Resend", res.status, await res.text());
      } catch (e) { console.error("E-Mail", e); }
      if (emailSent) {
        await svc.from(isReturn ? "b2b_return_protocols" : "b2b_delivery_notes").update({ email_sent: true, email_sent_at: new Date().toISOString() }).eq("id", protocolId);
      }
    }

    return json({ success: true, id: protocolId, number, file_url: fileUrl, email_sent: emailSent, recipient, photos: storedPhotos.length });
  } catch (e) {
    console.error("generate-rental-protocol", e);
    return json({ error: (e as Error).message || "Protokoll konnte nicht erstellt werden." }, 500);
  }
});
