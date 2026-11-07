/** Calls the existing AB renderer/sender only after a persisted signed handover. */
export async function sendHandoverConfirmation(protocolId: string): Promise<boolean> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return false;
  try {
    const response = await fetch(`${url}/functions/v1/send-order-confirmation`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ handover_protocol_id: protocolId, inquiry_type: "rental", attach_pdf: true }),
    });
    return response.ok;
  } catch { return false; }
}