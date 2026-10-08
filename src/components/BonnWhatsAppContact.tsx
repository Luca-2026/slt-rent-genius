import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { getLocationWhatsAppContact } from "@/data/locationWhatsAppContacts";
import { cn } from "@/lib/utils";

interface BonnWhatsAppContactProps {
  location?: string | null;
  dark?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export function BonnWhatsAppContact({ location, dark = false, className, iconOnly = false }: BonnWhatsAppContactProps) {
  const contact = getLocationWhatsAppContact(location);
  if (!contact) return null;

  return (
      <Button asChild variant="ghost" size={iconOnly ? "icon" : "sm"} className={cn("shrink-0", !iconOnly && "max-w-full px-2 text-xs", dark ? "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" : "text-primary", className)}>
        <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" title={`WhatsApp an ${contact.name}: ${contact.phone}`} aria-label={`WhatsApp an ${contact.name}: ${contact.phone}`} onClick={(e) => e.stopPropagation()}>
          <WhatsAppIcon aria-hidden="true" />
          {!iconOnly && <span>WhatsApp · {contact.name}</span>}
        </a>
      </Button>
  );
}