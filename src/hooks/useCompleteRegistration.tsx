import { useEffect, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getNearestLocation } from "@/utils/plzLocationMapping";
import { useToast } from "@/hooks/use-toast";

/**
 * After email confirmation, checks localStorage for pending B2B registration data
 * and creates the b2b_profile if it doesn't exist yet.
 */
export function useCompleteRegistration(user: User | null, onProfileCreated?: () => void) {
  const { toast } = useToast();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!user || hasRun.current) return;

    const pendingRaw = localStorage.getItem("b2b_pending_registration");
    if (!pendingRaw) return;

    hasRun.current = true;

    (async () => {
      try {
        // Check if profile already exists
        const { data: existing } = await supabase
          .from("b2b_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (existing) {
          // Profile already exists, clean up
          localStorage.removeItem("b2b_pending_registration");
          return;
        }

        const pending = JSON.parse(pendingRaw);
        const assignedLocation = getNearestLocation(pending.postalCode);

        const { error: profileError } = await supabase.from("b2b_profiles").insert({
          user_id: user.id,
          company_name: pending.companyName,
          legal_form: pending.legalForm || null,
          tax_id: pending.taxId || null,
          trade_register_number: pending.tradeRegisterNumber || null,
          contact_first_name: pending.firstName,
          contact_last_name: pending.lastName,
          contact_position: pending.position || null,
          contact_phone: pending.phone,
          contact_email: pending.email,
          billing_email: pending.billingEmail || null,
          street: pending.street,
          house_number: pending.houseNumber || null,
          postal_code: pending.postalCode,
          city: pending.city,
          assigned_location: assignedLocation,
          postal_invoice: pending.postalInvoice || false,
          status: "pending" as const,
        });

        if (profileError) {
          console.error("Failed to complete B2B registration:", profileError);
          toast({
            title: "Profil-Erstellung fehlgeschlagen",
            description: "Bitte kontaktiere den Support.",
            variant: "destructive",
          });
          return;
        }

        localStorage.removeItem("b2b_pending_registration");
        onProfileCreated?.();

        // Also store document info if available
        const docPending = localStorage.getItem("b2b_pending_document");
        if (docPending) {
          localStorage.removeItem("b2b_pending_document");
        }

        toast({
          title: "Registrierung abgeschlossen!",
          description: "Dein Antrag wird geprüft. Du erhältst eine E-Mail, sobald dein Konto freigeschaltet wurde.",
        });

        // Notify admin about new registration
        try {
          await supabase.functions.invoke("notify-b2b-registration", {
            body: {
              companyName: pending.companyName,
              legalForm: pending.legalForm,
              contactName: `${pending.firstName} ${pending.lastName}`,
              contactEmail: pending.email,
              contactPhone: pending.phone,
              city: pending.city,
              postalCode: pending.postalCode,
              assignedLocation,
              taxId: pending.taxId,
            },
          });
        } catch (notifyErr) {
          console.error("Admin notification failed (non-blocking):", notifyErr);
        }
      } catch (err) {
        console.error("Error completing registration:", err);
      }
    })();
  }, [user, toast]);
}
