/**
 * Phase A3 — extracted types + pure helpers from AdminCreateOfferDialog.tsx.
 *
 * Pure module: no React, no Supabase, no side effects beyond the in-memory
 * draft store. Behavior is identical to the original inline definitions.
 *
 * The draft store keeps offer-form values alive across dialog open/close so
 * an admin doesn't lose typed input when they briefly navigate away.
 */
import { locations } from "@/data/rentalData";

/** Look up product description (e.g. "Ladefläche: 200 x 108 x 30 cm") from rental data */
export function getProductDescription(productName: string): string {
  for (const loc of locations) {
    for (const products of Object.values(loc.products)) {
      for (const p of products) {
        if (p.name === productName) return p.description || "";
      }
    }
  }
  return "";
}

const normalizeProductName = (value: string) =>
  value.toLowerCase().replace(/\s+/g, " ").replace(/[^a-z0-9äöüß ,.-]/g, "").trim();

/**
 * Resolve category slug from product name for edit/reload flows.
 * Falls back to a normalized comparison so slightly different spellings
 * (extra spaces, casing) still resolve — a missing category silently zeroes
 * percentage-based additional services (MBV etc.).
 */
export function getProductCategorySlug(productName: string): string | undefined {
  if (!productName) return undefined;
  for (const loc of locations) {
    for (const [categorySlug, products] of Object.entries(loc.products)) {
      if (products.some((p) => p.name === productName)) return categorySlug;
    }
  }
  const normalized = normalizeProductName(productName);
  if (!normalized) return undefined;
  for (const loc of locations) {
    for (const [categorySlug, products] of Object.entries(loc.products)) {
      if (products.some((p) => normalizeProductName(p.name) === normalized)) return categorySlug;
    }
  }
  return undefined;
}

// ─── Types shared between AdminCreateOfferDialog and its consumers ───

export interface Reservation {
  id: string;
  product_name: string | null;
  product_id: string;
  location: string;
  start_date: string;
  end_date: string | null;
  quantity: number;
  status: string;
  original_price: number | null;
  discounted_price: number | null;
  b2b_profile_id: string;
  notes: string | null;
  category_slug?: string | null;
  additional_services?: any;
  deposit?: number | null;
  rental_group_id?: string | null;
}

export interface B2BProfile {
  id: string;
  company_name: string;
  tax_id?: string | null;
  vat_id_verified?: boolean;
}

export interface OfferItemInput {
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  rental_start?: string;
  rental_end?: string;
  start_time?: string;
  end_time?: string;
  category_slug?: string;
}

export interface ExistingOffer {
  id: string;
  offer_number: string;
  reservation_id: string | null;
  delivery_cost: number;
  notes: string | null;
  b2b_profile_id: string;
  deposit?: number | null;
  additional_services?: any;
  issuing_location?: string | null;
  return_location?: string | null;
}

export interface ExistingOfferItem {
  product_name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  rental_start?: string | null;
  rental_end?: string | null;
}

// ─── Module-level draft storage (survives component unmount/remount) ───

export interface OfferFormDraft {
  items: OfferItemInput[];
  deliveryCostDelivery: number;
  deliveryCostReturn: number;
  includeReturn: boolean;
  validDays: number;
  notes: string;
  sendEmail: boolean;
  deposit: string;
  selectedServices: string[];
  customServicePrices: Record<string, number>;
  customServicePercents?: Record<string, number>;
  issuingLocation: string;
  returnLocation: string;
  selectedProfileId: string;
  deliveryAddressStreet: string;
  deliveryAddressPostalCode: string;
  deliveryAddressCity: string;
  paymentTerms: string;
}

export const offerDraftStore: { key: string | null; data: OfferFormDraft | null } = {
  key: null,
  data: null,
};
