import { HeroSection } from '@/components/sections/hero'
import { MinibaggerOverviewSection } from '@/components/sections/minibagger-overview'
import { UseCasesSection } from '@/components/sections/use-cases'
import { LocationTeaserSection } from '@/components/sections/location-teaser'
import { RatgeberPreviewSection } from '@/components/sections/ratgeber-preview'
import { HowItWorksSection } from '@/components/sections/how-it-works'
import { ReviewsSection } from '@/components/sections/reviews'
import { FaqSection } from '@/components/sections/faq'
import { faqData } from '@/lib/faq-data'
import { FinalCtaSection } from '@/components/sections/final-cta'
import { JsonLd, generateFaqSchema } from '@/components/seo/json-ld'

export default function HomePage() {
  return (
    <main>
      <JsonLd type="localBusiness" />
      <JsonLd type="faq" data={generateFaqSchema(faqData)} />
      
      <HeroSection />
      <MinibaggerOverviewSection />
      <UseCasesSection />
      <LocationTeaserSection />
      <RatgeberPreviewSection />
      <HowItWorksSection />
      <ReviewsSection />
      <FaqSection />
      <FinalCtaSection />
    </main>
  )
}
