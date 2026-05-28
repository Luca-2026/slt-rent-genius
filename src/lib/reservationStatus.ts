/**
 * Phase A4 — Central reservation status definitions.
 *
 * Single source of truth for B2B reservation status values, their order in
 * the lifecycle, display labels, badge variants and icons. Replaces scattered
 * string literals like `r.status === "pending"` with a typed enum and helper
 * functions so a status rename only requires one edit.
 *
 * Pure module: no React rendering (the badge component lives in
 * reservationUtils.tsx). Safe to import from server-side / pure logic too.
 */
import { Clock, Send, CheckCircle2, XCircle } from "lucide-react";
import type { ComponentType } from "react";

/** Canonical status values stored in the `reservations.status` DB column. */
export const ReservationStatus = {
  Pending: "pending",
  OfferSent: "offer_sent",
  Confirmed: "confirmed",
  Cancelled: "cancelled",
  Completed: "completed",
} as const;

export type ReservationStatus =
  (typeof ReservationStatus)[keyof typeof ReservationStatus];

/**
 * Lifecycle order — earlier index = earlier in the rental flow.
 * Used to pick the "worst" (least progressed) status when displaying a group.
 */
export const RESERVATION_STATUS_ORDER: ReservationStatus[] = [
  ReservationStatus.Pending,
  ReservationStatus.OfferSent,
  ReservationStatus.Confirmed,
  ReservationStatus.Completed,
  ReservationStatus.Cancelled,
];

export interface ReservationStatusMeta {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: ComponentType<{ className?: string }>;
}

export const RESERVATION_STATUS_META: Record<ReservationStatus, ReservationStatusMeta> = {
  [ReservationStatus.Pending]:   { label: "Ausstehend",       variant: "secondary",   icon: Clock },
  [ReservationStatus.OfferSent]: { label: "Angebot erhalten", variant: "outline",     icon: Send },
  [ReservationStatus.Confirmed]: { label: "Bestätigt",        variant: "default",     icon: CheckCircle2 },
  [ReservationStatus.Cancelled]: { label: "Storniert",        variant: "destructive", icon: XCircle },
  [ReservationStatus.Completed]: { label: "Abgeschlossen",    variant: "outline",     icon: CheckCircle2 },
};

/** Type guard for unknown strings coming from the DB / API. */
export function isReservationStatus(value: unknown): value is ReservationStatus {
  return typeof value === "string" && value in RESERVATION_STATUS_META;
}

/** Human-readable label. Falls back to the raw string so we never hide data. */
export function getReservationStatusLabel(status: string): string {
  return isReservationStatus(status) ? RESERVATION_STATUS_META[status].label : status;
}

/**
 * Pick the status that is earliest in the lifecycle (used when grouping a
 * batch of reservations — the group's "worst" status drives the UI).
 */
export function pickWorstStatus(statuses: string[]): string {
  if (statuses.length === 0) return ReservationStatus.Pending;
  return statuses.reduce((worst, s) => {
    const wi = RESERVATION_STATUS_ORDER.indexOf(worst as ReservationStatus);
    const si = RESERVATION_STATUS_ORDER.indexOf(s as ReservationStatus);
    if (si === -1) return worst;
    if (wi === -1) return s;
    return si < wi ? s : worst;
  }, statuses[0]);
}

export const isPending   = (s: string) => s === ReservationStatus.Pending;
export const isOfferSent = (s: string) => s === ReservationStatus.OfferSent;
export const isConfirmed = (s: string) => s === ReservationStatus.Confirmed;
export const isCancelled = (s: string) => s === ReservationStatus.Cancelled;
export const isCompleted = (s: string) => s === ReservationStatus.Completed;
