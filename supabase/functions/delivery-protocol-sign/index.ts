import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { PDFDocument, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { decodeBase64, encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { requestDeliverySignature, signatureTokenHash } from "../_shared/delivery-signature.ts";
import { documentEmailRecipients } from "../_shared/test-email-routing.ts";
import { berlin } from "../generate-rental-protocol/pdf.ts";
import { codedSubject } from "../_shared/order-code.ts";

const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  try {
    const b = await req.json();
    const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    let note: any;
    let hash = "";
    if (b.action === "request") {
      const auth = req.headers.get("Authorization")?.replace(/^Bearer /, "") ?? "";
      const { data: { user } } = await svc.auth.getUser(auth);
      if (!user) return json({ error: "Nicht angemeldet." }, 401);
      const { data: allowed } = await svc.rpc("can_edit_operations", { _user_id: user.id });
      if (!allowed) return json({ error: "Keine Berechtigung." }, 403);
      const { data } = await svc.from("b2b_delivery_notes").select("*").eq("id", b.id).maybeSingle();
      note = data;
    } else {
      if (typeof b.token !== "string" || !/^[a-f0-9]{64}$/.test(b.token)) return json({ error: "Ungültiger Link." }, 404);
      hash = await signatureTokenHash(b.token);
      const { data: link } = await svc.from("delivery_signature_links").select("*").eq("token_hash", hash).maybeSingle();
      if (!link || new Date(link.expires_at).getTime() <= Date.now()) return json({ error: "Link ungültig oder abgelaufen." }, 404);
      const { data } = await svc.from("b2b_delivery_notes").select("*").eq("id", link.delivery_note_id).maybeSingle();
      note = data;
    }
    if (!note?.rental_inquiry_id) return json({ error: "Protokoll nicht gefunden." }, 404);
    const { data: inquiry } = await svc.from("rental_inquiries").select("*").eq("id", note.rental_inquiry_id).single();
    if (!inquiry) return json({ error: "Auftrag nicht gefunden." }, 404);
    const signedAt = note.customer_signed_at ?? note.protocol_data?.customer_signed_at ?? (note.signature_data ? note.signed_at : null);
    if (b.action === "info") return json({ number: note.delivery_note_number, order_code: inquiry.order_code, name: inquiry.customer_name, items: note.protocol_data?.items ?? [], file_url: note.file_url, signed_at: signedAt, signer: note.protocol_data?.customer_signer_name });
    if (note.signature_data || !["signed_staff_only", "pending_customer_signature"].includes(note.status)) return json({ error: "Protokoll bereits unterschrieben." }, 409);
    const path = note.protocol_data?.pdf_path;
    if (!path) return json({ error: "Protokoll-PDF fehlt." }, 409);
    const { data: original, error: downloadError } = await svc.storage.from("b2b-invoices").download(path);
    if (downloadError || !original) throw new Error("Protokoll-PDF konnte nicht geladen werden.");
    const originalBytes = new Uint8Array(await original.arrayBuffer());
    if (b.action === "request") {
      await requestDeliverySignature(svc, note, inquiry, originalBytes);
      return json({ success: true });
    }
    if (b.action !== "sign" || typeof b.signer !== "string" || b.signer.trim().length < 2 || b.signer.length > 120 || b.agb_accepted !== true || b.items_confirmed !== true || typeof b.signature !== "string" || !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(b.signature) || b.signature.length > 600000) return json({ error: "Name, Unterschrift und beide Bestätigungen sind erforderlich." }, 400);
    const time = new Date();
    const doc = await PDFDocument.load(originalBytes);
    const image = await doc.embedPng(decodeBase64(b.signature.split(",")[1]));
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([595.28, 841.89]);
    const safe = (s: string) => s.replace(/[^\x20-\x7e\xa0-\xff]/g, "");
    page.drawText(`Nachträgliche Kundenunterschrift ${note.delivery_note_number}`, { x: 50, y: 760, size: 15, font });
    page.drawText(`Auftrag #${inquiry.order_code ?? ""}`, { x: 50, y: 730, size: 11, font });
    page.drawText("Die Angaben und Artikel des beigefügten Übergabeprotokolls", { x: 50, y: 690, size: 11, font });
    page.drawText("werden bestätigt. Die AGB wurden zur Kenntnis genommen.", { x: 50, y: 672, size: 11, font });
    page.drawText(`Unterzeichnet von: ${safe(b.signer.trim())}`, { x: 50, y: 620, size: 11, font });
    page.drawText(`Digital unterschrieben am: ${berlin(time)}`, { x: 50, y: 598, size: 11, font });
    const scale = Math.min(400 / image.width, 140 / image.height);
    page.drawImage(image, { x: 50, y: 410, width: image.width * scale, height: image.height * scale });
    const pdf = await doc.save();
    const newPath = `protocols/${inquiry.id}/signed-${note.id}-${crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await svc.storage.from("b2b-invoices").upload(newPath, pdf, { contentType: "application/pdf", upsert: false });
    if (uploadError) throw uploadError;
    const { data: urlData } = await svc.storage.from("b2b-invoices").createSignedUrl(newPath, 365 * 86400);
    if (!urlData?.signedUrl) throw new Error("PDF-Link konnte nicht erzeugt werden.");
    const { error } = await svc.rpc("complete_delivery_signature", { _token_hash: hash, _signature: b.signature, _signer: b.signer.trim(), _file_url: urlData.signedUrl, _pdf_path: newPath, _signed_at: time.toISOString() });
    if (error) { await svc.storage.from("b2b-invoices").remove([newPath]); return json({ error: "Unterschrift bereits gespeichert oder Link nicht mehr gültig." }, 409); }
    let emailSent = false;
    const key = Deno.env.get("RESEND_API_KEY");
    if (key && inquiry.customer_email) {
      const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({
        from: `SLT-Rental <noreply@${Deno.env.get("RESEND_DOMAIN") || "slt-rental.de"}>`, ...documentEmailRecipients(inquiry.customer_email),
        subject: await codedSubject(svc, `Unterschriebenes Übergabeprotokoll ${note.delivery_note_number}`, { table: "rental_inquiries", id: inquiry.id }),
        html: `<p>Vielen Dank für die digitale Unterschrift. Das unterschriebene Übergabeprotokoll ist als PDF beigefügt.</p>`,
        attachments: [{ filename: note.file_name, content: encodeBase64(pdf), content_type: "application/pdf" }],
      }) });
      emailSent = response.ok;
    }
    return json({ success: true, signed_at: time.toISOString(), email_sent: emailSent });
  } catch { return json({ error: "Vorgang konnte nicht abgeschlossen werden. Bitte erneut versuchen." }, 500); }
});