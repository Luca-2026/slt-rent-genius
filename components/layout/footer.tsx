import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail } from 'lucide-react'

const footerLinks = {
  navigation: [
    { label: 'Startseite', href: '/' },
    { label: 'Ratgeber', href: '/ratgeber' },
    { label: 'Anwendungsfälle', href: '/anwendungsfaelle' },
    { label: 'Standort Krefeld', href: '/standort' },
    { label: 'Kontakt', href: '/kontakt' },
  ],
  sltRental: [
    { label: 'Alle Standorte', href: 'https://www.slt-rental.de/standorte', external: true },
    { label: 'B2B-Portal', href: 'https://www.slt-rental.de/b2b', external: true },
    { label: 'Kontakt', href: 'https://www.slt-rental.de/kontakt', external: true },
  ],
  legal: [
    { label: 'Impressum', href: '/impressum' },
    { label: 'Datenschutz', href: '/datenschutz' },
    { label: 'AGB', href: '/agb' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="section-container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="https://www.slt-rental.de" target="_blank" rel="noopener">
              <Image
                src="https://www.slt-rental.de/assets/slt-logo-DU6tYxoI.png"
                alt="SLT Rental Logo"
                width={140}
                height={47}
                className="h-10 w-auto brightness-0 invert mb-4"
              />
            </Link>
            <p className="text-lg font-semibold text-slt-yellow mb-4">
              Sei schlau, miet&apos; blau!
            </p>
            <div className="space-y-3 text-sm text-primary-foreground/80">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>
                  Anrather Straße 291<br />
                  47807 Krefeld-Fichtenhain
                </span>
              </div>
              <a
                href="tel:+4921514179904"
                className="flex items-center gap-3 hover:text-primary-foreground transition-colors"
              >
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span>02151 417 99 04</span>
              </a>
              <a
                href="mailto:krefeld@slt-rental.de"
                className="flex items-center gap-3 hover:text-primary-foreground transition-colors"
              >
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>krefeld@slt-rental.de</span>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-semibold text-base mb-4">Navigation</h3>
            <ul className="space-y-2">
              {footerLinks.navigation.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SLT Rental Links */}
          <div>
            <h3 className="font-semibold text-base mb-4">SLT Rental</h3>
            <ul className="space-y-2">
              {footerLinks.sltRental.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-base mb-4">Rechtliches</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/60">
              &copy; {new Date().getFullYear()} SLT Technology Group GmbH &amp; Co. KG. Alle Rechte vorbehalten.
            </p>
            <p className="text-sm text-primary-foreground/60">
              Ein Angebot von{' '}
              <a
                href="https://www.slt-rental.de"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-foreground transition-colors underline"
              >
                slt-rental.de
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
