import { useEffect, useState, useMemo } from "react";

import { supabase } from "@/integrations/supabase/client";
import { openInvoiceInNewWindow } from "@/utils/invoiceViewer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CalendarPlus, Check, ChevronDown, ChevronRight, ClipboardCheck,
  ClipboardList, Eye, Layers, MoreHorizontal, Package, Plus, Receipt,
  RefreshCw, Trash2,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";

// ─── Types ────────────────────────────────────────────
interface Reservation {
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
  created_at: string;
  rental_group_id?: string | null;
}

interface B2BProfile {
  id: string;
  company_name: string;
}

interface Offer {
  id: string;
  reservation_id: string | null;
}

interface DocumentInfo {
  id: string;
  file_url: string | null;
  number: string;
  reservation_id: string | null;
  offer_id?: string | null;
}

interface RentalGroup {
  key: string;
  reservations: Reservation[];
  isBatch: boolean;
}

interface Props {
  reservations: Reservation[];
  profiles: B2BProfile[];
  invoices: { id: string; file_url: string | null; invoice_number: string; reservation_id: string | null }[];
  offers: Offer[];
  onCreateReservation: () => void;
  onExtendReservation: (reservation: Reservation) => void;
  onGenerateInvoice: (reservation: Reservation) => void;
  onCreateDeliveryNote: (reservation: Reservation) => void;
  onCreateReturnProtocol: (reservation: Reservation) => void;
  onConfirmReservation: (reservation: Reservation) => void;
  confirmingId: string | null;
  onDelete: (reservationId: string) => void;
  hasInvoice: (reservationId: string) => boolean;
  hasReturnProtocol: (reservationId: string) => boolean;
  onRefresh: () => void;
}

// ─── Helpers ──────────────────────────────────────────
function groupReservations(reservations: Reservation[]): RentalGroup[] {
  const grouped = new Map<string, Reservation[]>();
  const ungrouped: Reservation[] = [];

  for (const res of reservations) {
    if (res.rental_group_id) {
      const existing = grouped.get(res.rental_group_id) || [];
      existing.push(res);
      grouped.set(res.rental_group_id, existing);
    } else {
      ungrouped.push(res);
    }
  }

  const result: RentalGroup[] = [];
  for (const [groupId, items] of grouped) {
    result.push({
      key: groupId,
      reservations: items.sort((a, b) => a.created_at.localeCompare(b.created_at)),
      isBatch: items.length > 1,
    });
  }
  for (const res of ungrouped) {
    result.push({ key: res.id, reservations: [res], isBatch: false });
  }

  return result.sort(
    (a, b) =>
      new Date(b.reservations[0].created_at).getTime() -
      new Date(a.reservations[0].created_at).getTime()
  );
}

const fmtDate = (d: string) => format(new Date(d), "dd.MM.yy", { locale: de });
const fmtCurrency = (n: number) =>
  n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

