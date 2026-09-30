import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RentalProtocolRef {
  id: string;
  number: string;
  file_url: string | null;
  created_at: string;
  status: string | null;
}

export interface RentalProtocolState {
  delivery: RentalProtocolRef | null;
  ret: RentalProtocolRef | null;
}

/** Übergabe- und Rückgabeprotokolle je Mietanfrage (für Listen, Filter und Auftragsauswahl). */
export function useRentalProtocolStatus() {
  const [byInquiry, setByInquiry] = useState<Map<string, RentalProtocolState>>(new Map());
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [dn, rp] = await Promise.all([
      supabase.from("b2b_delivery_notes").select("id,delivery_note_number,file_url,created_at,status,rental_inquiry_id").not("rental_inquiry_id", "is", null),
      supabase.from("b2b_return_protocols").select("id,return_protocol_number,file_url,created_at,status,rental_inquiry_id").not("rental_inquiry_id", "is", null),
    ]);
    const map = new Map<string, RentalProtocolState>();
    const get = (id: string) => {
      const cur = map.get(id) ?? { delivery: null, ret: null };
      map.set(id, cur);
      return cur;
    };
    for (const r of (dn.data ?? []) as any[]) {
      get(r.rental_inquiry_id).delivery = { id: r.id, number: r.delivery_note_number, file_url: r.file_url, created_at: r.created_at, status: r.status };
    }
    for (const r of (rp.data ?? []) as any[]) {
      get(r.rental_inquiry_id).ret = { id: r.id, number: r.return_protocol_number, file_url: r.file_url, created_at: r.created_at, status: r.status };
    }
    setByInquiry(map);
    setLoading(false);
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  return { byInquiry, loading, reload };
}
