/**
 * Paket 4: gemeinsame Anrede für Angebots-PDF und -E-Mail.
 * Kunden werden standardmäßig geduzt; address_form = "sie" schaltet auf Sie.
 */
export type AddressForm = "du" | "sie";

export function normalizeAddressForm(v: unknown): AddressForm {
  return v === "sie" ? "sie" : "du";
}

export interface SalutationInput {
  address_form?: string | null;
  salutation?: string | null; // "herr" | "frau"
  name?: string | null;
}

export function salutationLine(k: SalutationInput): string {
  const words = String(k.name ?? "").trim().split(/\s+/).filter(Boolean);
  if (normalizeAddressForm(k.address_form) === "du") {
    return words.length ? `Hallo ${words[0]},` : "Hallo,";
  }
  const last = words[words.length - 1];
  if (last && k.salutation === "herr") return `Sehr geehrter Herr ${last},`;
  if (last && k.salutation === "frau") return `Sehr geehrte Frau ${last},`;
  return "Sehr geehrte Damen und Herren,";
}

/** Wählt den Text passend zur Anrede-Form (gleicher Inhalt, zwei Fassungen). */
export const byForm = (form: AddressForm, du: string, sie: string) => (form === "sie" ? sie : du);

/**
 * Paket 10: Anredeform für alle Kunden-E-Mails/-Dokumente auflösen.
 * Reihenfolge: Kundenakte (crm_customer_id) → Kundenakte über Portalprofil → Wert an der Anfrage → "du".
 */
export async function resolveAddressForm(
  svc: { from: (t: string) => any },
  src: { crm_customer_id?: string | null; b2b_profile_id?: string | null; address_form?: string | null },
): Promise<AddressForm> {
  try {
    if (src.crm_customer_id) {
      const { data } = await svc.from("crm_customers").select("address_form").eq("id", src.crm_customer_id).maybeSingle();
      if (data?.address_form) return normalizeAddressForm(data.address_form);
    }
    if (src.b2b_profile_id) {
      const { data } = await svc.from("crm_customers").select("address_form").eq("b2b_profile_id", src.b2b_profile_id).limit(1).maybeSingle();
      if (data?.address_form) return normalizeAddressForm(data.address_form);
    }
  } catch (_) { /* Fallback unten */ }
  return normalizeAddressForm(src.address_form);
}
