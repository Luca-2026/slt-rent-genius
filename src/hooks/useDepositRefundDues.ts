import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { loadAllSearchRows } from "@/lib/staffSearch";
import { depositRefundDue, type DepositDue, type DepositDueEvidence } from "@/lib/depositRefundDue";

export function useDepositRefundDues() {
  const { isStaff, loading: accessLoading } = useStaffAccess();
  const [dues, setDues] = useState(new Map<string, DepositDue>());
  const [rows, setRows] = useState<{ id: string; customer_name: string | null; company_name: string | null; product_name: string; location: string | null; order_code: string | null }[]>([]);
  const [loading, setLoading] = useState(true), [error, setError] = useState(false);
  useEffect(() => {
    if (accessLoading || !isStaff) return;
    let alive = true, running = false;
    const load = async () => {
      if (running) return; running = true;
      try {
        const [inquiries, settlements, returns, links, refunds, requests] = await Promise.all([
          loadAllSearchRows((from, to) => supabase.from("rental_inquiries").select("id,status,offer_total_gross,payments,offer_payload,closed_manually_at,customer_name,company_name,product_name,location,order_code").order("id").range(from, to)),
          loadAllSearchRows((from, to) => supabase.from("deposit_settlements").select("id,rental_inquiry_id,balance,payout_status,settled_at").order("id").range(from, to)),
          loadAllSearchRows((from, to) => supabase.from("b2b_return_protocols").select("id,rental_inquiry_id,status,damages_total,b2b_return_extra_charges(quantity,unit_price)").in("status", ["signed", "signed_staff_only"]).order("id").range(from, to)),
          loadAllSearchRows((from, to) => supabase.from("offer_payment_links").select("id,inquiry_id").eq("inquiry_table", "rental_inquiries").order("id").range(from, to)),
          loadAllSearchRows((from, to) => supabase.from("deposit_refunds").select("id,link_id,status,amount_cents,stripe_refund_id").not("status", "in", "(failed,canceled)").order("id").range(from, to)),
          loadAllSearchRows((from, to) => supabase.from("order_refund_requests").select("id,inquiry_id,status,deposit_cents,allocations").not("status", "in", "(failed,canceled)").order("id").range(from, to)),
        ]);
        const byLink = new Map(links.map(l => [l.id, l.inquiry_id]));
        const evidence = new Map<string, DepositDueEvidence>();
        for (const i of inquiries) {
          const depositRefunds = refunds.filter(r => byLink.get(r.link_id) === i.id);
          const combined = requests.filter(r => r.inquiry_id === i.id && r.deposit_cents > 0);
          const allocations = combined.flatMap(r => Array.isArray(r.allocations) ? r.allocations.filter(a => a && typeof a === "object" && !Array.isArray(a)) as { status?: string; refund_id?: string; deposit_cents?: number }[] : []);
          const mirrored = new Set(allocations.map(a => a.refund_id).filter(Boolean));
          // Partial combined successes count only their confirmed allocation, never twice through a legacy mirror.
          const combinedPaid = combined.reduce((sum, r) => sum + (r.status === "succeeded" ? r.deposit_cents :
            (Array.isArray(r.allocations) ? r.allocations : []).reduce<number>((total, a) => total + (a && typeof a === "object" && !Array.isArray(a) && a.status === "succeeded" ? Number(a.deposit_cents) || 0 : 0), 0)), 0);
          evidence.set(i.id, { inquiryId: i.id, amountCents:
            depositRefunds.filter(r => r.status === "succeeded" && !mirrored.has(r.stripe_refund_id ?? "")).reduce((s, r) => s + r.amount_cents, 0) + combinedPaid,
            pending: [...depositRefunds, ...combined].some(r => !["succeeded", "failed", "canceled"].includes(r.status)) });
        }
        const bySettlement = new Map(settlements.map(s => [s.rental_inquiry_id, s]));
        const next = new Map<string, DepositDue>();
        for (const i of inquiries) { const due = depositRefundDue(i, bySettlement.get(i.id), returns, evidence.get(i.id)); if (due) next.set(i.id, due); }
        if (alive) { setDues(next); setRows(inquiries); setError(false); }
      } catch { if (alive) setError(true); }
      finally { running = false; if (alive) setLoading(false); }
    };
    void load();
    const channel = supabase.channel("deposit-refund-dues")
      .on("postgres_changes", { event: "*", schema: "public", table: "deposit_settlements" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "deposit_refunds" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "order_refund_requests" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "b2b_return_protocols" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "rental_inquiries" }, load).subscribe();
    const timer = window.setInterval(load, 300_000);
    return () => { alive = false; window.clearInterval(timer); void supabase.removeChannel(channel); };
  }, [isStaff, accessLoading]);
  return { dues, rows, loading, error };
}