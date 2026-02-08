import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CreateStaffRequest {
  action: "create" | "update_role" | "deactivate" | "reactivate";
  // For create
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  position?: string;
  role?: string;
  // For update_role / deactivate / reactivate
  staff_user_id?: string;
  new_role?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !authUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", authUser.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: CreateStaffRequest = await req.json();
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ─── CREATE ─────────────────────────────────────────
    if (body.action === "create") {
      if (
        !body.email ||
        !body.password ||
        !body.first_name ||
        !body.last_name ||
        !body.role
      ) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Validate role
      const validRoles = [
        "admin",
        "standort_mitarbeiter",
        "buchhaltung",
        "readonly",
      ];
      if (!validRoles.includes(body.role)) {
        return new Response(JSON.stringify({ error: "Invalid role" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create auth user
      const { data: newUser, error: createError } =
        await serviceClient.auth.admin.createUser({
          email: body.email,
          password: body.password,
          email_confirm: true,
        });

      if (createError || !newUser?.user) {
        console.error("Error creating staff user:", createError);
        return new Response(
          JSON.stringify({
            error: createError?.message || "Failed to create user",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Create staff profile
      const { error: profileError } = await serviceClient
        .from("staff_profiles")
        .insert({
          user_id: newUser.user.id,
          first_name: body.first_name,
          last_name: body.last_name,
          email: body.email,
          phone: body.phone || null,
          position: body.position || null,
        });

      if (profileError) {
        console.error("Error creating staff profile:", profileError);
        await serviceClient.auth.admin.deleteUser(newUser.user.id);
        return new Response(
          JSON.stringify({
            error: "Failed to create staff profile: " + profileError.message,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Assign role
      const { error: roleError } = await serviceClient
        .from("user_roles")
        .insert({
          user_id: newUser.user.id,
          role: body.role,
        });

      if (roleError) {
        console.error("Error assigning role:", roleError);
        // Cleanup
        await serviceClient
          .from("staff_profiles")
          .delete()
          .eq("user_id", newUser.user.id);
        await serviceClient.auth.admin.deleteUser(newUser.user.id);
        return new Response(
          JSON.stringify({
            error: "Failed to assign role: " + roleError.message,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          user_id: newUser.user.id,
          role: body.role,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ─── UPDATE ROLE ────────────────────────────────────
    if (body.action === "update_role") {
      if (!body.staff_user_id || !body.new_role) {
        return new Response(
          JSON.stringify({ error: "Missing staff_user_id or new_role" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const validRoles = [
        "admin",
        "standort_mitarbeiter",
        "buchhaltung",
        "readonly",
      ];
      if (!validRoles.includes(body.new_role)) {
        return new Response(JSON.stringify({ error: "Invalid role" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Delete existing roles (except 'user')
      await serviceClient
        .from("user_roles")
        .delete()
        .eq("user_id", body.staff_user_id)
        .neq("role", "user");

      // Insert new role
      const { error: roleError } = await serviceClient
        .from("user_roles")
        .insert({
          user_id: body.staff_user_id,
          role: body.new_role,
        });

      if (roleError) {
        return new Response(
          JSON.stringify({ error: "Failed to update role: " + roleError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, new_role: body.new_role }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ─── DEACTIVATE ─────────────────────────────────────
    if (body.action === "deactivate") {
      if (!body.staff_user_id) {
        return new Response(
          JSON.stringify({ error: "Missing staff_user_id" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { error } = await serviceClient
        .from("staff_profiles")
        .update({ is_active: false })
        .eq("user_id", body.staff_user_id);

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to deactivate: " + error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── REACTIVATE ─────────────────────────────────────
    if (body.action === "reactivate") {
      if (!body.staff_user_id) {
        return new Response(
          JSON.stringify({ error: "Missing staff_user_id" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { error } = await serviceClient
        .from("staff_profiles")
        .update({ is_active: true })
        .eq("user_id", body.staff_user_id);

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to reactivate: " + error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
