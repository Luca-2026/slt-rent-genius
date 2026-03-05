import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Percent, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { PriceGuaranteeBadge } from "@/components/PriceGuaranteeBadge";
import sltLogo from "@/assets/slt-logo.png";

const locations = [
  { id: "krefeld", name: "Krefeld", address: "Anrather Straße 291, 47807 Krefeld-Fichtenhain", phone: "02151 417 99 04", email: "krefeld@slt-rental.de" },
  { id: "bonn", name: "Bonn", address: "Drachenburgstraße 8, 53179 Bonn", phone: "0228 504 660 61", email: "bonn@slt-rental.de" },
  { id: "muelheim", name: "Mülheim", address: "Ruhrorter Str. 122, 45478 Mülheim an der Ruhr", phone: "02151 417 99 04", email: "krefeld@slt-rental.de" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const location = useLocation();
  const { t } = useTranslation();

  const navLinks = [
    { to: "/produkte", label: t("nav.products") },
    { to: "/loesungen", label: t("nav.solutions") },
    { to: "/so-funktionierts", label: t("nav.howItWorks") },
    { to: "/hilfe", label: t("nav.help") },
    { to: "/standorte", label: t("nav.locations") },
    { to: "/ueber-uns", label: t("nav.about") },
    { to: "/kontakt", label: t("nav.contact") },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      {/* Weekend Tariffs Bar - Scrolling */}
      <div className="bg-primary text-primary-foreground overflow-hidden">
        <div className="py-1.5 text-sm">
          <div className="marquee-track whitespace-nowrap flex items-center">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-8 shrink-0 px-4">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Percent className="h-4 w-4" />
                  <span>{t("marquee.weekendRates")}</span>
                </div>
                <span className="text-primary-foreground/50">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">{t("marquee.we")}:</span>
                  <span>{t("marquee.weFri")}</span>
                </div>
                <span className="text-primary-foreground/50">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">{t("marquee.longWe")}:</span>
                  <span>{t("marquee.longWeFri")}</span>
                </div>
                <span className="text-primary-foreground/50">•</span>
                <div className="flex items-center gap-1.5 font-semibold">
                  <Shield className="h-4 w-4 text-accent" />
                  <span>Tiefpreisgarantie – 10 % günstiger als jeder Wettbewerber!</span>
                </div>
                <span className="text-primary-foreground/50">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="section-container py-2">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
          {/* Logo - oversized and clipped */}
          <Link to="/" className="flex items-center h-full overflow-hidden">
            <img 
              src={sltLogo} 
              alt="SLT Rental - Baumaschinen & Equipment" 
              className="h-24 sm:h-28 lg:h-32 w-auto max-w-none"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.to) ? "text-primary" : "text-body"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            
            <Link to="/b2b/login">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                {t("nav.b2bPortal")}
              </Button>
            </Link>

            <Link to="/mieten" className="hidden md:block">
              <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                {t("nav.rentNow")}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={t("nav.menu")}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="section-container py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-body"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-border" />
            <Link
              to="/b2b/login"
              className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted text-body"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.b2bLogin")}
            </Link>
            <Link
              to="/mieten"
              className="mt-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Button className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                {t("nav.rentNow")}
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
