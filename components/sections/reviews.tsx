import { Star, ExternalLink } from 'lucide-react'

const reviews = [
  {
    author: 'Michael S.',
    rating: 5,
    text: 'Super Service! Der 2,7-Tonner war perfekt für unsere Gartenumgestaltung. Unkomplizierte Abholung und faire Preise.',
    date: 'März 2026',
  },
  {
    author: 'Sandra K.',
    rating: 5,
    text: 'Haben den kleinen Bobcat E10Z für einen Kellerdurchbruch gemietet. Hat durch jede Tür gepasst! Sehr kompetente Beratung.',
    date: 'Februar 2026',
  },
  {
    author: 'Thomas W.',
    rating: 5,
    text: 'Poolaushub in einem Tag erledigt. Die Lieferung nach Meerbusch war pünktlich und der Preis unschlagbar.',
    date: 'Januar 2026',
  },
  {
    author: 'Andreas M.',
    rating: 5,
    text: 'Bereits zum dritten Mal hier gemietet. Immer top Geräte und das Team ist super freundlich. Klare Empfehlung!',
    date: 'Dezember 2025',
  },
]

export function ReviewsSection() {
  return (
    <section className="py-16 lg:py-24 bg-surface-light">
      <div className="section-container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-slt-yellow/20 text-foreground px-4 py-2 rounded-full mb-4">
            <Star className="h-5 w-5 fill-slt-yellow text-slt-yellow" />
            <span className="font-semibold">5,0 von 5 Sternen</span>
            <span className="text-body">· 195 Bewertungen</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-headline mb-4">
            Das sagen unsere Kunden
          </h2>
          <p className="text-lg text-body max-w-2xl mx-auto">
            Echte Bewertungen von Kunden aus Krefeld und Umgebung.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review) => (
            <div key={review.author} className="bg-background rounded-xl p-6 shadow-sm border border-border">
              {/* Stars */}
              <div className="flex gap-1 mb-3">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-slt-yellow text-slt-yellow" />
                ))}
              </div>
              {/* Review Text */}
              <p className="text-body text-sm mb-4 leading-relaxed">
                &quot;{review.text}&quot;
              </p>
              {/* Author */}
              <div className="flex items-center justify-between">
                <span className="font-medium text-headline">{review.author}</span>
                <span className="text-xs text-muted-foreground">{review.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="https://search.google.com/local/reviews?placeid=ChIJRyajcmSxuEcRAHvlWgXfF5c"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            Alle 195 Bewertungen auf Google ansehen
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
