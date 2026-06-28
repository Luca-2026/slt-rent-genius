import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, ArrowRight } from "lucide-react";

interface Props {
  categoryId: string;
  categoryLabel: string;
  triggerLabel?: string;
  triggerClassName?: string;
}

const LOCATIONS = [
  { id: "krefeld", label: "Krefeld" },
  { id: "bonn", label: "Bonn" },
  { id: "muelheim", label: "Mülheim a. d. Ruhr" },
];

export function CategoryLocationDialog({ categoryId, categoryLabel, triggerLabel, triggerClassName }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-accent transition-colors"
        }
      >
        {triggerLabel ?? `Zur Kategorie ${categoryLabel}`} <ArrowRight className="h-4 w-4" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Standort wählen</DialogTitle>
            <DialogDescription>
              An welchem SLT-Standort möchtet ihr {categoryLabel} mieten?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 pt-2">
            {LOCATIONS.map((loc) => (
              <Link
                key={loc.id}
                to={`/mieten/${loc.id}/${categoryId}/`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-md border border-border px-4 py-3 hover:bg-muted transition-colors"
              >
                <span className="flex items-center gap-2 font-medium">
                  <MapPin className="h-4 w-4 text-accent" /> {loc.label}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
          <Button variant="outline" onClick={() => setOpen(false)} className="mt-2">
            Abbrechen
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
