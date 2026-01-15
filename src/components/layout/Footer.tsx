import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";
import sltLogo from "@/assets/slt-logo.png";

const locations = [
  {
    name: "Krefeld",
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
    name: "Mülheim",
    address: "Ruhrorter Str. 100, 45478 Mülheim an der Ruhr",
    phone: "02151 417 99 04",
    email: "krefeld@slt-rental.de",
  },
];

const quickLinks = [
  { to: "/produkte", label: "Produkte" },
  { to: "/so-funktionierts", label: "So funktioniert's" },
  { to: "/standorte", label: "Standorte" },
  { to: "/ueber-uns", label: "Über uns" },
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
      <div className="section-container py-10">
        {/* Top Row: Logo + Locations */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-8">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <img 
              src={sltLogo} 
              alt="SLT Rental" 
              className="h-44 sm:h-52 lg:h-60 w-auto brightness-0 invert"
            />
          </Link>

          {/* Locations Row */}
          <div className="flex flex-wrap gap-8 lg:gap-12">
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
        <div className="border-t border-white/10 my-6" />

        {/* Bottom Row: Links + Social */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
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
