import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import type { Product } from "@/data/rentalData";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card 
      className="h-full group hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Product Image */}
      <div className="aspect-[4/3] bg-muted/50 flex items-center justify-center relative overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Package className="h-8 w-8 text-primary/50" />
          </div>
        )}
        
        {/* Weekend Badge */}
        {product.priceWeekend && (
          <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs">
            Weekend-Tarif
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        {/* Pricing */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            {product.pricePerDay && (
              <p className="text-lg font-bold text-primary">
                {product.pricePerDay}
                <span className="text-sm font-normal text-muted-foreground">/Tag</span>
              </p>
            )}
          </div>
          
          <Button 
            size="sm" 
            className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
          >
            Jetzt mieten
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
