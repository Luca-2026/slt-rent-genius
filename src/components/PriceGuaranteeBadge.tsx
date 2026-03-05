import { useState } from "react";
import { Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PriceGuaranteeBadgeProps {
  variant?: "inline" | "card" | "banner";
  className?: string;
}

export function PriceGuaranteeBadge({ variant = "inline", className }: PriceGuaranteeBadgeProps) {
  const [open, setOpen] = useState(false);

  if (variant === "banner") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            className={cn(
              "w-full bg-primary text-primary-foreground py-3 px-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-primary/90 transition-colors",
              className
            )}
          >
            <Shield className="h-5 w-5 text-accent flex-shrink-0" />
            <span className="font-bold text-sm sm:text-base">SLT Rental Tiefpreisgarantie</span>
            <span className="hidden sm:inline text-primary-foreground/80 text-sm">
              – Günstiger geht nicht! Details →
            </span>
          </button>
        </DialogTrigger>
        <PriceGuaranteeDialogContent />
      </Dialog>
    );
  }

  if (variant === "card") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg p-3 w-full text-left hover:bg-primary/10 transition-colors cursor-pointer",
              className
            )}
          >
            <Shield className="h-8 w-8 text-primary flex-shrink-0" />
            <div>
              <p className="font-bold text-sm text-primary">Tiefpreisgarantie</p>
              <p className="text-xs text-muted-foreground">
                10 % günstiger als jeder Wettbewerber. Details →
              </p>
            </div>
          </button>
        </DialogTrigger>
        <PriceGuaranteeDialogContent />
      </Dialog>
    );
  }

  // inline variant (for product cards)
  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <button
          className={cn(
            "inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline cursor-pointer",
            className
          )}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setOpen(true);
          }}
        >
          <Shield className="h-3 w-3" />
          Tiefpreisgarantie
        </button>
        <PriceGuaranteeDialogContent />
      </Dialog>
    </span>
  );
}

function PriceGuaranteeDialogContent() {
  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-primary">
          <Shield className="h-6 w-6" />
          SLT Rental Tiefpreisgarantie
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 text-sm text-muted-foreground">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="font-semibold text-foreground mb-2">Unser Versprechen:</p>
          <p>
            Sollten Sie ein <strong>identisches Mietprodukt</strong> im Radius von{" "}
            <strong>10 km ab Mietstandort</strong> woanders noch günstiger finden, erhalten Sie bei
            uns das Produkt zu einem <strong>10 % günstigeren Preis</strong> als beim Wettbewerber.
          </p>
        </div>

        <div>
          <p className="font-semibold text-foreground mb-1">Bedingungen:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Ausgenommen sind Privatvermieter / Kleingewerbetreibende ohne Ausweis der
              Umsatzsteuer.
            </li>
            <li>Es gilt immer der Preis <strong>Netto exkl. USt.</strong></li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-foreground mb-1">So funktioniert's:</p>
          <p>
            Zur Geltendmachung reichen Sie einfach ein gültiges Angebot des Wettbewerbers per E-Mail
            ein an:
          </p>
          <a
            href="mailto:Preisgarantie@slt-rental.de"
            className="inline-flex items-center gap-1 mt-2 font-bold text-primary hover:underline"
          >
            Preisgarantie@slt-rental.de
          </a>
        </div>
      </div>
    </DialogContent>
  );
}
