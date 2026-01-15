import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin } from "lucide-react";
import sltLogo from "@/assets/slt-logo.png";

const footerLinks = {
  produkte: [
    { to: "/produkte/baumaschinen", label: "Baumaschinen" },
    { to: "/produkte/anhaenger", label: "Anhänger" },
    { to: "/produkte/arbeitsbuehnen", label: "Arbeitsbühnen" },
    { to: "/produkte/event", label: "Event-Equipment" },
    { to: "/produkte/trocknung", label: "Trocknung & Heizung" },
  ],
  service: [
    { to: "/so-funktionierts", label: "So funktioniert's" },
    { to: "/lieferung", label: "Lieferung & Abholung" },
    { to: "/faq", label: "FAQ" },
    { to: "/kontakt", label: "Kontakt" },
  ],
  unternehmen: [
    { to: "/ueber-uns", label: "Über uns" },
    { to: "/standorte", label: "Standorte" },
    { to: "/b2b", label: "B2B-Portal" },
  ],
  rechtliches: [
    { to: "/impressum", label: "Impressum" },
    { to: "/datenschutz", label: "Datenschutz" },
    { to: "/agb", label: "AGB" },
  ],
};

const locations = [
  {
    name: "Krefeld (Hauptsitz)",
    address: "Anrather Straße 291, 47807 Krefeld-Fichtenhain",
    phone: "02151 417 990 4",
    email: "krefeld@slt-rental.de",
  },
  {
    name: "Bonn",
    address: "Drachenburgstraße 8, 53179 Bonn",
    phone: "0228 50466061",
    email: "bonn@slt-rental.de",
  },
  {
    name: "Mülheim an der Ruhr",
    address: "Ruhrorter Str. 100, 45478 Mülheim an der Ruhr",
    phone: "02151 417 99 04",
    email: "krefeld@slt-rental.de",
  },
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="section-container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="mb-4 inline-block">
              <img 
                src={sltLogo} 
                alt="SLT Rental - Baumaschinen & Equipment" 
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-primary-foreground/80 text-sm mb-6 max-w-sm">
              Dein zuverlässiger Partner für Baumaschinen, Anhänger und Equipment-Vermietung in NRW. 
              Seit 2016 vertrauen uns über 3.500 Kunden.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="text-center">
                <span className="block text-2xl font-bold text-accent">+3.500</span>
                <span className="text-xs text-primary-foreground/70">Kunden</span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-accent">+800</span>
                <span className="text-xs text-primary-foreground/70">Produkte</span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-accent">3</span>
                <span className="text-xs text-primary-foreground/70">Standorte</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold mb-4">Produkte</h4>
            <ul className="space-y-2">
              {footerLinks.produkte.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Service</h4>
            <ul className="space-y-2">
              {footerLinks.service.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="font-semibold mb-4 mt-6">Unternehmen</h4>
            <ul className="space-y-2">
              {footerLinks.unternehmen.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Kontakt</h4>
            <ul className="space-y-4">
              {locations.map((loc) => (
                <li key={loc.name} className="text-sm">
                  <span className="font-medium text-primary-foreground">{loc.name}</span>
                  <div className="flex items-start gap-2 mt-1 text-primary-foreground/70">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{loc.address}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-primary-foreground/70">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <a href={`tel:${loc.phone.replace(/\s/g, "")}`} className="hover:text-accent transition-colors">
                      {loc.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-primary-foreground/70">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <a href={`mailto:${loc.email}`} className="hover:text-accent transition-colors">
                      {loc.email}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center gap-2 text-sm text-primary-foreground/70">
              <Clock className="h-3.5 w-3.5" />
              <span>Mo-Fr: 7:00-17:00 Uhr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="section-container py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
          <span>© {new Date().getFullYear()} SLT Rental GmbH. Alle Rechte vorbehalten.</span>
          <div className="flex gap-4">
            {footerLinks.rechtliches.map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-accent transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
