import { useEffect } from "react";
import { Building2, User } from "lucide-react";
import { registerSigningSurface } from "@/lib/signingOverlays";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { setCustomerType, useCustomerType } from "@/hooks/useCustomerType";
import { cn } from "@/lib/utils";
import { vatNote } from "@/lib/priceDisplay";

/** Einmalige Abfrage beim ersten Besuch von Artikel- und Kategorieseiten. */
export function CustomerTypePrompt() {
  const { chosen } = useCustomerType();
  // Warenkorb und Cookie-Hinweis ausblenden, solange die Frage offen ist (sonst verdecken sie die Auswahl).
  useEffect(() => (chosen ? undefined : registerSigningSurface()), [chosen]);
  const options = [
    { type: "private" as const, Icon: User, title: "Privatkunde", hint: "Preise brutto inkl. 19 % USt." },
    { type: "business" as const, Icon: Building2, title: "Geschäftskunde", hint: "Preise netto zzgl. 19 % USt." },
  ];
  return (
    <Dialog open={!chosen} onOpenChange={(open) => { if (!open) setCustomerType("private"); }}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md gap-5 rounded-2xl p-5 sm:p-7">
        <DialogHeader className="items-center space-y-2 text-center sm:text-center">
          <DialogTitle className="text-xl sm:text-2xl">Wie möchtest du mieten?</DialogTitle>
          <DialogDescription className="text-balance">
            Damit wir dir die passenden Preise zeigen. Du kannst das jederzeit an den Preisen umstellen.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map(({ type, Icon, title, hint }) => (
            <button
              key={type}
              type="button"
              onClick={() => setCustomerType(type)}
              className="group flex min-h-[7.5rem] flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-5 text-center transition-all hover:border-primary hover:bg-primary/5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-base font-semibold text-foreground">{title}</span>
              <span className="text-xs text-muted-foreground">{hint}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Kleiner Umschalter Privat/Geschäft neben Preisen. */
export function CustomerTypeToggle({ className }: { className?: string }) {
  const { type } = useCustomerType();
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs", className)}>
      <div role="group" aria-label="Preisanzeige" className="inline-grid grid-cols-2 rounded-full bg-muted p-1">
        {(["private", "business"] as const).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={type === t}
            onClick={() => setCustomerType(t)}
            className={cn(
              "min-h-8 rounded-full px-3.5 py-1 text-center font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              type === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "private" ? "Privat" : "Geschäftlich"}
          </button>
        ))}
      </div>
      <span className="text-muted-foreground">Preise {vatNote(type)}</span>
    </div>
  );
}
