/**
 * Verkaufsartikel-Katalog (Neu- und Gebrauchtartikel) für CMS und Angebote.
 *
 * Neuartikel liegen in `new_machines` (Bruttopreise inkl. MwSt.),
 * Gebrauchtartikel in `used_machines` (Nettopreise).
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SalesArticleKind = "new" | "used";

export interface NewMachineRow {
  id: string;
  slug: string;
  brand: string;
  model: string;
  name: string;
  article_number: string | null;
  gtin: string | null;
  category: string;
  short_description: string | null;
  description: string | null;
  specifications: Record<string, unknown> | null;
  content: Record<string, unknown> | null;
  images: string[] | null;
  showroom_locations: string[] | null;
  price_gross: number | null;
  compare_at_price: number | null;
  vat_rate: number;
  price_on_request: boolean;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UsedMachineRow {
  id: string;
  slug: string | null;
  category: string;
  manufacturer: string;
  model: string;
  year: number | null;
  hours: number | null;
  price_net: number | null;
  price_on_request: boolean | null;
  description: string | null;
  specifications: Record<string, unknown> | null;
  content: Record<string, unknown> | null;
  images: string[] | null;
  status: string;
  reference_number: string | null;
  location: string | null;
  is_featured: boolean | null;
  created_at: string;
  updated_at: string;
}

/** Vereinheitlichte Sicht für Auswahl-Comboboxen und Angebote. */
export interface SalesCatalogItem {
  id: string;
  kind: SalesArticleKind;
  slug: string;
  /** Anzeigename inkl. Hersteller */
  name: string;
  category: string;
  article_number: string | null;
  image: string | null;
  /** Nettopreis in EUR (Neuartikel: aus Brutto gerechnet) */
  net_price: number | null;
  price_on_request: boolean;
  location: string | null;
  year: number | null;
  hours: number | null;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Bruttopreis → Nettopreis (Standard 19 % MwSt.). */
export function grossToNet(gross: number | null | undefined, vatRate = 19): number | null {
  if (gross == null || !Number.isFinite(Number(gross))) return null;
  const rate = Number.isFinite(Number(vatRate)) && Number(vatRate) > 0 ? Number(vatRate) : 19;
  return round2(Number(gross) / (1 + rate / 100));
}

export function firstImage(images: string[] | null | undefined): string | null {
  const list = (images ?? []).filter(Boolean).map(String).filter((i) => !i.toLowerCase().includes("placeholder"));
  if (!list.length) return null;
  return list.find((i) => /\.(jpe?g|png)(\?|$)/i.test(i)) ?? list[0];
}

export function newMachineToCatalogItem(m: NewMachineRow): SalesCatalogItem {
  return {
    id: m.id,
    kind: "new",
    slug: m.slug,
    name: [m.brand, m.model].filter(Boolean).join(" ") || m.name,
    category: m.category,
    article_number: m.article_number,
    image: firstImage(m.images),
    net_price: m.price_on_request ? null : grossToNet(m.price_gross, m.vat_rate),
    price_on_request: Boolean(m.price_on_request),
    location: (m.showroom_locations ?? [])[0] ?? null,
    year: null,
    hours: null,
  };
}

export function usedMachineToCatalogItem(m: UsedMachineRow): SalesCatalogItem {
  return {
    id: m.id,
    kind: "used",
    slug: m.slug ?? m.id,
    name: [m.manufacturer, m.model].filter(Boolean).join(" "),
    category: m.category,
    article_number: m.reference_number,
    image: firstImage(m.images),
    net_price: m.price_on_request ? null : (m.price_net != null ? round2(Number(m.price_net)) : null),
    price_on_request: Boolean(m.price_on_request),
    location: m.location,
    year: m.year,
    hours: m.hours,
  };
}

/** Alle Verkaufsartikel für die CMS-Verwaltung (inkl. inaktiver Artikel). */
export function useSalesCatalogAdmin() {
  const [newMachines, setNewMachines] = useState<NewMachineRow[]>([]);
  const [usedMachines, setUsedMachines] = useState<UsedMachineRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const [{ data: nm }, { data: um }] = await Promise.all([
      supabase.from("new_machines").select("*").order("sort_order").order("brand"),
      supabase.from("used_machines").select("*").order("manufacturer"),
    ]);
    setNewMachines((nm as unknown as NewMachineRow[] | null) ?? []);
    setUsedMachines((um as unknown as UsedMachineRow[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { newMachines, usedMachines, loading, reload };
}

let catalogCache: SalesCatalogItem[] | null = null;
let catalogPromise: Promise<SalesCatalogItem[]> | null = null;

/** Verkaufsartikel-Katalog für Angebots-/Anfrage-Auswahl (nur sichtbare Artikel). */
export async function loadSalesCatalog(): Promise<SalesCatalogItem[]> {
  if (catalogCache) return catalogCache;
  if (!catalogPromise) {
    catalogPromise = (async () => {
      const [{ data: nm }, { data: um }] = await Promise.all([
        supabase.from("new_machines").select("*").eq("is_active", true),
        supabase.from("used_machines").select("*").in("status", ["available", "reserved"]),
      ]);
      const items = [
        ...((nm as unknown as NewMachineRow[] | null) ?? []).map(newMachineToCatalogItem),
        ...((um as unknown as UsedMachineRow[] | null) ?? []).map(usedMachineToCatalogItem),
      ].sort((a, b) => a.name.localeCompare(b.name, "de"));
      catalogCache = items;
      return items;
    })();
  }
  return catalogPromise;
}

/** Cache verwerfen, z. B. nachdem im CMS gespeichert wurde. */
export function invalidateSalesCatalog() {
  catalogCache = null;
  catalogPromise = null;
}

export function useSalesCatalog() {
  const [items, setItems] = useState<SalesCatalogItem[]>(catalogCache ?? []);
  const [loading, setLoading] = useState(!catalogCache);

  useEffect(() => {
    let cancelled = false;
    loadSalesCatalog().then((list) => {
      if (cancelled) return;
      setItems(list);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading };
}
