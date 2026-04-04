import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Percent, Shield, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import sltLogo from "@/assets/slt-logo.png";

const locations = [
  { id: "krefeld", name: "Krefeld", address: "Anrather Straße 291, 47807 Krefeld-Fichtenhain", phone: "02151 417 99 04", email: "krefeld@slt-rental.de" },
  { id: "bonn", name: "Bonn", address: "Drachenburgstraße 8, 53179 Bonn", phone: "0228 504 660 61", email: "bonn@slt-rental.de" },
  { id: "muelheim", name: "Mülheim", address: "Ruhrorter Str. 122, 45478 Mülheim an der Ruhr", phone: "02151 417 99 04", email: "krefeld@slt-rental.de" },
];

interface DropdownItem {
  to: string;
  label: string;
  description?: string;
}

interface NavDropdownProps {
  label: string;
  items: DropdownItem[];
  secondary?: boolean;
}

function NavDropdown({ label, items, secondary }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();

  const handleEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setOpen(true), 80);
  }, []);

  const handleLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className={`group flex items-center gap-1 font-medium transition-all duration-200 whitespace-nowrap ${
          secondary
            ? "text-[11px] xl:text-xs text-muted-foreground hover:text-foreground"
            : "text-xs xl:text-sm text-foreground/80 hover:text-primary"
        }`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {label}
        <ChevronDown
          className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          } group-hover:text-primary`}
        />
      </button>

      {/* Dropdown panel */}
      <div
        className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-1 pointer-events-none"
        }`}
      >
        <div className="min-w-[200px] bg-background rounded-lg shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] border border-border/60 overflow-hidden">
          <div className="py-1.5">
            {items.map((item, idx) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col px-4 py-2.5 transition-colors duration-150 hover:bg-primary/5 ${
                  location.pathname === item.to
                    ? "text-primary bg-primary/5"
                    : "text-foreground"
                } ${idx > 0 ? "border-t border-border/30" : ""}`}
                onClick={() => setOpen(false)}
              >
                <span className="text-sm font-medium">{item.label}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground mt-0.5">{item.description}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile accordion dropdown
function MobileDropdown({
  label,
  items,
  secondary,
  onClose,
}: {
  label: string;
  items: DropdownItem[];
  secondary?: boolean;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted ${
          secondary ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`block pl-8 pr-4 py-2.5 text-sm transition-colors hover:bg-muted rounded-lg ${
              location.pathname === item.to ? "text-primary font-medium" : "text-foreground/70"
            }`}
            onClick={onClose}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  const produkteItems: DropdownItem[] = [
    { to: "/mietartikel", label: t("nav.allCategories"), description: "Alle Kategorien im Überblick" },
    { to: "/mieten", label: t("nav.rentNow"), description: "Standort wählen & direkt mieten" },
  ];

  const kaufenItems: DropdownItem[] = [
    { to: "/verkauf", label: t("nav.buyNow"), description: "Neumaschinen & Gebrauchtgeräte" },
  ];

  const loesungenItems: DropdownItem[] = [
    { to: "/loesungen", label: t("nav.solutions"), description: "Alle Lösungen" },
    { to: "/loesungen/garten-landschaftsbau", label: t("nav.solutionGalabau") },
    { to: "/loesungen/tiefbau-erdbewegung", label: t("nav.solutionTiefbau") },
    { to: "/loesungen/hochbau-renovierung", label: t("nav.solutionHochbau") },
    { to: "/loesungen/events-veranstaltungen", label: t("nav.solutionEvents") },
    { to: "/loesungen/umzug-transport", label: t("nav.solutionTransport") },
    { to: "/loesungen/handwerk-gewerbe", label: t("nav.solutionHandwerk") },
    { to: "/loesungen/private-projekte", label: t("nav.solutionPrivate") },
    { to: "/loesungen/kindergeburtstage", label: t("nav.solutionKinder") },
  ];

  const howItWorksItems: DropdownItem[] = [
    { to: "/so-funktionierts", label: t("nav.howItWorks") },
    { to: "/hilfe", label: t("nav.help") },
  ];

  const aboutItems: DropdownItem[] = [
    { to: "/ueber-uns", label: t("nav.about") },
    { to: "/kontakt", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      {/* Weekend Tariffs Bar */}
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
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
            {/* Primary nav */}
            <NavDropdown label={t("nav.rentalItems")} items={produkteItems} />
            <NavDropdown label={t("nav.buy")} items={kaufenItems} />
            <NavDropdown label={t("nav.solutions")} items={loesungenItems} />
            <Link
              to="/standorte"
              className={`text-xs xl:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive("/standorte")
                  ? "text-primary"
                  : "text-foreground/80 hover:text-primary"
              }`}
            >
              {t("nav.locations")}
            </Link>

            {/* Subtle separator */}
            <div className="h-4 w-px bg-border/60" />

            {/* Secondary nav */}
            <NavDropdown label={t("nav.howItWorks")} items={howItWorksItems} secondary />
            <NavDropdown label={t("nav.about")} items={aboutItems} secondary />
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
        <div className="lg:hidden border-t border-border bg-background animate-in slide-in-from-top-2 duration-200">
          <nav className="section-container py-4 flex flex-col gap-0.5">
            <MobileDropdown
              label={t("nav.products")}
              items={produkteItems}
              onClose={() => setIsMenuOpen(false)}
            />
            <MobileDropdown
              label={t("nav.buy")}
              items={kaufenItems}
              onClose={() => setIsMenuOpen(false)}
            />

            <Link
              to="/loesungen"
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive("/loesungen") ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.solutions")}
            </Link>
            <Link
              to="/standorte"
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive("/standorte") ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.locations")}
            </Link>

            <div className="h-px bg-border/60 my-2 mx-4" />

            <MobileDropdown
              label={t("nav.howItWorks")}
              items={howItWorksItems}
              secondary
              onClose={() => setIsMenuOpen(false)}
            />
            <MobileDropdown
              label={t("nav.about")}
              items={aboutItems}
              secondary
              onClose={() => setIsMenuOpen(false)}
            />

            <div className="h-px bg-border/60 my-2 mx-4" />

            <Link
              to="/b2b/login"
              className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted text-foreground/70"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("nav.b2bLogin")}
            </Link>

            <Link
              to="/mieten"
              className="mt-2 px-4"
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
