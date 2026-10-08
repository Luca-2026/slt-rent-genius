import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bonnDirectContact } from "@/data/bonnContact";
import { cn } from "@/lib/utils";

interface BonnWhatsAppContactProps {
  location?: string | null;
  dark?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export function BonnWhatsAppContact({ location, dark = false, className, iconOnly = false }: BonnWhatsAppContactProps) {
  if (location?.trim().toLowerCase() !== "bonn") return null;

  return (
      <Button asChild variant="ghost" size={iconOnly ? "icon" : "sm"} className={cn("shrink-0", !iconOnly && "max-w-full px-2 text-xs", dark ? "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" : "text-primary", className)}>
        <a href={bonnDirectContact.whatsappUrl} target="_blank" rel="noopener noreferrer" title={`WhatsApp an ${bonnDirectContact.name}: ${bonnDirectContact.phone}`} aria-label={`WhatsApp an ${bonnDirectContact.name}: ${bonnDirectContact.phone}`} onClick={(e) => e.stopPropagation()}>
          <MessageCircle aria-hidden="true" />
          {!iconOnly && <span>WhatsApp · {bonnDirectContact.name}</span>}
        </a>
      </Button>
  );
}