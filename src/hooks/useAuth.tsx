import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useCompleteRegistration } from "@/hooks/useCompleteRegistration";

interface B2BProfile {
  id: string;
  company_name: string;
  status: "pending" | "approved" | "rejected";
  contact_first_name: string;
  contact_last_name: string;
  billing_email: string | null;
  credit_limit: number;
  used_credit: number;
  assigned_location: string | null;
  assigned_contact_override: Record<string, string> | null;
  deletion_requested_at: string | null;
  credit_limit_requested_at: string | null;
}

interface AuthorizedPersonInfo {
  b2b_profile_id: string;
  first_name: string;
  last_name: string;
  max_rental_value: number;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  b2bProfile: B2BProfile | null;
  isAdmin: boolean;
  isApprovedB2B: boolean;
  isAuthorizedPerson: boolean;
  authorizedPersonInfo: AuthorizedPersonInfo | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; data: any }>;
  signOut: () => Promise<void>;
  refreshB2BProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [b2bProfile, setB2BProfile] = useState<B2BProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authorizedPersonInfo, setAuthorizedPersonInfo] = useState<AuthorizedPersonInfo | null>(null);

  const fetchB2BProfile = async (userId: string) => {
    // First try direct profile ownership
    const { data } = await supabase
      .from("b2b_profiles")
      .select("id, company_name, status, contact_first_name, contact_last_name, billing_email, credit_limit, used_credit, assigned_location, assigned_contact_override, deletion_requested_at, credit_limit_requested_at")
      .eq("user_id", userId)
      .single();
    
    if (data) {
      setB2BProfile(data as B2BProfile);
      setAuthorizedPersonInfo(null);
      return;
    }

    // If no direct profile, check if user is an authorized person
    const { data: apData } = await supabase
      .from("b2b_authorized_persons")
      .select("b2b_profile_id, first_name, last_name, max_rental_value, is_active")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (apData) {
      setAuthorizedPersonInfo(apData as AuthorizedPersonInfo);
      // Fetch the company's profile
      const { data: companyProfile } = await supabase
        .from("b2b_profiles")
        .select("id, company_name, status, contact_first_name, contact_last_name, billing_email, credit_limit, used_credit, assigned_location, assigned_contact_override, deletion_requested_at, credit_limit_requested_at")
        .eq("id", apData.b2b_profile_id)
        .single();
      setB2BProfile(companyProfile as B2BProfile | null);
    } else {
      setB2BProfile(null);
      setAuthorizedPersonInfo(null);
    }
  };

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();
    
    setIsAdmin(!!data);
  };

  const refreshB2BProfile = async () => {
    if (user) {
      await fetchB2BProfile(user.id);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          setTimeout(() => {
            fetchB2BProfile(session.user.id);
            checkAdminRole(session.user.id);
          }, 0);
        } else {
          setB2BProfile(null);
          setIsAdmin(false);
          setAuthorizedPersonInfo(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        fetchB2BProfile(session.user.id);
        checkAdminRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = "https://www.slt-rental.de/";
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error, data };
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setB2BProfile(null);
    setIsAdmin(false);
    setAuthorizedPersonInfo(null);
    await supabase.auth.signOut();
  };

  const isApprovedB2B = b2bProfile?.status === "approved";
  const isAuthorizedPerson = !!authorizedPersonInfo;

  useCompleteRegistration(user, refreshB2BProfile);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        b2bProfile,
        isAdmin,
        isApprovedB2B,
        isAuthorizedPerson,
        authorizedPersonInfo,
        signIn,
        signUp,
        signOut,
        refreshB2BProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
