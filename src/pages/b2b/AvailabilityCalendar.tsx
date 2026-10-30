import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { Button } from "@/components/ui/button";
import { CalendarLocationFilter } from '@/components/b2b/calendar/CalendarLocationFilter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeekGrid } from "@/components/b2b/calendar/WeekGrid";
import { InstanceAvailabilityTable, type InstanceRow } from "@/components/b2b/calendar/InstanceAvailabilityTable";
import { buildCalendarEntries, normalizeLoc, type CalendarInquiry } from "@/lib/calendarEntries";
import { toast } from "sonner";

const FILTER_KEY = "slt.calendar.filter";

export default function AvailabilityCalendar() {
  const { isStaff, loading: accessLoading } = useStaffAccess();
  const saved = (() => { try { return JSON.parse(localStorage.getItem(FILTER_KEY) || "{}"); } catch { return {}; } })();
  const [location, setLocation] = useState<string>(saved.location ?? "all");
  const [weekAnchor, setWeekAnchor] = useState<Date>(() => new Date());
  const [inquiries, setInquiries] = useState<CalendarInquiry[]>([]);
  const [signedDelivery, setSignedDelivery] = useState<Set<string>>(new Set());
  const [signedReturn, setSignedReturn] = useState<Set<string>>(new Set());
  const [instances, setInstances] = useState<InstanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [inqRes, delRes, retRes, instRes, allocRes] = await Promise.all([
      supabase
        .from("rental_inquiries")
        .select("id, status, start_date, start_time, end_date, end_time, location, customer_name, company_name, order_code, order_confirmed_at, product_name, quantity, requested_items, offer_payload, closed_manually_at")
        .in("status", ["accepted", "done"])
        .not("start_date", "is", null),
      (supabase.from("b2b_delivery_notes" as any) as any).select("rental_inquiry_id").not("signed_at", "is", null),
      (supabase.from("b2b_return_protocols" as any) as any).select("rental_inquiry_id").not("signed_at", "is", null),
      (supabase.from("b2b_product_instances" as any) as any).select("id, internal_inventory_number, serial_number, location, status, managed_product_id"),
      (supabase.from("b2b_instance_allocations" as any) as any).select("instance_id, from_at, to_at, rental_inquiry_id"),
    ]);
    if (inqRes.error) toast.error(`Aufträge nicht ladbar: ${inqRes.error.message}`);
    const inqs = ((inqRes.data ?? []) as unknown) as CalendarInquiry[];
    setInquiries(inqs);
    setSignedDelivery(new Set(((delRes.data ?? []) as Array<{ rental_inquiry_id: string | null }>).map((r) => r.rental_inquiry_id).filter((v): v is string => !!v)));
    setSignedReturn(new Set([...((retRes.data ?? []) as Array<{ rental_inquiry_id: string | null }>).map((r) => r.rental_inquiry_id).filter((v): v is string => !!v), ...(inqs as Array<{ id: string; closed_manually_at?: string | null }>).filter((r) => r.closed_manually_at).map((r) => r.id)]));

    // Geräte + Belegungen + Artikelnamen + Auftrags-IDs
    const inst = ((instRes.data ?? []) as Array<{ id: string; internal_inventory_number: string | null; serial_number: string | null; location: string; status: string; managed_product_id: string }>);
    const allocs = ((allocRes.data ?? []) as Array<{ instance_id: string; from_at: string; to_at: string; rental_inquiry_id: string }>);
    const productIds = [...new Set(inst.map((i) => i.managed_product_id))];
    const inquiryIds = [...new Set(allocs.map((a) => a.rental_inquiry_id))];
    const [prodRes, codeRes] = await Promise.all([
      productIds.length ? supabase.from("b2b_managed_products").select("id, name").in("id", productIds) : Promise.resolve({ data: [] }),
      inquiryIds.length ? supabase.from("rental_inquiries").select("id, order_code").in("id", inquiryIds) : Promise.resolve({ data: [] }),
    ]);
    const prodName = new Map(((prodRes.data ?? []) as Array<{ id: string; name: string }>).map((p) => [p.id, p.name]));
    const orderCode = new Map(((codeRes.data ?? []) as Array<{ id: string; order_code: string | null }>).map((r) => [r.id, r.order_code]));
    setInstances(inst.map((i) => ({
      id: i.id,
      internal_inventory_number: i.internal_inventory_number,
      serial_number: i.serial_number,
      location: i.location,
      status: i.status,
      productName: prodName.get(i.managed_product_id) ?? "Artikel",
      allocations: allocs.filter((a) => a.instance_id === i.id).map((a) => ({ ...a, orderCode: orderCode.get(a.rental_inquiry_id) ?? null })),
    })));
    setLoading(false);
  }, []);

  useEffect(() => { if (isStaff) void load(); }, [isStaff, load]);
  useEffect(() => { localStorage.setItem(FILTER_KEY, JSON.stringify({ location })); }, [location]);

  const entries = useMemo(() => {
    const all = buildCalendarEntries(inquiries, signedDelivery, signedReturn);
    if (location === "all") return all;
    return all.filter((e) => normalizeLoc(e.location) === location);
  }, [inquiries, signedDelivery, signedReturn, location]);

  if (!accessLoading && !isStaff) {
    return <B2BPortalLayout title="Kalender"><p className="text-muted-foreground">Nur für Mitarbeiter.</p></B2BPortalLayout>;
  }

  return (
    <B2BPortalLayout title="Kalender" subtitle="Übergaben, Rückgaben und Verfügbarkeit der Geräte">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => void load()}><RefreshCw className="mr-1 h-4 w-4" />Aktualisieren</Button>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Lädt …</p>
      ) : (
        <Tabs defaultValue="week">
          <TabsList className="mb-4 grid w-full h-auto grid-cols-2 sm:w-fit">
            <TabsTrigger className="whitespace-normal text-center" value="week">Wochenübersicht</TabsTrigger>
            <TabsTrigger className="whitespace-normal text-center" value="instances">Verfügbarkeit Geräte</TabsTrigger>
          </TabsList>
          <TabsContent value="week">
            <div className="mb-4"><CalendarLocationFilter value={location} onChange={setLocation} /></div>
            <WeekGrid entries={entries} weekAnchor={weekAnchor} onWeekChange={setWeekAnchor} />
          </TabsContent>
          <TabsContent value="instances">
            <InstanceAvailabilityTable rows={instances} locationFilter={location} onLocationChange={setLocation} />
          </TabsContent>
        </Tabs>
      )}
    </B2BPortalLayout>
  );
}
