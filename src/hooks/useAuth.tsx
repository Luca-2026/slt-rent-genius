import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  b2bProfile: B2BProfile | null;
  isAdmin: boolean;
  isApprovedB2B: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
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

  const fetchB2BProfile = async (userId: string) => {
    const { data } = await supabase
      .from("b2b_profiles")
      .select("id, company_name, status, contact_first_name, contact_last_name, billing_email, credit_limit, used_credit, assigned_location, assigned_contact_override, deletion_requested_at")
      .eq("user_id", userId)
      .single();
    
    setB2BProfile(data as B2BProfile | null);
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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Defer Supabase calls with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchB2BProfile(session.user.id);
            checkAdminRole(session.user.id);
          }, 0);
        } else {
          setB2BProfile(null);
          setIsAdmin(false);
        }
      }
    );

    // THEN check for existing session
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
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signOut = async () => {
    // Clear state immediately before async call to prevent stale UI
    setUser(null);
    setSession(null);
    setB2BProfile(null);
    setIsAdmin(false);
    await supabase.auth.signOut();
  };

  const isApprovedB2B = b2bProfile?.status === "approved";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        b2bProfile,
        isAdmin,
        isApprovedB2B,
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
