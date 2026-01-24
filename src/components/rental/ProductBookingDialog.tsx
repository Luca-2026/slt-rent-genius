import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Phone, Mail } from "lucide-react";
import type { Product, LocationData } from "@/data/rentalData";

interface ProductBookingDialogProps {
  product: Product | null;
  location: LocationData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductBookingDialog({ 
  product, 
  location, 
  isOpen, 
  onClose 
}: ProductBookingDialogProps) {
  const widgetContainerRef = useRef<HTMLDivElement>(null);

  // Inject Rentware widget when dialog opens
  useEffect(() => {
    if (!isOpen || !product || !location || !widgetContainerRef.current) return;
    
    const container = widgetContainerRef.current;
    container.innerHTML = '';

    // Check if we have a Rentware code snippet for this product and location
    const rentwareCode = product.rentwareCode?.[location.id];
    
    if (rentwareCode) {
      // Inject the Rentware code snippet
      container.innerHTML = rentwareCode;
      
      // Execute any scripts in the injected HTML
      const scripts = container.querySelectorAll('script');
      scripts.forEach((script) => {
        const newScript = document.createElement('script');
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        document.body.appendChild(newScript);
      });
    }
    
    return () => {
      container.innerHTML = '';
    };
  }, [isOpen, product, location]);

  if (!product || !location) return null;

  const hasRentwareWidget = product.rentwareCode?.[location.id];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold pr-8">
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Location Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                Standort
              </Badge>
              <span className="font-semibold text-foreground">{location.name}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {location.address}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                {location.phone}
              </span>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            {product.image && (
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {product.description && (
              <p className="text-muted-foreground">{product.description}</p>
            )}

            {product.features && product.features.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Eigenschaften</h4>
                <ul className="grid grid-cols-2 gap-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pricing */}
            {(product.pricePerDay || product.priceWeekend) && (
              <div className="bg-primary/5 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Preise</h4>
                <div className="flex gap-6">
                  {product.pricePerDay && (
                    <div>
                      <p className="text-2xl font-bold text-primary">{product.pricePerDay}</p>
                      <p className="text-sm text-muted-foreground">pro Tag</p>
                    </div>
                  )}
                  {product.priceWeekend && (
                    <div>
                      <p className="text-2xl font-bold text-accent">{product.priceWeekend}</p>
                      <p className="text-sm text-muted-foreground">Weekend-Tarif</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Rentware Widget Container */}
          <div 
            ref={widgetContainerRef} 
            className="min-h-[200px] border border-border rounded-lg p-4"
          >
            {!hasRentwareWidget && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Das Buchungswidget wird geladen...
                </p>
                <p className="text-sm text-muted-foreground">
                  Kontaktiere uns für eine Buchung:
                </p>
                <div className="flex justify-center gap-4 mt-4">
                  <a href={`tel:${location.phone.replace(/\s/g, '')}`}>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      {location.phone}
                    </Button>
                  </a>
                  <a href={`mailto:${location.email}`}>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      E-Mail senden
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
