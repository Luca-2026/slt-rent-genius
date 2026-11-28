/**
 * Server-side location scope for financial staff actions (refunds, credits, deposits).
 * Mirrors public.slt_normalize_location / slt_stock_location (Mülheim stays separate) and the
 * existing SQL rule used by reserve_order_refund / confirm_order_refund_manual:
 * can_edit_operations AND (admin OR an active staff_profile at the record's location).
 * The location is always read from the authoritative record, never from request input.
 */
export class FinanceScopeError extends Error { status = 403; }

export function normalizeFinanceLocation(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const v = raw.toLowerCase();
  if (v.includes("bonn")) return "bonn";
  if (v.includes("lheim") || v.includes("mulheim")) return "muelheim";
  if (v.includes("krefeld")) return "krefeld";
  return v.trim();
}

export type FinanceActor = { admin: boolean; manager: boolean; canEdit: boolean; locations: string[] };

export async function loadFinanceActor(service: any, actor: string): Promise<FinanceActor> {
  const [admin, manager, canEdit, staff] = await Promise.all([
    service.rpc("has_role", { _user_id: actor, _role: "admin" }),
    service.rpc("has_role", { _user_id: actor, _role: "niederlassungsleiter" }),
    service.rpc("can_edit_operations", { _user_id: actor }),
    service.from("staff_profiles").select("location").eq("user_id", actor).eq("is_active", true),
  ]);
  if (admin.error || manager.error || canEdit.error || staff.error) throw new FinanceScopeError("Berechtigung konnte nicht geprüft werden.");
  const rows = Array.isArray(staff.data) ? staff.data : staff.data ? [staff.data] : [];
  const locations = [...new Set(rows.map((r: { location?: unknown }) => normalizeFinanceLocation(r.location)).filter(Boolean) as string[])];
  return { admin: admin.data === true, manager: manager.data === true, canEdit: canEdit.data === true, locations };
}

/** Throws before any side effect when the actor may not act on this location. */
export function assertFinanceLocation(scope: FinanceActor, rawLocation: unknown, opts: { requireManager?: boolean } = {}) {
  if (!scope.canEdit) throw new FinanceScopeError("Keine Berechtigung für Finanzaktionen.");
  if (opts.requireManager && !scope.admin && !scope.manager) throw new FinanceScopeError("Nur Admin oder Niederlassungsleitung dürfen diese Erstattung bearbeiten.");
  if (scope.admin) return; // central admin role = explicit cross-location permission
  const location = normalizeFinanceLocation(rawLocation);
  if (!location) throw new FinanceScopeError("Standort des Auftrags ist nicht eindeutig zugeordnet. Bitte durch einen Admin klären lassen.");
  if (!scope.locations.length) throw new FinanceScopeError("Deinem Profil ist kein aktiver Standort zugeordnet. Bitte durch einen Admin zuordnen lassen.");
  if (!scope.locations.includes(location)) throw new FinanceScopeError("Keine Standortberechtigung für diesen Auftrag.");
}

/** Authoritative order location for a rental or sales inquiry. */
export async function inquiryLocation(service: any, table: "rental_inquiries" | "sales_inquiries", id: string): Promise<string | null> {
  const { data, error } = await service.from(table).select("location").eq("id", id).maybeSingle();
  if (error) throw new FinanceScopeError("Auftrag konnte nicht geprüft werden.");
  if (!data) throw new FinanceScopeError("Auftrag nicht gefunden.");
  return data.location ?? null;
}

/** Invoice/credit location: linked order wins; a conflicting invoice location is ambiguous. */
export async function invoiceLocation(service: any, invoiceId: string): Promise<string | null> {
  const { data, error } = await service.from("inquiry_invoices").select("location,rental_inquiry_id,sales_inquiry_id").eq("id", invoiceId).maybeSingle();
  if (error) throw new FinanceScopeError("Beleg konnte nicht geprüft werden.");
  if (!data) throw new FinanceScopeError("Beleg nicht gefunden.");
  const order = data.rental_inquiry_id ? await inquiryLocation(service, "rental_inquiries", data.rental_inquiry_id)
    : data.sales_inquiry_id ? await inquiryLocation(service, "sales_inquiries", data.sales_inquiry_id) : null;
  const a = normalizeFinanceLocation(order), b = normalizeFinanceLocation(data.location);
  if (a && b && a !== b) return null; // ambiguous → handled as unassigned
  return a ?? b;
}

/** Payment link → its order's location (rental or sales only). */
export async function paymentLinkLocation(service: any, link: { inquiry_table?: string; inquiry_id?: string }): Promise<string | null> {
  if (link.inquiry_table !== "rental_inquiries" && link.inquiry_table !== "sales_inquiries") return null;
  if (!link.inquiry_id) return null;
  return inquiryLocation(service, link.inquiry_table, link.inquiry_id);
}
