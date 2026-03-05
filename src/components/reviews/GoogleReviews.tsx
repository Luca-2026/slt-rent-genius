import { useEffect, useState } from "react";
import { Star, ExternalLink, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedSection } from "@/components/ui/animated-section";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  authorName: string;
  authorPhoto: string | null;
  rating: number;
  text: string;
  relativeTime: string;
}

interface ReviewData {
  rating: number;
  totalReviews: number;
  reviews: Review[];
}

interface GoogleReviewsProps {
  placeId: string;
  locationName: string;
  /** Compact mode for location cards, full mode for dedicated sections */
  variant?: "compact" | "full";
  /** Max number of reviews to display (useful for mobile) */
  maxReviews?: number;
}

const PLACE_IDS: Record<string, string> = {
  krefeld: "ChIJRyajcmSxuEcRAHvlWgXfF5c",
  bonn: "ChIJf2ituEblvkcRUGua8HYhHCA",
};

const GOOGLE_REVIEW_URLS: Record<string, string> = {
  krefeld: "https://search.google.com/local/writereview?placeid=ChIJRyajcmSxuEcRAHvlWgXfF5c",
  bonn: "https://search.google.com/local/writereview?placeid=ChIJf2ituEblvkcRUGua8HYhHCA",
};

export function getPlaceId(locationId: string): string | undefined {
  return PLACE_IDS[locationId];
}

export function getReviewUrl(locationId: string): string | undefined {
  return GOOGLE_REVIEW_URLS[locationId];
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const sizeClass = size === "lg" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}

export function GoogleReviews({ placeId, locationName, variant = "full", maxReviews }: GoogleReviewsProps) {
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Find the locationId from placeId
  const locationId = Object.entries(PLACE_IDS).find(([, id]) => id === placeId)?.[0] || "";
  const reviewUrl = GOOGLE_REVIEW_URLS[locationId];

  useEffect(() => {
    let cancelled = false;

    async function fetchReviews() {
      try {
        const { data: result, error: fnError } = await supabase.functions.invoke("google-reviews", {
          body: { placeId },
        });
        if (fnError) throw fnError;
        if (!cancelled && result) {
          setData(result);
        }
      } catch (err) {
        console.error("Failed to fetch Google reviews:", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchReviews();
    return () => { cancelled = true; };
  }, [placeId]);

  if (error) return null; // Silently fail - don't break the page

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3">
        {loading ? (
          <Skeleton className="h-5 w-32" />
        ) : data ? (
          <>
            <div className="flex items-center gap-1.5">
              <StarRating rating={data.rating} />
              <span className="text-sm font-semibold text-foreground">{data.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({data.totalReviews})</span>
            </div>
            {reviewUrl && (
              <a href={reviewUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                  <PenLine className="h-3 w-3" />
                  Bewerten
                </Button>
              </a>
            )}
          </>
        ) : null}
      </div>
    );
  }

  // Full variant
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header with rating summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="https://www.google.com/favicon.ico" alt="Google" className="h-6 w-6" />
            <span className="text-lg font-bold text-foreground">Google Bewertungen</span>
          </div>
          <div className="flex items-center gap-2">
            <StarRating rating={data.rating} size="lg" />
            <span className="text-xl font-bold text-foreground">{data.rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({data.totalReviews} Bewertungen)</span>
          </div>
        </div>
        <div className="flex gap-2">
          {reviewUrl && (
            <a href={reviewUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <PenLine className="h-4 w-4" />
                Bewertung schreiben
              </Button>
            </a>
          )}
          <a
            href={`https://search.google.com/local/reviews?placeid=${placeId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" className="gap-2 text-muted-foreground">
              <ExternalLink className="h-4 w-4" />
              Alle ansehen
            </Button>
          </a>
        </div>
      </div>

      {/* Reviews grid */}
      {data.reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(maxReviews ? data.reviews.slice(0, maxReviews) : data.reviews).map((review, index) => (
            <AnimatedSection key={index} delay={index * 80} animation="fade-in-up">
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-9 w-9">
                      {review.authorPhoto && (
                        <AvatarImage src={review.authorPhoto} alt={review.authorName} />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {review.authorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{review.authorName}</p>
                      <p className="text-xs text-muted-foreground">{review.relativeTime}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                  {review.text && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-4">{review.text}</p>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      )}
    </div>
  );
}
