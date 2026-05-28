/**
 * Phase A2 — extracted dialogs from MyReservations.tsx.
 *
 * Three self-contained dialogs that previously bloated MyReservations.tsx by
 * ~140 lines. They receive all state via props; no Supabase calls, no auth
 * logic, no business rules live here. The parent owns the data and the
 * action handlers — these components only render UI and forward events.
 */
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PenTool, RefreshCw, ThumbsUp, LogOut, Trash2,
} from "lucide-react";
import { SignaturePad } from "@/components/b2b/SignaturePad";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { Reservation, Offer } from "./reservationUtils";
import { locationLabels } from "./reservationUtils";

const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy", { locale: de });
const formatCurrency = (n: number) =>
  n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

// ─── Accept Offer + Signature ─────────────────────────────────────
export interface AcceptOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: Offer | null;
  signatureData: string | null;
  onSignatureChange: (data: string | null) => void;
  onAccept: () => void;
  acceptingOfferId: string | null;
}

export function AcceptOfferDialog({
  open, onOpenChange, offer, signatureData, onSignatureChange, onAccept, acceptingOfferId,
}: AcceptOfferDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) onSignatureChange(null);
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-primary" />
            Angebot annehmen & unterschreiben
          </DialogTitle>
          <DialogDescription>
            Bitte unterschreiben Sie das Angebot, um es verbindlich anzunehmen.
          </DialogDescription>
        </DialogHeader>
        {offer && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-primary">{offer.offer_number}</p>
                  <p className="text-lg font-bold">{formatCurrency(offer.gross_amount)}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Angebotsdatum: {formatDate(offer.offer_date)}
                  {offer.valid_until && ` · Gültig bis: ${formatDate(offer.valid_until)}`}
                </p>
              </CardContent>
            </Card>

            <SignaturePad
              onSignatureChange={onSignatureChange}
              height={180}
              label="Ihre Unterschrift"
            />

            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
              <p>
                Mit Ihrer Unterschrift nehmen Sie das Angebot verbindlich an. Das
                unterschriebene Angebot wird als PDF gespeichert.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>
              <Button
                className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                onClick={onAccept}
                disabled={acceptingOfferId === offer.id || !signatureData}
              >
                {acceptingOfferId === offer.id ? (
                  <><RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />Wird bestätigt...</>
                ) : (
                  <><ThumbsUp className="h-4 w-4 mr-1.5" />Angebot verbindlich annehmen</>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Return Device (Freimelden) ────────────────────────────────────
export interface ReturnDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation | null;
  onConfirm: () => void;
  returningId: string | null;
}

export function ReturnDeviceDialog({
  open, onOpenChange, reservation, onConfirm, returningId,
}: ReturnDeviceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-primary" />
            Gerät freimelden
          </DialogTitle>
          <DialogDescription>
            Möchten Sie dieses Mietgerät als zurückgegeben melden?
          </DialogDescription>
        </DialogHeader>
        {reservation && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-2">
                <p className="font-semibold">{reservation.product_name || reservation.product_id}</p>
                <p className="text-sm text-muted-foreground">
                  Standort: {locationLabels[reservation.location] || reservation.location}
                </p>
                <p className="text-sm text-muted-foreground">
                  Zeitraum: {formatDate(reservation.start_date)}
                  {reservation.end_date ? ` – ${formatDate(reservation.end_date)}` : ""}
                </p>
              </CardContent>
            </Card>

            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
              <p>
                Mit der Freimeldung wird der Mietvorgang beendet und unser Team über
                die Rückgabe informiert.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>
              <Button
                className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                onClick={onConfirm}
                disabled={returningId === reservation.id}
              >
                {returningId === reservation.id ? (
                  <><RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />Wird freigemeldet...</>
                ) : (
                  <><LogOut className="h-4 w-4 mr-1.5" />Gerät freimelden</>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Reservation (pending) ──────────────────────────────────
export interface DeleteReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation | null;
  onConfirm: () => void;
  deletingId: string | null;
}

export function DeleteReservationDialog({
  open, onOpenChange, reservation, onConfirm, deletingId,
}: DeleteReservationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Anfrage löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Möchtest du die Anfrage für „{reservation?.product_name || reservation?.product_id}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deletingId ? (
              <><RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />Wird gelöscht...</>
            ) : (
              <><Trash2 className="h-4 w-4 mr-1.5" />Löschen</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
