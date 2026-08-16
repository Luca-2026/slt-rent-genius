import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface StaffMember {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
}

/**
 * Zugriff auf den internen Mitarbeiter-Bereich (Aufgaben & Materialdispo).
 * Mitarbeiter = aktiver Eintrag in staff_profiles oder Admin-Rolle.
 */
export function useStaffAccess() {
  const { user, isAdmin, isSuperAdmin, loading: authLoading } = useAuth();
  const [staffProfile, setStaffProfile] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user) {
        setStaffProfile(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("staff_profiles")
        .select("id, user_id, first_name, last_name, email, is_active")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (!cancelled) {
        setStaffProfile((data as StaffMember | null) ?? null);
        setLoading(false);
      }
    };

    if (!authLoading) load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const displayName = staffProfile
    ? `${staffProfile.first_name} ${staffProfile.last_name}`.trim()
    : (user?.user_metadata?.first_name as string | undefined)
      ? `${user?.user_metadata?.first_name} ${user?.user_metadata?.last_name ?? ""}`.trim()
      : (user?.email ?? "");

  return {
    isStaff: isAdmin || !!staffProfile,
    isAdmin,
    isSuperAdmin,
    /** Inventar/CMS ansehen: alle Mitarbeitenden mit Portalzugang. */
    canViewInventory: isAdmin || !!staffProfile,
    /** Inventar-/CMS-Pflege (schreiben): nur Geschäftsführung. */
    canManageInventory: isSuperAdmin,
    /** Mietartikel-CMS: nur Geschäftsführung (Super-Admins). */
    canManageCMS: isSuperAdmin,
    staffProfile,
    displayName,
    loading: authLoading || loading,
  };
}

/** Alle aktiven Mitarbeiter (für Zuweisungen). */
export function useStaffMembers() {
  const [members, setMembers] = useState<StaffMember[]>([]);

  useEffect(() => {
    supabase
      .from("staff_profiles")
      .select("id, user_id, first_name, last_name, email, is_active")
      .eq("is_active", true)
      .order("first_name", { ascending: true })
      .then(({ data }) => setMembers((data as StaffMember[] | null) ?? []));
  }, []);

  return members;
}
