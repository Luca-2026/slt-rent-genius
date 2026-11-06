import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { completeTestInvoiceDocuments } from "../_shared/test-invoice-documents.ts";
const headers = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Content-Type": "application/json" };
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return respond({ error: "Nicht konfiguriert" }, 500);
    const service = createClient(url, key);
    const token = req.headers.get("Authorization")?.replace(/^Bearer /, "");
    if (!token) return respond({ error: "Unauthorized" }, 401);
    const { data: { user } } = await service.auth.getUser(token);
    if (!user) return respond({ error: "Unauthorized" }, 401);
    const { data: admin } = await service.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!admin) return respond({ error: "Forbidden" }, 403);
    const body = await req.json();
    if (!["inquiry_invoices", "b2b_invoices"].includes(body.table) || typeof body.invoice_id !== "string") return respond({ error: "Ungültiger Beleg" }, 400);
    const credits = await completeTestInvoiceDocuments(service, body.table, body.invoice_id);
    return respond({ success: true, credits });
  } catch (error) {
    console.error("Test credit completion failed", error instanceof Error ? error.message : "unknown");
    return respond({ error: "Gutschrift konnte nicht vervollständigt werden" }, 500);
  }
});