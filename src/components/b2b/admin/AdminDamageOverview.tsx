import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AlertTriangle, Package, CheckCircle, XCircle, Wrench, Camera, CalendarIcon, Filter, X } from "lucide-react";
import { format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface B2BProfile {
  id: string;
  company_name: string;
  contact_first_name: string;
  contact_last_name: string;
}

interface Props {
  profiles: B2BProfile[];
}

interface DamageEntry {
  id: string;
  type: "delivery" | "return";
  protocolNumber: string;
  company: string;
  profileId: string;
  date: string;
  productName: string;
  condition?: string;
  damageNotes: string;
  hasPhotos: boolean;
}

export function AdminDamageOverview({ profiles }: Props) {
  const [entries, setEntries] = useState<DamageEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [filterCustomer, setFilterCustomer] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState<Date | undefined>();
  const [filterDateTo, setFilterDateTo] = useState<Date | undefined>();

  const getProfile = (id: string) => profiles.find((p) => p.id === id);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [dnRes, dnItemsRes, rpRes, rpItemsRes] = await Promise.all([
        supabase.from("b2b_delivery_notes").select("id, delivery_note_number, b2b_profile_id, signed_at, created_at, known_defects, additional_defects, photo_urls, status"),
        supabase.from("b2b_delivery_note_items").select("delivery_note_id, product_name, condition_notes"),
        supabase.from("b2b_return_protocols").select("id, return_protocol_number, b2b_profile_id, signed_at, created_at, overall_condition, damage_description, additional_defects_at_return, condition_notes, photo_urls, status"),
        supabase.from("b2b_return_protocol_items").select("return_protocol_id, product_name, condition, condition_notes"),
      ]);

      const damageEntries: DamageEntry[] = [];

      if (dnRes.data && dnItemsRes.data) {
        for (const dn of dnRes.data) {
          const items = dnItemsRes.data.filter((i: any) => i.delivery_note_id === dn.id);
          const profile = getProfile(dn.b2b_profile_id);
          const hasPhotos = Array.isArray(dn.photo_urls) && dn.photo_urls.length > 0;

          for (const item of items) {
            if (item.condition_notes) {
              damageEntries.push({
                id: `dn-item-${dn.id}-${item.product_name}`,
                type: "delivery",
                protocolNumber: dn.delivery_note_number,
                company: profile?.company_name || "Unbekannt",
                profileId: dn.b2b_profile_id,
                date: dn.signed_at || dn.created_at,
                productName: item.product_name,
                damageNotes: item.condition_notes,
                hasPhotos,
              });
            }
          }

          const generalDefects = [dn.known_defects, dn.additional_defects].filter(Boolean).join(" | ");
          if (generalDefects && items.length === 0) {
            damageEntries.push({
              id: `dn-general-${dn.id}`,
              type: "delivery",
              protocolNumber: dn.delivery_note_number,
              company: profile?.company_name || "Unbekannt",
              profileId: dn.b2b_profile_id,
              date: dn.signed_at || dn.created_at,
              productName: "Allgemein",
              damageNotes: generalDefects,
              hasPhotos,
            });
          }
        }
      }

      if (rpRes.data && rpItemsRes.data) {
        for (const rp of rpRes.data) {
          const items = rpItemsRes.data.filter((i: any) => i.return_protocol_id === rp.id);
          const profile = getProfile(rp.b2b_profile_id);
          const hasPhotos = Array.isArray(rp.photo_urls) && rp.photo_urls.length > 0;

          for (const item of items) {
            if (item.condition !== "good" || item.condition_notes) {
              damageEntries.push({
                id: `rp-item-${rp.id}-${item.product_name}`,
                type: "return",
                protocolNumber: rp.return_protocol_number,
                company: profile?.company_name || "Unbekannt",
                profileId: rp.b2b_profile_id,
                date: rp.signed_at || rp.created_at,
                productName: item.product_name,
                condition: item.condition,
                damageNotes: item.condition_notes || conditionLabel(item.condition),
                hasPhotos,
              });
            }
          }

          const generalDamage = [rp.damage_description, rp.additional_defects_at_return, rp.condition_notes].filter(Boolean).join(" | ");
          if (generalDamage) {
            damageEntries.push({
              id: `rp-general-${rp.id}`,
              type: "return",
              protocolNumber: rp.return_protocol_number,
              company: profile?.company_name || "Unbekannt",
              profileId: rp.b2b_profile_id,
              date: rp.signed_at || rp.created_at,
              productName: "Allgemein",
              condition: rp.overall_condition,
              damageNotes: generalDamage,
              hasPhotos,
            });
          }
        }
      }

      damageEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEntries(damageEntries);
      setLoading(false);
    };

    if (profiles.length > 0) fetchData();
  }, [profiles]);

  // Get unique customers from entries
  const uniqueCustomers = useMemo(() => {
    const map = new Map<string, string>();
    entries.forEach((e) => map.set(e.profileId, e.company));
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [entries]);

  // Filtered entries
  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (filterCustomer !== "all" && e.profileId !== filterCustomer) return false;
      if (filterType !== "all" && e.type !== filterType) return false;
      if (filterDateFrom && isBefore(new Date(e.date), startOfDay(filterDateFrom))) return false;
      if (filterDateTo && isAfter(new Date(e.date), endOfDay(filterDateTo))) return false;
      return true;
    });
  }, [entries, filterCustomer, filterType, filterDateFrom, filterDateTo]);

  const hasActiveFilter = filterCustomer !== "all" || filterType !== "all" || filterDateFrom || filterDateTo;

  const clearFilters = () => {
    setFilterCustomer("all");
    setFilterType("all");
    setFilterDateFrom(undefined);
    setFilterDateTo(undefined);
  };

  const totalDeliveryDamages = filtered.filter((e) => e.type === "delivery").length;
  const totalReturnDamages = filtered.filter((e) => e.type === "return").length;
  const withPhotos = filtered.filter((e) => e.hasPhotos).length;

  if (loading) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-accent" />
            Schadens- & Maschinenübersicht
          </CardTitle>
          {hasActiveFilter && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7">
              <X className="h-3 w-3 mr-1" />
              Filter zurücksetzen
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 mb-4 p-3 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </div>

          {/* Customer filter */}
          <div className="flex-1 min-w-[160px] max-w-[220px]">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Kunde</label>
            <Select value={filterCustomer} onValueChange={setFilterCustomer}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Alle Kunden" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kunden</SelectItem>
                {uniqueCustomers.map(([id, name]) => (
                  <SelectItem key={id} value={id}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type filter */}
          <div className="min-w-[140px] max-w-[180px]">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Typ</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Alle Typen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                <SelectItem value="delivery">Übergabe</SelectItem>
                <SelectItem value="return">Rückgabe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date from */}
          <div className="min-w-[130px]">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Von</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("h-8 text-xs w-full justify-start", !filterDateFrom && "text-muted-foreground")}>
                  <CalendarIcon className="h-3 w-3 mr-1.5" />
                  {filterDateFrom ? format(filterDateFrom, "dd.MM.yy", { locale: de }) : "Startdatum"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filterDateFrom}
                  onSelect={setFilterDateFrom}
                  locale={de}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date to */}
          <div className="min-w-[130px]">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Bis</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("h-8 text-xs w-full justify-start", !filterDateTo && "text-muted-foreground")}>
                  <CalendarIcon className="h-3 w-3 mr-1.5" />
                  {filterDateTo ? format(filterDateTo, "dd.MM.yy", { locale: de }) : "Enddatum"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filterDateTo}
                  onSelect={setFilterDateTo}
                  locale={de}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Package className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Gesamt Einträge</p>
              <p className="font-semibold">{filtered.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Wrench className="h-4 w-4 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Übergabe-Mängel</p>
              <p className="font-semibold">{totalDeliveryDamages}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <XCircle className="h-4 w-4 text-destructive" />
            <div>
              <p className="text-xs text-muted-foreground">Rückgabe-Schäden</p>
              <p className="font-semibold">{totalReturnDamages}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Camera className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Mit Fotos</p>
              <p className="font-semibold">{withPhotos}</p>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary/60" />
            <p>{hasActiveFilter ? "Keine Einträge für die gewählten Filter." : "Keine Schäden oder Mängel dokumentiert."}</p>
          </div>
        ) : (
          <div className="relative w-full overflow-auto max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Typ</TableHead>
                  <TableHead className="text-xs">Protokoll</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Kunde</TableHead>
                  <TableHead className="text-xs">Produkt</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Zustand</TableHead>
                  <TableHead className="text-xs">Beschreibung</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Datum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 20).map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="py-2">
                      <Badge
                        variant={entry.type === "return" ? "destructive" : "secondary"}
                        className="text-[10px] whitespace-nowrap"
                      >
                        {entry.type === "delivery" ? "Übergabe" : "Rückgabe"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2 text-xs font-mono whitespace-nowrap">
                      {entry.protocolNumber}
                      {entry.hasPhotos && <Camera className="h-3 w-3 inline ml-1 text-muted-foreground" />}
                    </TableCell>
                    <TableCell className="py-2 text-xs hidden sm:table-cell">{entry.company}</TableCell>
                    <TableCell className="py-2 text-xs font-medium">{entry.productName}</TableCell>
                    <TableCell className="py-2 hidden md:table-cell">
                      {entry.condition && (
                        <Badge variant="outline" className={`text-[10px] ${conditionColor(entry.condition)}`}>
                          {conditionLabel(entry.condition)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground max-w-[200px] truncate">
                      {entry.damageNotes}
                    </TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                      {format(new Date(entry.date), "dd.MM.yy", { locale: de })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length > 20 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                … und {filtered.length - 20} weitere Einträge
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function conditionLabel(condition: string): string {
  switch (condition) {
    case "good": return "Gut";
    case "minor_damage": return "Leichte Schäden";
    case "major_damage": return "Schwere Schäden";
    case "defective": return "Defekt";
    default: return condition;
  }
}

function conditionColor(condition: string): string {
  switch (condition) {
    case "good": return "text-primary border-primary/30";
    case "minor_damage": return "text-accent border-accent/30";
    case "major_damage": return "text-destructive border-destructive/30";
    case "defective": return "text-destructive border-destructive";
    default: return "";
  }
}
