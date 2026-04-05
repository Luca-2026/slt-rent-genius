import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ShoppingCart, Send, ExternalLink } from "lucide-react";

interface PurchaseInquiryBannerProps {
  productName: string;
  locationName: string;
  locationEmail?: string;
  categoryId?: string;
}

export function PurchaseInquiryBanner({ productName, categoryId }: PurchaseInquiryBannerProps) {
  const [popupOpen, setPopupOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (sessionStorage.getItem("purchasePopupShown")) return;
    } catch {
      // Ignore storage restrictions in embedded previews
    }

    const timer = setTimeout(() => {
      setPopupMounted(true);
      setPopupOpen(true);
      try {
        sessionStorage.setItem("purchasePopupShown", "1");
      } catch {
        // Ignore storage restrictions in embedded previews
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const goToKaufanfrage = () => {
    setPopupOpen(false);
    navigate("/verkauf#kaufanfrage");
  };

  return (
    <>
      {/* Clickable banner on the page */}
      <div
        className="bg-accent/10 border border-accent/30 rounded-xl p-4 cursor-pointer hover:bg-accent/15 transition-colors group"
        onClick={goToKaufanfrage}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="h-4 w-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm">
              Lieber kaufen statt mieten?
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Alle Artikel können Sie bei uns auch zu besten Konditionen erwerben! Klicken Sie hier für eine unverbindliche Kaufanfrage.
            </p>
          </div>
        </div>
      </div>

      {/* Auto-popup after 2.5s — only mounts after timer fires */}
      {popupMounted && (
        <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-accent" />
                Lieber kaufen statt mieten?
              </DialogTitle>
              <DialogDescription>
                Alle Artikel können Sie bei uns auch zu besten Konditionen erwerben!
              </DialogDescription>
            </DialogHeader>
            <div className="text-center space-y-3 pt-2">
              <p className="text-sm text-muted-foreground">
                Stellen Sie jetzt eine unverbindliche Kaufanfrage für <span className="font-medium text-foreground">{productName}</span>.
              </p>
              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                onClick={goToKaufanfrage}
              >
                <Send className="h-4 w-4 mr-2" />
                Jetzt Kaufanfrage stellen
              </Button>
              {(categoryId === "erdbewegung" || categoryId === "arbeitsbuehnen") && (
                <a
                  href="https://www.zoomlion-nrw.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-primary hover:underline pt-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Zoomlion Neumaschinen auf www.zoomlion-nrw.de
                </a>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
