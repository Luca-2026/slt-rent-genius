import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Mail, MailOpen, Clock } from "lucide-react";

interface AdminMessage {
  id: string;
  subject: string;
  body: string;
  sender_name: string | null;
  read_at: string | null;
  created_at: string;
}

interface Props {
  profileId: string;
}

export function AdminMessagesInbox({ profileId }: Props) {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminMessage | null>(null);

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from("b2b_admin_messages")
      .select("id, subject, body, sender_name, read_at, created_at")
      .eq("b2b_profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(50);
    setMessages((data as AdminMessage[]) ?? []);
    setLoading(false);
  }, [profileId]);

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel(`admin-messages-${profileId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "b2b_admin_messages", filter: `b2b_profile_id=eq.${profileId}` },
        () => fetchMessages()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profileId, fetchMessages]);

  const openMessage = async (msg: AdminMessage) => {
    setSelected(msg);
    if (!msg.read_at) {
      await supabase
        .from("b2b_admin_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("id", msg.id);
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read_at: new Date().toISOString() } : m)));
    }
  };

  const unreadCount = messages.filter((m) => !m.read_at).length;
  const formatDate = (s: string) =>
    new Date(s).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });

  if (loading) return null;
  if (messages.length === 0) return null;

  return (
    <>
      <Card className="mb-8 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Nachrichten von SLT Rental
            {unreadCount > 0 && (
              <Badge className="bg-accent text-accent-foreground">{unreadCount} neu</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {messages.slice(0, 5).map((msg) => {
            const isUnread = !msg.read_at;
            return (
              <button
                key={msg.id}
                onClick={() => openMessage(msg)}
                className={`w-full text-left p-3 rounded-md border transition-colors ${
                  isUnread
                    ? "bg-accent/5 border-accent/40 hover:bg-accent/10"
                    : "bg-muted/30 border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    {isUnread ? (
                      <Mail className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    ) : (
                      <MailOpen className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm truncate ${isUnread ? "font-semibold text-foreground" : "text-foreground"}`}>
                        {msg.subject}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {msg.body.slice(0, 100)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    {formatDate(msg.created_at)}
                  </div>
                </div>
              </button>
            );
          })}
          {messages.length > 5 && (
            <p className="text-xs text-muted-foreground text-center pt-1">
              {messages.length - 5} weitere Nachricht(en)
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
            <DialogDescription>
              {selected?.sender_name ?? "SLT Rental Team"} · {selected && formatDate(selected.created_at)}
            </DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed py-2">
            {selected?.body}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setSelected(null)}>Schließen</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
