const esc = (value: unknown) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const de = (d: string | null | undefined) => d ? d.split("-").reverse().join(".") : "–";
type Booking = { snapshot?: { request?: { permitValidFromTime?: string; permitValidUntilTime?: string } }; package: string; quantity: number; location: string; start_date: string; end_date: string; start_time?: string | null; end_time?: string | null; permit_mode?: string | null; permit_valid_from?: string | null; permit_valid_until?: string | null; permit_issued_on?: string | null; total_cents: number };
type Inquiry = { order_code: string; offer_number?: string | null; customer_name?: string | null; company_name?: string | null; customer_email?: string | null; customer_phone?: string | null; delivery_street?: string | null; delivery_postal_code?: string | null; delivery_city?: string | null; message?: string | null };
/** Internal new-booking notice for the location mailbox; subject carries the booking reference. */
export function signStaffNotice(b: Booking, inq: Inquiry, link: string, permitAttached: boolean) {
  const subject = `Neue Buchung Halteverbotsschilder #${inq.order_code}`;
  const pkg = b.package === "sorglos" ? `Rundum-sorglos-Paket${b.permit_mode === "existing" ? " (Genehmigung vorhanden)" : b.permit_mode === "slt" ? " (Genehmigung durch SLT)" : ""}` : "Standard – Selbstabholung";
  const permit = b.package === "standard"
    ? (b.permit_valid_from ? `Schilder bekleben für: <strong>${de(b.permit_valid_from)}${b.snapshot?.request?.permitValidFromTime ? ` ${esc(b.snapshot.request.permitValidFromTime)} Uhr` : ""} – ${de(b.permit_valid_until)}${b.snapshot?.request?.permitValidUntilTime ? ` ${esc(b.snapshot.request.permitValidUntilTime)} Uhr` : ""}</strong> · Genehmigung vom ${de(b.permit_issued_on)}` : "Genehmigungszeitraum nicht angegeben – beim Kunden erfragen.")
    : permitAttached ? "Genehmigung ist angehängt." : b.permit_mode === "slt" ? "Genehmigung muss durch SLT beantragt werden." : "Keine Genehmigung hochgeladen.";
  const rows: [string, string][] = [
    ["Buchungsreferenz", `#${esc(inq.order_code)}${inq.offer_number ? ` · ${esc(inq.offer_number)}` : ""}`],
    ["Paket", esc(pkg)], ["Menge", `${b.quantity} Sets`], ["Standort", b.location === "bonn" ? "Bonn" : "Krefeld"],
    ["Mietzeitraum", `${de(b.start_date)} ${esc(b.start_time ?? "")} – ${de(b.end_date)} ${esc(b.end_time ?? "")}`],
    ["Genehmigung", permit], ["Bezahlt", new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(b.total_cents / 100)],
    ["Kunde", esc([inq.company_name, inq.customer_name].filter(Boolean).join(" · "))], ["Kontakt", esc([inq.customer_phone, inq.customer_email].filter(Boolean).join(" · "))],
  ];
  if (b.package === "sorglos") rows.push(["Aufstelladresse", esc([inq.delivery_street, inq.delivery_postal_code, inq.delivery_city].filter(Boolean).join(", "))]);
  if (inq.message) rows.push(["Kommentar", esc(inq.message)]);
  const html = `<p>Eine neue Halteverbots-Buchung ist vollständig bezahlt eingegangen. Die Aufgabe wurde im B2B-Portal angelegt.</p><table cellpadding="4" style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="vertical-align:top;color:#555">${k}</td><td>${v}</td></tr>`).join("")}</table><p><a href="${esc(link)}">Auftrag im B2B-Portal öffnen</a></p>`;
  return { subject, html };
}
