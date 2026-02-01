import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";
import sltLogo from "@/assets/slt-logo.png";
import { getAreasForLocation } from "@/data/localSeoData";

const locations = [
  {
    id: "krefeld",
    name: "Krefeld",
    address: "Anrather Straße 291, 47807 Krefeld-Fichtenhain",
    phone: "02151 417 990 4",
    email: "krefeld@slt-rental.de",
  },
  {
    id: "bonn",
    name: "Bonn",
    address: "Drachenburgstraße 8, 53179 Bonn",
    phone: "0228 50466061",
    email: "bonn@slt-rental.de",
  },
  {
    id: "muelheim",
    name: "Mülheim",
    address: "Ruhrorter Str. 100, 45478 Mülheim an der Ruhr",
    phone: "02151 417 99 04",
    email: "krefeld@slt-rental.de",
  },
];

const quickLinks = [
  { to: "/produkte", label: "Produkte" },
  { to: "/so-funktionierts", label: "So funktioniert's" },
  { to: "/lieferung", label: "Lieferkosten" },
  { to: "/standorte", label: "Standorte" },
  { to: "/karriere", label: "Karriere" },
  { to: "/kontakt", label: "Kontakt" },
  { to: "/faq", label: "FAQ" },
];

const legalLinks = [
  { to: "/impressum", label: "Impressum" },
  { to: "/datenschutz", label: "Datenschutz" },
  { to: "/agb", label: "AGB" },
];

export function Footer() {
  return (
    <footer className="bg-primary">
      {/* Main Footer */}
      <div className="section-container py-6">
        {/* Top Row: Logo + Locations */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12">
          {/* Logo - clipped to remove margins, aligned left */}
          <Link to="/" className="shrink-0 h-16 lg:h-20 overflow-hidden flex items-center -ml-4">
            <img 
              src={sltLogo} 
              alt="SLT Rental" 
              className="h-36 lg:h-44 w-auto brightness-0 invert max-w-none"
            />
          </Link>

          {/* Locations Row */}
          <div className="flex flex-wrap gap-6 lg:gap-10">
            {locations.map((loc) => (
              <div key={loc.name} className="text-white">
                <h4 className="font-bold text-white text-sm mb-2">{loc.name}</h4>
                <div className="space-y-1 text-xs text-white/70">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{loc.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <a href={`tel:${loc.phone.replace(/\s/g, "")}`} className="hover:text-accent transition-colors">
                      {loc.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <a href={`mailto:${loc.email}`} className="hover:text-accent transition-colors">
                      {loc.email}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-4" />

        {/* Local SEO Links by Region */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
            Mietgeräte in Ihrer Nähe
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {locations.map((loc) => {
              const areas = getAreasForLocation(loc.id).filter(a => a.distance > 0).slice(0, 6);
              return (
                <div key={loc.id}>
                  <span className="text-xs font-medium text-white/70 block mb-1">Region {loc.name}:</span>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {areas.map((area) => (
                      <Link
                        key={area.slug}
                        to={`/mieten-in/${area.slug}`}
                        className="text-xs text-white/50 hover:text-accent transition-colors"
                      >
                        {area.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-4" />

        {/* Bottom Row: Links + Social */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Quick Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-xs text-white/70 hover:text-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com/sltrental"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4 text-white" />
            </a>
            <a
              href="https://www.instagram.com/slt_rental"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4 text-white" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-primary/90 border-t border-white/5">
        <div className="section-container py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <span>© {new Date().getFullYear()} SLT Technology Group GmbH & Co. KG</span>
          <div className="flex gap-4">
            {legalLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className="hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
