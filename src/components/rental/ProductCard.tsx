import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/data/rentalData";
import { useTranslatedProduct } from "@/hooks/useTranslatedProduct";
import { PriceGuaranteeBadge } from "@/components/PriceGuaranteeBadge";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  linkTo?: string; // Optional link for SEO-friendly navigation
}

export function ProductCard({ product: rawProduct, onClick, linkTo }: ProductCardProps) {
  const product = useTranslatedProduct(rawProduct)!;
  const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasMultipleImages = images.length > 1;

  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const goToSlide = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex(index);
  }, []);

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger onClick if no linkTo is provided
    if (onClick && !linkTo) {
      onClick();
    }
  };

  const cardContent = (
    <>
      {/* Product Image Slider */}
      <div className="aspect-[4/3] bg-muted/50 flex items-center justify-center relative overflow-hidden">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentIndex]}
              alt={`${product.name} – ${currentIndex === 0 ? 'Produktbild' : `Ansicht ${currentIndex + 1}`} | SLT Rental`}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Navigation Arrows */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  aria-label="Vorheriges Bild"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  aria-label="Nächstes Bild"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Dot Indicators */}
            {hasMultipleImages && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => goToSlide(e, index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex 
                        ? "bg-primary w-4" 
                        : "bg-background/70 hover:bg-background"
                    }`}
                    aria-label={`Bild ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Image Counter Badge */}
            {hasMultipleImages && (
              <Badge 
                variant="secondary" 
                className="absolute top-2 left-2 bg-background/80 text-xs font-medium"
              >
                {currentIndex + 1}/{images.length}
              </Badge>
            )}
          </>
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
      <CardContent className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
            {product.description}
          </p>
        )}

        {/* Pricing */}
        <div className="space-y-2 mt-auto">
          <div>
            {product.pricePerDay && (
              <p className="text-lg font-bold text-primary mb-1">
                {product.pricePerDay}
                <span className="text-sm font-normal text-muted-foreground">/Tag</span>
              </p>
            )}
            <PriceGuaranteeBadge variant="inline" />
          </div>
          
          <Button 
            size="default" 
            className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover"
            onClick={(e) => {
              if (onClick && !linkTo) {
                e.preventDefault();
                e.stopPropagation();
                onClick();
              }
            }}
          >
            Als Privatkunde mieten
          </Button>
          
          <Link 
            to="/b2b/login" 
            className="block"
            onClick={(e) => e.stopPropagation()}
          >
            <Button 
              size="default" 
              variant="default"
              className="w-full"
            >
              B2B-Konditionen anfragen
            </Button>
          </Link>
        </div>
      </CardContent>
    </>
  );

  // If linkTo is provided, wrap in Link for SEO
  if (linkTo) {
    return (
      <Link to={linkTo} className="block h-full">
        <Card className="h-full flex flex-col group hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer overflow-hidden">
          {cardContent}
        </Card>
      </Link>
    );
  }

  // Otherwise, use onClick handler
  return (
    <Card 
      className="h-full flex flex-col group hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      {cardContent}
    </Card>
  );
}
