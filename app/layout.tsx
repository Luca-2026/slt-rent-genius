import type { Metadata, Viewport } from 'next'
import { Inter, Bricolage_Grotesque } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { JsonLd } from '@/components/seo/json-ld'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.minibagger-krefeld.de'),
  title: {
    default: 'Minibagger mieten in Krefeld – 1t bis 5t sofort verfügbar | SLT Rental',
    template: '%s | SLT Rental Krefeld',
  },
  description:
    'Minibagger mieten in Krefeld: Bobcat E10Z, XCMG XE20E/XE27E, Bobcat E35z & E50z. Von 1 t bis 5 t inkl. Anbaugeräten. Lieferung in ganz NRW. Tiefpreisgarantie.',
  keywords: [
    'Minibagger mieten Krefeld',
    'Minibagger Vermietung',
    'Bagger mieten NRW',
    'Bobcat Krefeld',
    'XCMG Minibagger',
    'SLT Rental',
  ],
  authors: [{ name: 'SLT Technology Group GmbH & Co. KG' }],
  creator: 'SLT Technology Group GmbH & Co. KG',
  publisher: 'SLT Technology Group GmbH & Co. KG',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://www.minibagger-krefeld.de/',
    siteName: 'minibagger-krefeld.de',
    title: 'Minibagger mieten in Krefeld – 1t bis 5t | SLT Rental',
    description:
      'Minibagger jeder Klasse aus Krefeld-Fichtenhain. Lieferung in ganz NRW. Tiefpreisgarantie.',
    images: [
      {
        url: '/og/home.jpg',
        width: 1200,
        height: 630,
        alt: 'SLT Rental Minibagger in Krefeld',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Minibagger mieten in Krefeld – 1t bis 5t | SLT Rental',
    description:
      'Minibagger jeder Klasse aus Krefeld-Fichtenhain. Lieferung in ganz NRW. Tiefpreisgarantie.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.minibagger-krefeld.de/',
  },
}

export const viewport: Viewport = {
  themeColor: '#00507d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="de"
      className={`${inter.variable} ${bricolage.variable} bg-background`}
    >
      <body className="font-sans min-h-screen flex flex-col">
        <JsonLd type="organization" />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
