import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Percent, Shield, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import sltLogo from "@/assets/slt-logo.png";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const locations = [
  { id: "krefeld", name: "Krefeld", address: "Anrather Straße 291, 47807 Krefeld-Fichtenhain", phone: "02151 417 99 04", email: "krefeld@slt-rental.de" },
  { id: "bonn", name: "Bonn", address: "Drachenburgstraße 8, 53179 Bonn", phone: "0228 504 660 61", email: "bonn@slt-rental.de" },
  { id: "muelheim", name: "Mülheim", address: "Ruhrorter Str. 122, 45478 Mülheim an der Ruhr", phone: "02151 417 99 04", email: "krefeld@slt-rental.de" },
];

interface NavDropdownProps {
  label: string;
  items: { to: string; label: string }[];
  secondary?: boolean;
}

function NavDropdown({ label, items, secondary }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();

  const handleEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setOpen(true), 100);
  }, []);

  const handleLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className={`flex items-center gap-0.5 font-medium transition-colors hover:text-primary whitespace-nowrap ${
          secondary ? "text-[11px] xl:text-xs text-muted-foreground" : "text-xs xl:text-sm text-body"
        }`}
        onClick={() => setOpen(!open)}
      >
        {label}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-[180px] bg-popover border border-border rounded-md shadow-lg py-1 z-50">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`block px-4 py-2 text-sm transition-colors hover:bg-muted ${
                location.pathname === item.to ? "text-primary font-medium" : "text-body"
              }`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const location = useLocation();
  const { t } = useTranslation();

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
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">{t("marquee.we")}:</span>
                  <span>{t("marquee.weFri")}</span>
                </div>
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
          {/* Logo */}
          <Link to="/" className="flex items-center h-full overflow-hidden shrink-0">
            <img
              src={sltLogo}
              alt="SLT Rental - Baumaschinen & Equipment"
              className="h-24 sm:h-28 lg:h-32 w-auto max-w-none"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-3 xl:gap-4">
            {/* Primary nav items */}
            <NavDropdown
              label={t("nav.products")}
              items={[
                { to: "/produkte", label: t("nav.products") },
                { to: "/standorte", label: t("nav.locations") },
              ]}
            />
            <NavDropdown
              label={t("nav.buy")}
              items={[
                { to: "/verkauf", label: t("nav.buyNow") },
              ]}
            />
            <Link
              to="/loesungen"
              className={`text-xs xl:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                isActive("/loesungen") ? "text-primary" : "text-body"
              }`}
            >
              {t("nav.solutions")}
            </Link>
            <Link
              to="/standorte"
              className={`text-xs xl:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                isActive("/standorte") ? "text-primary" : "text-body"
              }`}
            >
              {t("nav.locations")}
            </Link>

            {/* Secondary nav items – slightly smaller */}
            <NavDropdown
              label={t("nav.howItWorks")}
              secondary
              items={[
                { to: "/so-funktionierts", label: t("nav.howItWorks") },
                { to: "/hilfe", label: t("nav.help") },
              ]}
            />
            <NavDropdown
              label={t("nav.about")}
              secondary
              items={[
                { to: "/ueber-uns", label: t("nav.about") },
                { to: "/kontakt", label: t("nav.contact") },
              ]}
            />
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile: Language + Menu */}
            <div className="flex items-center gap-1 lg:hidden mr-4">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={t("nav.menu")}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>

            {/* Desktop controls */}
            <div className="hidden lg:flex items-center gap-2">
              <LanguageSwitcher />

              <Link to="/mieten">
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-cta-orange-hover whitespace-nowrap">
                  {t("nav.rentNow")}
                </Button>
              </Link>

              <Link to="/b2b/login">
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  {t("nav.b2bPortal")}
                </Button>
              </Link>
            </div>

            {/* Space for Rentware cart icon */}
            {!location.pathname.startsWith("/b2b") && (
              <div className="w-10 h-10 shrink-0" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="section-container py-4 flex flex-col gap-1">
            <Accordion type="multiple" className="w-full">
              {/* Produkte dropdown */}
              <AccordionItem value="produkte" className="border-none">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline hover:bg-muted rounded-lg">
                  {t("nav.products")}
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <Link
                    to="/produkte"
                    className="block px-8 py-2.5 text-sm text-body hover:bg-muted rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t("nav.products")}
                  </Link>
                  <Link
                    to="/standorte"
                    className="block px-8 py-2.5 text-sm text-body hover:bg-muted rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t("nav.locations")}
                  </Link>
                </AccordionContent>
              </AccordionItem>

              {/* Kaufen dropdown */}
              <AccordionItem value="kaufen" className="border-none">
                <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline hover:bg-muted rounded-lg">
                  {t("nav.buy")}
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <Link
                    to="/verkauf"
                    className="block px-8 py-2.5 text-sm text-body hover:bg-muted rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t("nav.buyNow")}
                  </Link>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Direct links */}
            <Link
              to="/loesungen"
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive("/loesungen") ? "bg-primary text-primary-foreground" : "hover:bg-muted text-body"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.solutions")}
            </Link>
            <Link
              to="/standorte"
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive("/standorte") ? "bg-primary text-primary-foreground" : "hover:bg-muted text-body"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.locations")}
            </Link>

            <Accordion type="multiple" className="w-full">
              {/* So funktioniert's dropdown */}
              <AccordionItem value="howit" className="border-none">
                <AccordionTrigger className="px-4 py-3 text-sm text-muted-foreground font-medium hover:no-underline hover:bg-muted rounded-lg">
                  {t("nav.howItWorks")}
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <Link
                    to="/so-funktionierts"
                    className="block px-8 py-2.5 text-sm text-body hover:bg-muted rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t("nav.howItWorks")}
                  </Link>
                  <Link
                    to="/hilfe"
                    className="block px-8 py-2.5 text-sm text-body hover:bg-muted rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t("nav.help")}
                  </Link>
                </AccordionContent>
              </AccordionItem>

              {/* Über uns dropdown */}
              <AccordionItem value="about" className="border-none">
                <AccordionTrigger className="px-4 py-3 text-sm text-muted-foreground font-medium hover:no-underline hover:bg-muted rounded-lg">
                  {t("nav.about")}
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <Link
                    to="/ueber-uns"
                    className="block px-8 py-2.5 text-sm text-body hover:bg-muted rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t("nav.about")}
                  </Link>
                  <Link
                    to="/kontakt"
                    className="block px-8 py-2.5 text-sm text-body hover:bg-muted rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t("nav.contact")}
                  </Link>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

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
