import Script from 'next/script'

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SLT Rental',
  legalName: 'SLT Technology Group GmbH & Co. KG',
  url: 'https://www.minibagger-krefeld.de',
  logo: 'https://www.minibagger-krefeld.de/slt-logo.png',
  sameAs: ['https://www.slt-rental.de', 'https://www.slt-tg.de'],
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'EquipmentRental',
  name: 'SLT Rental Krefeld – Minibagger-Vermietung',
  image: 'https://www.minibagger-krefeld.de/og/home.jpg',
  telephone: '+49 2151 4179904',
  email: 'krefeld@slt-rental.de',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Anrather Straße 291',
    addressLocality: 'Krefeld',
    postalCode: '47807',
    addressCountry: 'DE',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 51.3102,
    longitude: 6.5853,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '07:30',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '08:00',
      closes: '14:30',
    },
  ],
  priceRange: '€€',
  areaServed: [
    { '@type': 'City', name: 'Krefeld' },
    { '@type': 'City', name: 'Meerbusch' },
    { '@type': 'City', name: 'Willich' },
    { '@type': 'City', name: 'Düsseldorf' },
    { '@type': 'City', name: 'Duisburg' },
    { '@type': 'City', name: 'Neuss' },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '195',
  },
}

interface JsonLdProps {
  type: 'organization' | 'localBusiness' | 'faq' | 'breadcrumb' | 'product'
  data?: Record<string, unknown>
}

export function JsonLd({ type, data }: JsonLdProps) {
  let schema: Record<string, unknown>

  switch (type) {
    case 'organization':
      schema = organizationSchema
      break
    case 'localBusiness':
      schema = localBusinessSchema
      break
    case 'faq':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data?.questions || [],
      }
      break
    case 'breadcrumb':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data?.items || [],
      }
      break
    case 'product':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        ...data,
      }
      break
    default:
      schema = organizationSchema
  }

  return (
    <Script
      id={`json-ld-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function generateFaqSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    questions: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    items: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateProductSchema(product: {
  name: string
  description: string
  image: string
  brand: string
  weight: string
  depth: string
  url: string
}) {
  return {
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: product.url,
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Einsatzgewicht',
        value: product.weight,
      },
      {
        '@type': 'PropertyValue',
        name: 'Grabtiefe',
        value: product.depth,
      },
    ],
  }
}
