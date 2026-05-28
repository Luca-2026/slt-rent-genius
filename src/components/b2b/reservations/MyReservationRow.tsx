/**
 * Phase A2 Schritt 3 — extracted from MyReservations.tsx.
 *
 * Pure presentational pieces for a single reservation row (desktop table) and
 * the corresponding mobile card. No data fetching, no auth, no state owned
 * here. All data + callbacks flow through props so behavior is 1:1 identical
 * to the previous inline implementation in MyReservations.tsx.
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Calendar, MapPin, RefreshCw, Download, Send, PenTool, LogOut, Trash2,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  statusConfig, locationLabels,
  type Reservation, type Offer,
} from "./reservationUtils";
import { openInvoiceInNewWindow } from "@/utils/invoiceViewer";

const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });
const formatCurrency = (n: number) =>
  n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

interface OfferActionsProps {
  offer: Offer;
  acceptingOfferId: string | null;
  onAcceptOffer: (offer: Offer) => void;
}

/** Inline offer info + actions (PDF / Annehmen / Bestätigt-Badge). */
export function OfferActions({ offer, acceptingOfferId, onAcceptOffer }: OfferActionsProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-primary">{offer.offer_number}</p>
      <p className="text-xs text-muted-foreground">
        {formatCurrency(offer.gross_amount)} brutto
        {offer.valid_until && ` · bis ${formatDate(offer.valid_until)}`}
      </p>
      <div className="flex items-center gap-1.5">
        {offer.file_url && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => openInvoiceInNewWindow(offer.file_url!, offer.offer_number)}
            className="h-7 text-xs px-2"
          >
            <Download className="h-3 w-3 mr-1" />
            PDF
          </Button>
        )}
        {offer.status === "sent" && (
          <Button
            size="sm"
            className="h-7 text-xs px-2 bg-accent text-accent-foreground hover:bg-cta-orange-hover"
            onClick={() => onAcceptOffer(offer)}
            disabled={acceptingOfferId === offer.id}
          >
            {acceptingOfferId === offer.id ? (
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <PenTool className="h-3 w-3 mr-1" />
            )}
            Annehmen
          </Button>
        )}
        {offer.status === "accepted" && (
          <Badge variant="default" className="text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Bestätigt
          </Badge>
        )}
      </div>
    </div>
  );
}

interface ReservationRowProps {
  reservation: Reservation;
  offer?: Offer;
  isSubRow?: boolean;
  acceptingOfferId: string | null;
  returningId: string | null;
  deletingId: string | null;
  onAcceptOffer: (offer: Offer) => void;
  onReturnDevice: (reservation: Reservation) => void;
  onDeleteReservation: (reservation: Reservation) => void;
}

/** Desktop table row for a single reservation. */
export function ReservationRow({
  reservation: r, offer, isSubRow = false,
  acceptingOfferId, returningId, deletingId,
  onAcceptOffer, onReturnDevice, onDeleteReservation,
}: ReservationRowProps) {
  const cfg = statusConfig[r.status] || statusConfig.pending;
  const StatusIcon = cfg.icon;

  return (
    <TableRow className={isSubRow ? "bg-muted/30" : ""}>
      <TableCell className={isSubRow ? "pl-10" : ""}>
        <div>
          <p className="font-medium">{r.product_name || r.product_id}</p>
          {r.category_slug && (
            <p className="text-xs text-muted-foreground">{r.category_slug}</p>
          )}
        </div>
      </TableCell>
      <TableCell>{locationLabels[r.location] || r.location}</TableCell>
      <TableCell>
        <div className="text-sm">
          <p>{formatDate(r.start_date)}</p>
          {r.end_date && (
            <p className="text-muted-foreground">bis {formatDate(r.end_date)}</p>
          )}
        </div>
      </TableCell>
      <TableCell className="text-center">{r.quantity}</TableCell>
      <TableCell>
        <Badge variant={cfg.variant} className="flex items-center gap-1 w-fit">
          <StatusIcon className="h-3 w-3" />
          {cfg.label}
        </Badge>
      </TableCell>
      <TableCell>
        {offer ? (
          <OfferActions
            offer={offer}
            acceptingOfferId={acceptingOfferId}
            onAcceptOffer={onAcceptOffer}
          />
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(r.created_at)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center gap-1.5 justify-end">
          {r.status === "confirmed" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReturnDevice(r)}
              disabled={returningId === r.id}
            >
              {returningId === r.id ? (
                <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5 mr-1" />
              )}
              Freimelden
            </Button>
          )}
          {r.status === "pending" && (
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteReservation(r);
              }}
              disabled={deletingId === r.id}
            >
              {deletingId === r.id ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

interface ReservationMobileCardProps {
  reservation: Reservation;
  offer?: Offer;
  acceptingOfferId: string | null;
  returningId: string | null;
  deletingId: string | null;
  onAcceptOffer: (offer: Offer) => void;
  onReturnDevice: (reservation: Reservation) => void;
  onDeleteReservation: (reservation: Reservation) => void;
}

/** Mobile card for a single reservation. */
export function ReservationMobileCard({
  reservation: r, offer,
  acceptingOfferId, returningId, deletingId,
  onAcceptOffer, onReturnDevice, onDeleteReservation,
}: ReservationMobileCardProps) {
  const cfg = statusConfig[r.status] || statusConfig.pending;
  const StatusIcon = cfg.icon;

  return (
    <div className="space-y-2 py-2 border-b border-border last:border-0">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-sm">{r.product_name || r.product_id}</p>
          <p className="text-xs text-muted-foreground">{r.category_slug}</p>
        </div>
        <Badge variant={cfg.variant} className="flex items-center gap-1 text-xs">
          <StatusIcon className="h-3 w-3" />
          {cfg.label}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {locationLabels[r.location] || r.location}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(r.start_date)}
          {r.end_date && ` – ${formatDate(r.end_date)}`}
        </div>
      </div>
      {offer && (
        <div className="bg-primary/5 rounded-lg p-2">
          <OfferActions
            offer={offer}
            acceptingOfferId={acceptingOfferId}
            onAcceptOffer={onAcceptOffer}
          />
        </div>
      )}
      {r.status === "confirmed" && (
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => onReturnDevice(r)}
          disabled={returningId === r.id}
        >
          {returningId === r.id ? (
            <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Wird freigemeldet...</>
          ) : (
            <><LogOut className="h-3.5 w-3.5 mr-1.5" />Gerät freimelden</>
          )}
        </Button>
      )}
      {r.status === "pending" && (
        <Button
          size="sm"
          variant="destructive"
          className="w-full"
          onClick={() => onDeleteReservation(r)}
          disabled={deletingId === r.id}
        >
          {deletingId === r.id ? (
            <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Wird gelöscht...</>
          ) : (
            <><Trash2 className="h-3.5 w-3.5 mr-1.5" />Anfrage löschen</>
          )}
        </Button>
      )}
    </div>
  );
}
