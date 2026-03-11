import { Product } from "@/data/rentalData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Percent, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriceGuaranteeBadge } from "@/components/PriceGuaranteeBadge";
import { useNavigate } from "react-router-dom";
interface B2BProductCardProps {
  product: Product;
  categorySlug: string;
  locationId: string;
  discountPercent: number;
  onInquiry: (product: Product) => void;
  isSelected?: boolean;
  onToggleSelect?: (product: Product) => void;
  selectionMode?: boolean;
}

export function B2BProductCard({
  product,
  categorySlug,
  locationId,
  discountPercent,
  onInquiry,
  isSelected = false,
  onToggleSelect,
  selectionMode = false,
}: B2BProductCardProps) {
  const navigate = useNavigate();
  const imgSrc = product.image || "/placeholder.svg";
  const hasDiscount = discountPercent > 0;

  const handleCardClick = () => {
    if (onToggleSelect) {
      onToggleSelect(product);
    }
  };

  const handleDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/b2b/produkte/${locationId}/${categorySlug}/${product.id}`);
  };

  return (
    <Card
      className={cn(
        "group h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer",
        isSelected && "ring-2 ring-accent shadow-lg"
      )}
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Selection indicator */}
        <div className="absolute top-2 left-2 z-10">
          <div
            className={cn(
              "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
              isSelected
                ? "bg-accent border-accent text-accent-foreground"
                : "bg-background/80 border-muted-foreground/30 backdrop-blur-sm"
            )}
          >
            {isSelected && <Check className="h-4 w-4" />}
          </div>
        </div>
        {hasDiscount && (
          <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground font-bold text-sm px-2 py-1">
            <Percent className="h-3 w-3 mr-1" />
            -{discountPercent}%
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="flex-1 flex flex-col p-3 sm:p-4">
        <h3 className="font-semibold text-headline text-sm leading-tight mb-0.5 line-clamp-2">
          {product.name}
        </h3>
        {product.modelName && (
          <p className="text-xs text-muted-foreground font-medium mb-1">{product.modelName}</p>
        )}
        {product.description && (
          <p className="text-xs text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price info */}
        <div className="mt-auto space-y-2">
          {product.pricePerDay && (
            <div className="flex items-baseline gap-2">
              <span className={`text-sm font-medium ${hasDiscount ? "line-through text-muted-foreground" : "text-headline"}`}>
                {product.pricePerDay}
              </span>
              {hasDiscount && (
                <span className="text-sm font-bold text-accent">
                  Ihr B2B-Preis
                </span>
              )}
            </div>
          )}
          {!product.pricePerDay && hasDiscount && (
            <p className="text-xs text-accent font-medium">
              {discountPercent}% B2B-Rabatt auf Listenpreis
            </p>
          )}
          <PriceGuaranteeBadge variant="inline" />

          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs px-2"
              onClick={handleDetailClick}
            >
              <ExternalLink className="h-3 w-3 sm:mr-1 flex-shrink-0" />
              <span>Details</span>
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-accent text-accent-foreground hover:bg-cta-orange-hover text-xs px-2"
              onClick={(e) => {
                e.stopPropagation();
                onInquiry(product);
              }}
            >
              <ShoppingCart className="h-3 w-3 sm:mr-1 flex-shrink-0" />
              <span>Anfrage</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
