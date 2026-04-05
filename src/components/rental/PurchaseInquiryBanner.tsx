import { useNavigate } from "react-router-dom";
import { ShoppingCart, ExternalLink } from "lucide-react";

interface PurchaseInquiryBannerProps {
  productName: string;
  locationName: string;
  locationEmail?: string;
  categoryId?: string;
}

export function PurchaseInquiryBanner({ productName, categoryId }: PurchaseInquiryBannerProps) {
  const navigate = useNavigate();

  const goToKaufanfrage = () => {
    navigate("/verkauf#kaufanfrage");
  };

  return (
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
          {(categoryId === "erdbewegung" || categoryId === "arbeitsbuehnen") && (
            <a
              href="https://www.zoomlion-nrw.de"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              Zoomlion Neumaschinen auf www.zoomlion-nrw.de
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
