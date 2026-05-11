// Real Google Reviews snapshot from google_reviews_cache (2026-05-10)
// DO NOT invent values. Update by re-querying google_reviews_cache.
// Used by Product JSON-LD (schemas-rental.ts + ProductDetail.tsx) to satisfy
// Google's "review" Rich Results recommendation alongside aggregateRating.

export interface RealReview {
  author: string;
  rating: number;
  text: string;
  datePublished: string; // ISO
}

export interface LocationReviewData {
  ratingValue: string;
  reviewCount: string;
  reviews: RealReview[];
}

export const REAL_LOCATION_REVIEWS: Record<string, LocationReviewData> = {
  krefeld: {
    ratingValue: "5.0",
    reviewCount: "207",
    reviews: [
      {
        author: "Kerstin Mosters",
        rating: 5,
        text: "Wir haben fürs Wochenende ein 7,5 kVA Stromaggregat geliehen. Es hat alles wunderbar geklappt! Nächstes Jahr leihen wir es gerne wieder.",
        datePublished: "2026-02-17",
      },
      {
        author: "Sandra Schmithuisen",
        rating: 5,
        text: "Für unseren Karnevalswagen haben wir hier ein Stromaggregat geliehen. Es hat alles super geklappt.",
        datePublished: "2026-02-17",
      },
    ],
  },
  bonn: {
    ratingValue: "4.9",
    reviewCount: "105",
    reviews: [
      {
        author: "Be Jay",
        rating: 5,
        text: "Die Anmietung des Minibaggers bei SLT in Bonn ist ohne Einschränkung zu empfehlen. Die Beratung vor Ort sowie die Betreuung rund um das Mieten waren sehr gut, sodass ich dort gerne wieder mieten werde.",
        datePublished: "2026-03-05",
      },
      {
        author: "Yasser Kassem",
        rating: 5,
        text: "Ich habe mit SLT Rent in Bonn-Mehlem bisher die besten Erfahrungen gemacht, sowohl bei der Verfügbarkeit der Geräte als auch beim Service. Der Anhänger war sauber, voll funktionsfähig und in top Zustand. Klare Empfehlung!",
        datePublished: "2026-01-27",
      },
    ],
  },
  // Mülheim hat keine eigene Place ID → nutzt Krefeld-Daten (gleiche Firma)
  muelheim: {
    ratingValue: "5.0",
    reviewCount: "207",
    reviews: [
      {
        author: "Kerstin Mosters",
        rating: 5,
        text: "Wir haben fürs Wochenende ein 7,5 kVA Stromaggregat geliehen. Es hat alles wunderbar geklappt! Nächstes Jahr leihen wir es gerne wieder.",
        datePublished: "2026-02-17",
      },
      {
        author: "Sandra Schmithuisen",
        rating: 5,
        text: "Für unseren Karnevalswagen haben wir hier ein Stromaggregat geliehen. Es hat alles super geklappt.",
        datePublished: "2026-02-17",
      },
    ],
  },
};
