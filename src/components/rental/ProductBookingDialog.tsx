import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Loader2 } from "lucide-react";
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
  const [widgetLoading, setWidgetLoading] = useState(true);

  // Inject Rentware widget when dialog opens
  useEffect(() => {
    if (!isOpen || !articleId) return;
    
    setWidgetLoading(true);
    
    // Wait for the rtr-article custom element to be defined
    const mountWidget = () => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `<rtr-article article-id="${articleId}" view="calendar"></rtr-article>`;
        setWidgetLoading(false);
      }
    };
    
    // Check if custom element is already defined
    if (customElements.get('rtr-article')) {
      // Small delay for DOM to be ready
      const timer = setTimeout(mountWidget, 50);
      return () => clearTimeout(timer);
    } else {
      // Wait for custom element to be defined (max 5 seconds)
      let attempts = 0;
      const maxAttempts = 50;
      const interval = setInterval(() => {
        attempts++;
        if (customElements.get('rtr-article') || attempts >= maxAttempts) {
          clearInterval(interval);
          mountWidget();
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isOpen, articleId, containerId]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '';
      }
      setWidgetLoading(true);
    }
  }, [isOpen, containerId]);

  if (!product || !location) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {articleId ? (
          // Show Rentware widget when available
          <div className="relative">
            {widgetLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <div 
              id={containerId}
              className="min-h-[500px] p-4"
            />
          </div>
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
