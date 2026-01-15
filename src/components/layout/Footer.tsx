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
      <div className="section-container py-8 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="mb-4 inline-block">
              <img 
                src={sltLogo} 
                alt="SLT Rental - Baumaschinen & Equipment" 
                className="h-32 sm:h-36 lg:h-44 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-primary-foreground/80 text-xs mb-4 max-w-xs leading-relaxed">
              Dein zuverlässiger Partner für Baumaschinen, Anhänger und Equipment-Vermietung in NRW.
            </p>
            
            {/* Trust Badges - compact */}
            <div className="flex gap-6 mb-4">
              <div>
                <span className="block text-lg font-bold text-accent">+3.500</span>
                <span className="text-xs text-primary-foreground/60">Kunden</span>
              </div>
              <div>
                <span className="block text-lg font-bold text-accent">+800</span>
                <span className="text-xs text-primary-foreground/60">Produkte</span>
              </div>
              <div>
                <span className="block text-lg font-bold text-accent">3</span>
                <span className="text-xs text-primary-foreground/60">Standorte</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold mb-3 text-white text-sm">Produkte</h4>
            <ul className="space-y-1.5">
              {footerLinks.produkte.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-xs text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-white text-sm">Service</h4>
            <ul className="space-y-1.5">
              {footerLinks.service.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-xs text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="font-semibold mb-3 mt-4 text-white text-sm">Unternehmen</h4>
            <ul className="space-y-1.5">
              {footerLinks.unternehmen.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-xs text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-3 text-white text-sm">Kontakt</h4>
            <ul className="space-y-3">
              {locations.map((loc) => (
                <li key={loc.name} className="text-xs">
                  <span className="font-medium text-primary-foreground text-xs">{loc.name}</span>
                  <div className="flex items-start gap-1.5 mt-0.5 text-primary-foreground/70">
                    <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>{loc.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-primary-foreground/70">
                    <Phone className="h-3 w-3 shrink-0" />
                    <a href={`tel:${loc.phone.replace(/\s/g, "")}`} className="hover:text-accent transition-colors">
                      {loc.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-primary-foreground/70">
                    <Mail className="h-3 w-3 shrink-0" />
                    <a href={`mailto:${loc.email}`} className="hover:text-accent transition-colors">
                      {loc.email}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="section-container py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
          <span>© {new Date().getFullYear()} SLT Technology Group GmbH & Co. KG. Alle Rechte vorbehalten.</span>
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
