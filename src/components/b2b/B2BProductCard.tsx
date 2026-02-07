import { Product } from "@/data/rentalData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Percent } from "lucide-react";

interface B2BProductCardProps {
  product: Product;
  categorySlug: string;
  discountPercent: number;
  onInquiry: (product: Product) => void;
}

export function B2BProductCard({ product, categorySlug, discountPercent, onInquiry }: B2BProductCardProps) {
  const imgSrc = product.image || "/placeholder.svg";
  const hasDiscount = discountPercent > 0;

  return (
    <Card className="group h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {hasDiscount && (
          <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground font-bold text-sm px-2 py-1">
            <Percent className="h-3 w-3 mr-1" />
            -{discountPercent}%
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="flex-1 flex flex-col p-4">
        <h3 className="font-semibold text-headline text-sm leading-tight mb-1 line-clamp-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
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

          <Button
            size="sm"
            className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover"
            onClick={() => onInquiry(product)}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            Anfrage senden
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