// ─── Main Component ───────────────────────────────────
export function AdminRentalsTab({
  reservations, profiles, invoices, offers,
  onCreateReservation, onExtendReservation, onGenerateInvoice,
  onCreateDeliveryNote, onCreateReturnProtocol, onConfirmReservation,
  confirmingId, onDelete, hasInvoice, hasReturnProtocol, onRefresh,
}: Props) {
  const isMobile = useIsMobile();
  const [deleteConfirmRes, setDeleteConfirmRes] = useState<Reservation | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState<DocumentInfo[]>([]);
  const [returnProtocols, setReturnProtocols] = useState<DocumentInfo[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchDocs = async () => {
      const [dnRes, rpRes] = await Promise.all([
        supabase.from("b2b_delivery_notes").select("id, file_url, delivery_note_number, reservation_id, offer_id"),
        supabase.from("b2b_return_protocols").select("id, file_url, return_protocol_number, reservation_id"),
      ]);
      if (dnRes.data) setDeliveryNotes(dnRes.data.map((d: any) => ({
        id: d.id, file_url: d.file_url, number: d.delivery_note_number,
        reservation_id: d.reservation_id, offer_id: d.offer_id,
      })));
      if (rpRes.data) setReturnProtocols(rpRes.data.map((r: any) => ({
        id: r.id, file_url: r.file_url, number: r.return_protocol_number,
        reservation_id: r.reservation_id,
      })));
    };
    fetchDocs();
  }, [reservations]);

  const groups = useMemo(() => groupReservations(reservations), [reservations]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isActive = (res: Reservation) => {
    if (res.status === "pending") return true;
    if (!res.end_date) return true;
    return new Date(res.end_date + "T23:59:59") >= today;
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // ─── Docs lookup ──────────────────────────────────────
  const getDocsForReservation = (resId: string) => {
    const inv = invoices.find((i) => i.reservation_id === resId);
    const offerIdsForRes = offers.filter((o) => o.reservation_id === resId).map((o) => o.id);
    const dn = deliveryNotes.find(
      (d) => d.reservation_id === resId || (d.offer_id && offerIdsForRes.includes(d.offer_id))
    );
    const rp = returnProtocols.find((r) => r.reservation_id === resId);
    return { invoice: inv, deliveryNote: dn, returnProtocol: rp };
  };

  // ─── Status badge ─────────────────────────────────────
  const getStatusBadge = (res: Reservation) => {
    if (res.status === "pending") {
      return <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50 text-xs">Offen</Badge>;
    }
    if (res.status === "completed") {
      return <Badge variant="secondary" className="text-xs">Beendet</Badge>;
    }
    if (isActive(res)) {
      return <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Aktiv</Badge>;
    }
    return <Badge variant="secondary" className="text-xs">Beendet</Badge>;
  };

  const getGroupStatus = (items: Reservation[]) => {
    const prio = ["pending", "offer_sent", "confirmed", "completed"];
    return items.reduce((worst, r) => {
      return prio.indexOf(r.status) < prio.indexOf(worst) ? r.status : worst;
    }, items[0].status);
  };

  const getGroupPrice = (items: Reservation[]) =>
    items.reduce((sum, r) => sum + (r.discounted_price ?? r.original_price ?? 0) * r.quantity, 0);

  const getPrice = (res: Reservation) =>
    res.discounted_price != null ? res.discounted_price : res.original_price;

  // ─── Action Dropdown ──────────────────────────────────
  const renderActionDropdown = (res: Reservation) => {
    const invoiced = hasInvoice(res.id);
    const returned = hasReturnProtocol(res.id);
    const docs = getDocsForReservation(res.id);
    const isPending = res.status === "pending";
    const active = isActive(res);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 bg-popover">
          {isPending && (
            <DropdownMenuItem
              onClick={() => onConfirmReservation(res)}
              disabled={confirmingId === res.id}
              className="text-green-700"
            >
              <Check className="h-4 w-4 mr-2" /> Bestätigen
            </DropdownMenuItem>
          )}

          {!isPending && (
            <DropdownMenuItem onClick={() => onExtendReservation(res)}>
              <CalendarPlus className="h-4 w-4 mr-2" /> Verlängern
            </DropdownMenuItem>
          )}

          {!docs.deliveryNote && !isPending && (
            <DropdownMenuItem onClick={() => onCreateDeliveryNote(res)} className="text-blue-700">
              <ClipboardList className="h-4 w-4 mr-2" /> Übergabeprotokoll
            </DropdownMenuItem>
          )}

          {!returned && active && !isPending && (
            <DropdownMenuItem onClick={() => onCreateReturnProtocol(res)} className="text-green-700">
              <ClipboardCheck className="h-4 w-4 mr-2" /> Rückgabeprotokoll
            </DropdownMenuItem>
          )}

          {!invoiced && !isPending && (
            <DropdownMenuItem onClick={() => onGenerateInvoice(res)} className="text-primary">
              <Receipt className="h-4 w-4 mr-2" /> Rechnung erstellen
            </DropdownMenuItem>
          )}

          {/* Document links */}
          {(docs.deliveryNote?.file_url || docs.returnProtocol?.file_url || docs.invoice?.file_url) && (
            <>
              <DropdownMenuSeparator />
              {docs.deliveryNote?.file_url && (
                <DropdownMenuItem onClick={() => openInvoiceInNewWindow(docs.deliveryNote!.file_url!)}>
                  <Eye className="h-4 w-4 mr-2" /> Übergabe ansehen
                </DropdownMenuItem>
              )}
              {docs.returnProtocol?.file_url && (
                <DropdownMenuItem onClick={() => openInvoiceInNewWindow(docs.returnProtocol!.file_url!)}>
                  <Eye className="h-4 w-4 mr-2" /> Rückgabe ansehen
                </DropdownMenuItem>
              )}
              {docs.invoice?.file_url && (
                <DropdownMenuItem onClick={() => openInvoiceInNewWindow(docs.invoice!.file_url!)}>
                  <Eye className="h-4 w-4 mr-2" /> Rechnung ansehen
                </DropdownMenuItem>
              )}
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteConfirmRes(res)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Löschen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // ─── Doc icons (compact inline) ───────────────────────
  const renderDocIcons = (res: Reservation) => {
    const docs = getDocsForReservation(res.id);
    const items: { label: string; url: string }[] = [];
    if (docs.deliveryNote?.file_url) items.push({ label: "ÜP", url: docs.deliveryNote.file_url });
    if (docs.returnProtocol?.file_url) items.push({ label: "RP", url: docs.returnProtocol.file_url });
    if (docs.invoice?.file_url) items.push({ label: "RE", url: docs.invoice.file_url });

    if (items.length === 0) return <span className="text-muted-foreground">–</span>;

    return (
      <div className="flex gap-1">
        {items.map((item) => (
          <Button
            key={item.label}
            size="sm"
            variant="outline"
            className="h-6 px-1.5 text-[10px] font-medium"
            onClick={() => openInvoiceInNewWindow(item.url)}
          >
            {item.label}
          </Button>
        ))}
      </div>
    );
  };

  // ─── Mobile Card View ─────────────────────────────────
  const renderMobileCard = (res: Reservation) => {
    const profile = profiles.find((p) => p.id === res.b2b_profile_id);
    const price = getPrice(res);

    return (
      <Card key={res.id} className="border-border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{res.product_name || res.product_id}</p>
              <p className="text-xs text-muted-foreground">{profile?.company_name || "–"}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {getStatusBadge(res)}
              {renderActionDropdown(res)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs">
            <div>
              <span className="text-muted-foreground">Standort:</span>
              <span className="ml-1 capitalize">{res.location}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Menge:</span>
              <span className="ml-1">{res.quantity}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Zeitraum:</span>
              <span className="ml-1">
                {fmtDate(res.start_date)}
                {res.end_date ? ` – ${fmtDate(res.end_date)}` : ""}
              </span>
            </div>
            {price != null && (
              <div>
                <span className="text-muted-foreground">Preis:</span>
                <span className="ml-1 font-medium">{fmtCurrency(price)}</span>
              </div>
            )}
          </div>

          <div className="mt-2">{renderDocIcons(res)}</div>
        </CardContent>
      </Card>
    );
  };

  const renderMobileGroupCard = (group: RentalGroup) => {
    const items = group.reservations;
    const first = items[0];
    const profile = profiles.find((p) => p.id === first.b2b_profile_id);
    const isExpanded = expandedGroups.has(group.key);
    const groupStatus = getGroupStatus(items);
    const groupPrice = getGroupPrice(items);

    return (
      <Card key={group.key} className="border-border">
        <CardContent className="p-4">
          <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(group.key)}>
            <div className="flex items-start justify-between gap-2">
              <CollapsibleTrigger className="flex items-center gap-2 text-left flex-1 min-w-0">
                {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="font-semibold text-sm">{items.length} Positionen</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {profile?.company_name || "–"}
                  </p>
                </div>
              </CollapsibleTrigger>
              <div className="flex items-center gap-2 shrink-0">
                {getStatusBadge({ ...first, status: groupStatus })}
                {renderActionDropdown(first)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs">
              <div className="col-span-2">
                <span className="text-muted-foreground">Zeitraum:</span>
                <span className="ml-1">
                  {fmtDate(first.start_date)}
                  {first.end_date ? ` – ${fmtDate(first.end_date)}` : ""}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Standort:</span>
                <span className="ml-1 capitalize">{first.location}</span>
              </div>
              {groupPrice > 0 && (
                <div>
                  <span className="text-muted-foreground">Gesamt:</span>
                  <span className="ml-1 font-medium">{fmtCurrency(groupPrice)}</span>
                </div>
              )}
            </div>

            <CollapsibleContent className="mt-3 space-y-2 border-t border-border pt-3">
              {items.map((res) => (
                <div key={res.id} className="flex items-center justify-between text-xs bg-muted/30 rounded-md p-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{res.product_name || res.product_id}</p>
                    <p className="text-muted-foreground">
                      Menge: {res.quantity}
                      {res.discounted_price != null ? ` · ${fmtCurrency(res.discounted_price)}` : res.original_price != null ? ` · ${fmtCurrency(res.original_price)}` : ""}
                    </p>
                  </div>
                  <Button
                    size="sm" variant="ghost"
                    className="text-destructive h-7 w-7 p-0 shrink-0"
                    onClick={() => setDeleteConfirmRes(res)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    );
  };

  // ─── Desktop Table Row ────────────────────────────────
  const renderSingleRow = (res: Reservation) => {
    const profile = profiles.find((p) => p.id === res.b2b_profile_id);
    const price = getPrice(res);
    const isPending = res.status === "pending";

    return (
      <TableRow key={res.id} className={isPending ? "bg-amber-50/30" : undefined}>
        <TableCell className="max-w-[200px]">
          <p className="font-medium text-sm truncate">{res.product_name || res.product_id}</p>
          <p className="text-xs text-muted-foreground">Menge: {res.quantity}</p>
        </TableCell>
        <TableCell className="text-sm">{profile?.company_name || "–"}</TableCell>
        <TableCell className="text-sm capitalize hidden xl:table-cell">{res.location}</TableCell>
        <TableCell className="text-sm whitespace-nowrap">
          {fmtDate(res.start_date)}
          {res.end_date ? ` – ${fmtDate(res.end_date)}` : ""}
        </TableCell>
        <TableCell>{getStatusBadge(res)}</TableCell>
        <TableCell className="hidden lg:table-cell">{renderDocIcons(res)}</TableCell>
        <TableCell className="text-right text-sm whitespace-nowrap">
          {price != null ? fmtCurrency(price) : "–"}
        </TableCell>
        <TableCell className="text-right">{renderActionDropdown(res)}</TableCell>
      </TableRow>
    );
  };

  const renderGroupRow = (group: RentalGroup) => {
    const items = group.reservations;
    const first = items[0];
    const profile = profiles.find((p) => p.id === first.b2b_profile_id);
    const isExpanded = expandedGroups.has(group.key);
    const groupStatus = getGroupStatus(items);
    const groupPrice = getGroupPrice(items);
    const isPending = groupStatus === "pending";

    return (
      <Collapsible key={group.key} open={isExpanded} onOpenChange={() => toggleGroup(group.key)}>
        <TableRow className={isPending ? "bg-amber-50/30 cursor-pointer" : "cursor-pointer"}>
          <TableCell>
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-2">
                {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium text-sm">{items.length} Positionen</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-5 truncate max-w-[180px]">
                    {items.map((r) => r.product_name || r.product_id).join(", ")}
                  </p>
                </div>
              </div>
            </CollapsibleTrigger>
          </TableCell>
          <TableCell className="text-sm">{profile?.company_name || "–"}</TableCell>
          <TableCell className="text-sm capitalize hidden xl:table-cell">{first.location}</TableCell>
          <TableCell className="text-sm whitespace-nowrap">
            {fmtDate(first.start_date)}
            {first.end_date ? ` – ${fmtDate(first.end_date)}` : ""}
          </TableCell>
          <TableCell>{getStatusBadge({ ...first, status: groupStatus })}</TableCell>
          <TableCell className="hidden lg:table-cell">{renderDocIcons(first)}</TableCell>
          <TableCell className="text-right text-sm font-medium whitespace-nowrap">
            {groupPrice > 0 ? fmtCurrency(groupPrice) : "–"}
          </TableCell>
          <TableCell className="text-right">{renderActionDropdown(first)}</TableCell>
        </TableRow>

        <CollapsibleContent asChild>
          <>
            {items.map((res) => (
              <TableRow key={res.id} className="bg-muted/30 border-l-2 border-l-primary/20">
                <TableCell className="pl-10">
                  <p className="font-medium text-sm">{res.product_name || res.product_id}</p>
                  <p className="text-xs text-muted-foreground">Menge: {res.quantity}</p>
                </TableCell>
                <TableCell />
                <TableCell className="hidden xl:table-cell" />
                <TableCell className="text-sm whitespace-nowrap">
                  {fmtDate(res.start_date)}
                  {res.end_date ? ` – ${fmtDate(res.end_date)}` : ""}
                </TableCell>
                <TableCell>{getStatusBadge(res)}</TableCell>
                <TableCell className="hidden lg:table-cell">{renderDocIcons(res)}</TableCell>
                <TableCell className="text-right text-sm whitespace-nowrap">
                  {res.discounted_price != null
                    ? fmtCurrency(res.discounted_price)
                    : res.original_price != null
                    ? fmtCurrency(res.original_price)
                    : "–"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm" variant="ghost"
                    className="text-destructive h-8 w-8 p-0"
                    onClick={() => setDeleteConfirmRes(res)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  // ─── Render ────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold">Alle Mietvorgänge</h2>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Mietvorgänge verwalten, bestätigen und verlängern
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onCreateReservation}
            className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Mietvorgang anlegen</span>
            <span className="sm:hidden">Neu</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-medium text-foreground">Noch keine Mietvorgänge</p>
            <p className="text-sm text-muted-foreground mt-1">
              Mietvorgänge erscheinen hier, sobald sie angelegt oder ein Angebot bestätigt wurde.
            </p>
          </CardContent>
        </Card>
      ) : isMobile ? (
        /* ── Mobile / Tablet Card Layout ── */
        <div className="space-y-3">
          {groups.map((group) =>
            group.isBatch
              ? renderMobileGroupCard(group)
              : renderMobileCard(group.reservations[0])
          )}
        </div>
      ) : (
        /* ── Desktop Table Layout ── */
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[160px]">Produkt</TableHead>
                  <TableHead className="min-w-[120px]">Kunde</TableHead>
                  <TableHead className="hidden xl:table-cell">Standort</TableHead>
                  <TableHead className="min-w-[130px]">Zeitraum</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Dokumente</TableHead>
                  <TableHead className="text-right min-w-[80px]">Preis</TableHead>
                  <TableHead className="text-right w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) =>
                  group.isBatch
                    ? renderGroupRow(group)
                    : renderSingleRow(group.reservations[0])
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmRes} onOpenChange={(open) => !open && setDeleteConfirmRes(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mietvorgang löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Mietvorgang <strong>{deleteConfirmRes?.product_name || deleteConfirmRes?.product_id}</strong> unwiderruflich löschen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirmRes) {
                  onDelete(deleteConfirmRes.id);
                  setDeleteConfirmRes(null);
                }
              }}
            >
              Endgültig löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
