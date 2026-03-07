import { useEffect, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * After email confirmation, marks the b2b_profile as email_confirmed.
 * Also handles legacy localStorage-based registration (if any).
 */
export function useCompleteRegistration(user: User | null, onProfileCreated?: () => void) {
  const { toast } = useToast();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!user || hasRun.current) return;

    hasRun.current = true;

    (async () => {
      try {
        // Clean up any legacy localStorage data
        localStorage.removeItem("b2b_pending_registration");
        localStorage.removeItem("b2b_pending_document");

        // Check if profile exists but email_confirmed is false
        const { data: profile } = await supabase
          .from("b2b_profiles")
          .select("id, email_confirmed")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile && !(profile as any).email_confirmed) {
          // Mark email as confirmed
          const { error } = await supabase
            .from("b2b_profiles")
            .update({ email_confirmed: true } as any)
            .eq("id", profile.id);

          if (!error) {
            onProfileCreated?.();
            toast({
              title: "E-Mail bestätigt!",
              description: "Dein Konto wird geprüft. Du erhältst eine E-Mail, sobald es freigeschaltet wurde.",
            });
          }
        } else if (profile) {
          onProfileCreated?.();
        }
      } catch (err) {
        console.error("Error completing registration:", err);
      }
    })();
  }, [user, toast]);
}
