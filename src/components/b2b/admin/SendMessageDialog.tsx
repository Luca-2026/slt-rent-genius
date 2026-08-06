import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  profileId: string;
  companyName: string;
  contactEmail: string;
  trigger?: React.ReactNode;
}

export function SendMessageDialog({ profileId, companyName, contactEmail, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({ title: "Bitte Betreff und Nachricht ausfüllen", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-admin-message", {
        body: { b2b_profile_id: profileId, subject: subject.trim(), body: body.trim() },
      });
      if (error || (data as any)?.error) {
        throw new Error(error?.message || (data as any)?.error || "Fehler beim Senden");
      }
      toast({
        title: "Nachricht gesendet",
        description: `${companyName} wurde benachrichtigt (im Portal + per E-Mail).`,
      });
      setSubject("");
      setBody("");
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger ?? (
          <Button size="sm" variant="outline" className="flex-1 min-w-[7rem] lg:flex-none">
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            Nachricht
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Nachricht an {companyName}</DialogTitle>
          <DialogDescription>
            Erscheint im Kunden-Dashboard und wird per E-Mail an {contactEmail} versendet (Kopie an b2b@slt-rental.de).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="msg-subject">Betreff</Label>
            <Input
              id="msg-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="z. B. Rückfrage zu Ihrer Reservierung"
              maxLength={200}
            />
          </div>
          <div>
            <Label htmlFor="msg-body">Nachricht</Label>
            <Textarea
              id="msg-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              placeholder="Hallo ..."
              maxLength={10000}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
            Abbrechen
          </Button>
          <Button onClick={handleSend} disabled={sending} className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
            <Send className="h-4 w-4 mr-1.5" />
            {sending ? "Sende..." : "Senden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
