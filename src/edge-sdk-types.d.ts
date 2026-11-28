// App tests import shared Deno helpers. Map the remote SDK's public type to the
// installed SDK for the app compiler; Deno checks the actual pinned remote SDK.
declare module "https://esm.sh/@supabase/supabase-js@2.57.4" {
  export type SupabaseClient = import("@supabase/supabase-js").SupabaseClient;
}