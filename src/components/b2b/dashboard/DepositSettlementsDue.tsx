/** Startseite: Rückgaben mit Protokoll, deren Kaution noch nicht abgerechnet ist. */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { filterByDayLocation, type DayLocationFilter } from "@/lib/dayLocationFilter";

interface Due { id: string; customer: string; product: string | null; location: string | null; order_code: string | null }

export function DepositSettlementsDue({ location }: { location: DayLocationFilter }) {
  const [rows, setRows] = useState<Due[]>([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ data: protocols }, { data: settled }] = await Promise.all([
        supabase
          .from("b2b_return_protocols")
          .select("rental_inquiry_id, rental_inquiries!inner(id, customer_name, company_name, product_name, location, order_code, offer_number)")
          .not("rental_inquiry_id", "is", null)
          .in("status", ["signed", "signed_staff_only"]),
        supabase.from("deposit_settlements").select("rental_inquiry_id"),
      ]);
      if (!alive) return;
      const done = new Set((settled ?? []).map((s) => s.rental_inquiry_id));
      const map = new Map<string, Due>();
      for (const p of (protocols ?? []) as any[]) {
        const i = p.rental_inquiries;
        if (!i?.offer_number || done.has(i.id) || map.has(i.id)) continue;
        map.set(i.id, { id: i.id, customer: i.company_name || i.customer_name || "—", product: i.product_name, location: i.location, order_code: i.order_code });
      }
      setRows([...map.values()]);
    })();
    return () => { alive = false; };
  }, []);

  const visible = filterByDayLocation(rows, location);
  if (!visible.length) return null;
  return (
    <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm">
      <div className="mb-2 flex items-center gap-2 font-semibold"><Wallet className="h-4 w-4 text-primary" /> Kaution abrechnen ({visible.length})</div>
      <ul className="space-y-1">
        {visible.map((r) => (
          <li key={r.id}>
            <Link to={`/b2b/mietanfragen/${r.id}`} className="text-primary underline">
              {r.customer}{r.product ? ` – ${r.product}` : ""}{r.order_code ? ` · #${r.order_code}` : ""}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
