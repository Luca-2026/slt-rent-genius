import { MessageCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bonnDirectContact } from "@/data/bonnContact";
import { cn } from "@/lib/utils";

interface BonnWhatsAppContactProps {
  location?: string | null;
  dark?: boolean;
  className?: string;
}

export function BonnWhatsAppContact({ location, dark = false, className }: BonnWhatsAppContactProps) {
  if (location?.trim().toLowerCase() !== "bonn") return null;

  return (
    <div className={cn("min-w-0 border-l-2 border-accent pl-3 py-2", dark ? "text-primary-foreground" : "text-foreground", className)}>
      <p className="text-sm font-semibold break-words">Direkt zu {bonnDirectContact.name}</p>
      <p className={cn("mt-1 text-xs leading-relaxed", dark ? "text-primary-foreground/80" : "text-muted-foreground")}>
        Dein Standortleiter in Bonn – auch persönlich per WhatsApp erreichbar.
      </p>
      <Button asChild variant="link" className={cn("mt-1 h-auto max-w-full justify-start whitespace-normal px-0 py-2 text-left", dark && "text-primary-foreground")}>
        <a href={bonnDirectContact.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp an ${bonnDirectContact.name}: ${bonnDirectContact.phone}`}>
          <MessageCircle aria-hidden="true" />
          <span>WhatsApp · {bonnDirectContact.phone}</span>
          <ArrowUpRight aria-hidden="true" />
        </a>
      </Button>
    </div>
  );
}