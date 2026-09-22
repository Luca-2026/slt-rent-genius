/**
 * Spiegelt Protokollschäden in die zentrale Schadensverwaltung
 * (`b2b_inventory_damages`). Dort entstehen daraus – je nach Einstufung –
 * automatisch Reparaturaufgaben und Bestandsabzüge.
 */

export interface MirrorDamageInput {
  item_name: string | null;
  category: string;
  description: string | null;
  amount: number | null;
  photo_urls: string[];
  needs_repair?: boolean;
  reduces_stock?: boolean;
  quantity?: number;
}

const LOCATION_KEYS = ["krefeld", "bonn", "muelheim"];

export function normalizeLocationKey(raw: string | null | undefined): string {
  const value = (raw ?? "").toLowerCase();
  if (value.includes("bonn")) return "bonn";
  if (value.includes("lheim") || value.includes("mulheim") || value.includes("muelheim")) return "muelheim";
  if (value.includes("krefeld")) return "krefeld";
  return LOCATION_KEYS.includes(value) ? value : "krefeld";
}

/**
 * Legt für jeden Schaden einen Eintrag in der Schadensverwaltung an.
 * Fehler werden protokolliert, brechen die Protokollerstellung aber nie ab.
 */
export async function mirrorDamagesToInventory(
  serviceClient: {
    from: (table: string) => any;
  },
  params: {
    damages: MirrorDamageInput[];
    location: string | null | undefined;
    protocolType: "delivery_note" | "return_protocol";
    protocolNumber: string | null;
    profileId: string | null;
  },
): Promise<void> {
  const relevant = params.damages.filter((d) => d.needs_repair || d.reduces_stock);
  if (relevant.length === 0) return;

  const location = normalizeLocationKey(params.location);

  // Artikelnamen auf CMS-Slugs mappen, damit der Bestand gebucht werden kann.
  const names = Array.from(new Set(relevant.map((d) => (d.item_name || "").trim()).filter(Boolean)));
  const slugByName = new Map<string, string>();
  if (names.length > 0) {
    const { data } = await serviceClient
      .from("b2b_managed_products")
      .select("slug,name")
      .in("name", names);
    for (const row of (data ?? []) as { slug: string; name: string }[]) {
      slugByName.set(row.name.trim().toLowerCase(), row.slug);
    }
  }

  const rows = relevant.map((d) => ({
    product_slug: slugByName.get((d.item_name || "").trim().toLowerCase()) ?? null,
    product_name: d.item_name || "Unbenannter Artikel",
    location,
    category: d.category || "sonstiges",
    description: d.description,
    photo_urls: d.photo_urls ?? [],
    quantity: Math.max(1, Math.round(Number(d.quantity) || 1)),
    needs_repair: !!d.needs_repair,
    reduces_stock: !!d.reduces_stock,
    amount: d.amount,
    protocol_type: params.protocolType,
    protocol_number: params.protocolNumber,
    b2b_profile_id: params.profileId,
  }));

  const { error } = await serviceClient.from("b2b_inventory_damages").insert(rows);
  if (error) console.error("Inventory damage mirror error:", error);
}
