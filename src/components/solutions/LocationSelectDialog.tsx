import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { locations } from "@/data/rentalData";

interface LocationSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetCategoryId?: string;
  title?: string;
  description?: string;
}

export function LocationSelectDialog({
  open,
  onOpenChange,
  targetCategoryId,
  title = "Standort wählen",
  description = "Wähle deinen Standort, um die verfügbaren Produkte zu sehen.",
}: LocationSelectDialogProps) {
  const navigate = useNavigate();

  const handleLocationSelect = (locationId: string) => {
    onOpenChange(false);
    if (targetCategoryId) {
      navigate(`/mieten/${locationId}/${targetCategoryId}`);
    } else {
      navigate(`/mieten/${locationId}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3 mt-4">
          {locations.map((location) => (
            <Button
              key={location.id}
              variant="outline"
              className="h-auto py-4 px-4 justify-start text-left hover:border-primary hover:bg-primary/5 w-full overflow-hidden"
              onClick={() => handleLocationSelect(location.id)}
            >
              <div className="flex items-start gap-3 min-w-0 w-full overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary">{location.shortName}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-headline">{location.name}</div>
                  <div className="text-sm text-muted-foreground break-words">{location.address}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
