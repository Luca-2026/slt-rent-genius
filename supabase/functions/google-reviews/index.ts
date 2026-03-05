import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CACHE_TTL_MINUTES = 60; // Cache for 1 hour

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { placeId } = await req.json();
    
    if (!placeId) {
      return new Response(JSON.stringify({ error: 'placeId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check cache first
    const { data: cached } = await supabase
      .from('google_reviews_cache')
      .select('*')
      .eq('place_id', placeId)
      .single();

    if (cached) {
      const fetchedAt = new Date(cached.fetched_at).getTime();
      const now = Date.now();
      const ageMinutes = (now - fetchedAt) / 1000 / 60;

      if (ageMinutes < CACHE_TTL_MINUTES) {
        console.log(`Cache hit for ${placeId} (age: ${Math.round(ageMinutes)}min)`);
        return new Response(JSON.stringify({
          rating: cached.rating,
          totalReviews: cached.total_reviews,
          reviews: cached.reviews,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Cache miss or stale — fetch from Google
    console.log(`Cache miss for ${placeId}, fetching from Google API`);

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_PLACES_API_KEY is not configured');
    }

    const url = `https://places.googleapis.com/v1/places/${placeId}?fields=rating,userRatingCount,reviews&languageCode=de&key=${apiKey}`;
    
    const response = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'rating,userRatingCount,reviews',
        'X-Goog-Reviews-Sort': 'newest',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Google Places API error [${response.status}]:`, errorBody);
      
      // If API fails but we have stale cache, return stale data
      if (cached) {
        console.log('Returning stale cache due to API error');
        return new Response(JSON.stringify({
          rating: cached.rating,
          totalReviews: cached.total_reviews,
          reviews: cached.reviews,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Google Places API failed [${response.status}]: ${errorBody}`);
    }

    const data = await response.json();

    const reviews = (data.reviews || [])
      .map((review: any) => ({
        authorName: review.authorAttribution?.displayName || 'Anonym',
        authorPhoto: review.authorAttribution?.photoUri || null,
        rating: review.rating || 0,
        text: review.text?.text || '',
        relativeTime: review.relativePublishTimeDescription || '',
        publishTime: review.publishTime || '',
      }))
      .sort((a: any, b: any) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime())
      .slice(0, 5);

    const result = {
      rating: data.rating || 0,
      totalReviews: data.userRatingCount || 0,
      reviews,
    };

    // Upsert cache
    await supabase
      .from('google_reviews_cache')
      .upsert({
        place_id: placeId,
        rating: result.rating,
        total_reviews: result.totalReviews,
        reviews: result.reviews,
        fetched_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'place_id' });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
