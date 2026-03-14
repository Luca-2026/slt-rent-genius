import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";
import { useTranslation } from "react-i18next";
import sltLogo from "@/assets/slt-logo.png";
import { getAreasForLocation } from "@/data/localSeoData";

const locations = [
  {
    id: "krefeld",
    name: "Krefeld",
    address: "Anrather Straße 291, 47807 Krefeld-Fichtenhain",
    phone: "02151 417 99 04",
    email: "krefeld@slt-rental.de",
  },
  {
    id: "bonn",
    name: "Bonn",
    address: "Drachenburgstraße 8, 53179 Bonn",
    phone: "0228 504 660 61",
    email: "bonn@slt-rental.de",
  },
  {
    id: "muelheim",
    name: "Mülheim",
    address: "Ruhrorter Str. 122, 45478 Mülheim an der Ruhr",
    phone: "02151 417 99 04",
    email: "krefeld@slt-rental.de",
  },
];

export function Footer() {
  const { t } = useTranslation();

  const quickLinks = [
    { to: "/produkte", label: t("footer.products") },
    { to: "/so-funktionierts", label: t("footer.howItWorks") },
    { to: "/hilfe", label: t("footer.help") },
    { to: "/lieferung", label: t("footer.deliveryCosts") },
    { to: "/standorte", label: t("footer.locations") },
    { to: "/karriere", label: t("footer.career") },
    { to: "/kontakt", label: t("footer.contact") },
    { to: "/faq", label: t("footer.faq") },
  ];

  const legalLinks = [
    { to: "/impressum", label: t("footer.imprint") },
    { to: "/datenschutz", label: t("footer.privacy") },
    { to: "/agb", label: t("footer.terms") },
  ];

  return (
    <footer className="bg-primary">
      {/* Main Footer */}
      <div className="section-container py-6">
        {/* Top Row: Logo + Quick Links + Social */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="shrink-0 h-14 lg:h-16 overflow-hidden flex items-center -ml-4">
            <img 
              src={sltLogo} 
              alt="SLT Rental" 
              className="h-32 lg:h-36 w-auto brightness-0 invert max-w-none"
            />
          </Link>

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
          <div className="flex items-center gap-3 shrink-0">
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

        {/* Divider */}
        <div className="border-t border-white/10 my-4" />

        {/* Local SEO Links by Region */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
            {t("footer.nearYou")}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {locations.map((loc) => {
              const areas = getAreasForLocation(loc.id).filter(a => a.distance > 0);
              return (
                <div key={loc.id}>
                  <span className="text-xs font-medium text-white/70 block mb-1">{t("footer.region", { name: loc.name })}</span>
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
