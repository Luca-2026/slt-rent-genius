import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Mail } from "lucide-react";
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
  const articleId = product?.rentwareCode?.[location?.id || ""];
  const containerId = `rentware-dialog-${product?.id || "unknown"}`;

  // Inject Rentware widget when dialog opens
  useEffect(() => {
    if (!isOpen || !articleId) return;
    
    // Small delay to ensure the DOM element exists
    const timer = setTimeout(() => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `<rtr-article article-id="${articleId}" view="calendar"></rtr-article>`;
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [isOpen, articleId, containerId]);

  if (!product || !location) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {articleId ? (
          // Only show Rentware widget when available
          <div 
            id={containerId}
            className="min-h-[500px] p-4"
          />
        ) : (
          // Fallback inquiry form when no Rentware code
          <>
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-xl font-bold pr-8">
                {product.name}
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-6">
              {/* Product Image */}
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

              {/* Contact Fallback */}
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground mb-2">
                  Dieser Artikel ist nur auf Anfrage verfügbar.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Kontaktiere uns für eine Buchung:
                </p>
                <div className="flex justify-center gap-4">
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
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
