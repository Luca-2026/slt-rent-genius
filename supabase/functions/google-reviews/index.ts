import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_PLACES_API_KEY is not configured');
    }

    // Use Places API (New) - Place Details with newest reviews
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
      throw new Error(`Google Places API failed [${response.status}]: ${errorBody}`);
    }

    const data = await response.json();

    // Transform reviews to a simpler format
    const reviews = (data.reviews || []).slice(0, 5).map((review: any) => ({
      authorName: review.authorAttribution?.displayName || 'Anonym',
      authorPhoto: review.authorAttribution?.photoUri || null,
      rating: review.rating || 0,
      text: review.text?.text || '',
      relativeTime: review.relativePublishTimeDescription || '',
      publishTime: review.publishTime || '',
    }));

    return new Response(JSON.stringify({
      rating: data.rating || 0,
      totalReviews: data.userRatingCount || 0,
      reviews,
    }), {
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
