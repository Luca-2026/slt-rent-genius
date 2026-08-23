import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { canTransition, type InquiryStatus } from "@/lib/inquiryStatus";
import { useToast } from "@/hooks/use-toast";

type TableName = "rental_inquiries" | "sales_inquiries";

export function useInquiryActions(table: TableName, onChanged?: () => void) {
  const { user } = useAuth();
  const { staffProfile, isAdmin } = useStaffAccess() as any;
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const actorName =
    (staffProfile ? `${staffProfile.first_name} ${staffProfile.last_name}` : "") ||
    user?.email ||
    "Unbekannt";

  const update = useCallback(
    async (id: string, patch: Record<string, unknown>) => {
      setBusy(true);
      const { error } = await supabase.from(table).update(patch).eq("id", id);
      setBusy(false);
      if (error) {
        toast({ title: "Speichern fehlgeschlagen", description: error.message, variant: "destructive" });
        return false;
      }
      onChanged?.();
      return true;
    },
    [table, toast, onChanged],
  );

  const claim = useCallback(
    async (id: string, currentStatus: string) =>
      update(id, {
        assigned_to: user?.id ?? null,
        assigned_name: actorName,
        assigned_at: new Date().toISOString(),
        status: currentStatus === "new" ? "in_progress" : currentStatus,
      }),
    [update, user?.id, actorName],
  );

  const release = useCallback(
    async (id: string) => update(id, { assigned_to: null, assigned_name: null, assigned_at: null }),
    [update],
  );

  const setStatus = useCallback(
    async (id: string, from: string, to: InquiryStatus) => {
      if (!canTransition(from, to)) {
        toast({ title: "Statuswechsel nicht möglich", description: `${from} → ${to}`, variant: "destructive" });
        return false;
      }
      return update(id, { status: to });
    },
    [update, toast],
  );

  const saveNotes = useCallback(
    async (id: string, notes: string) => update(id, { internal_notes: notes }),
    [update],
  );

  return { busy, actorName, isAdmin, claim, release, setStatus, saveNotes, update };
}
