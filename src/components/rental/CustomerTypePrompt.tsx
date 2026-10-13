import { Building2, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { setCustomerType, useCustomerType } from "@/hooks/useCustomerType";
import { cn } from "@/lib/utils";
import { vatNote } from "@/lib/priceDisplay";

/** Einmalige Abfrage beim ersten Besuch von Artikel- und Kategorieseiten. */
export function CustomerTypePrompt() {
  const { chosen } = useCustomerType();
  return (
    <Dialog open={!chosen} onOpenChange={(open) => { if (!open) setCustomerType("private"); }}>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] rounded-xl">
        <DialogHeader>
          <DialogTitle>Wie möchtest du mieten?</DialogTitle>
          <DialogDescription>Damit wir dir die passenden Preise zeigen. Du kannst das jederzeit an den Preisen umstellen.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button variant="outline" className="h-auto flex-col gap-1 whitespace-normal py-4" onClick={() => setCustomerType("private")}>
            <User className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="font-semibold">Privatkunde</span>
            <span className="text-xs font-normal text-muted-foreground">Preise brutto inkl. 19 % USt.</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-1 whitespace-normal py-4" onClick={() => setCustomerType("business")}>
            <Building2 className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="font-semibold">Geschäftskunde</span>
            <span className="text-xs font-normal text-muted-foreground">Preise netto zzgl. 19 % USt.</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Kleiner Umschalter Privat/Geschäft neben Preisen. */
export function CustomerTypeToggle({ className }: { className?: string }) {
  const { type } = useCustomerType();
  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-xs", className)}>
      <div role="group" aria-label="Preisanzeige" className="inline-flex rounded-md border border-border p-0.5">
        {(["private", "business"] as const).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={type === t}
            onClick={() => setCustomerType(t)}
            className={cn("rounded px-2.5 py-1 font-medium min-h-8", type === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            {t === "private" ? "Privat" : "Geschäftlich"}
          </button>
        ))}
      </div>
      <span className="text-muted-foreground">Preise {vatNote(type)}</span>
    </div>
  );
}
