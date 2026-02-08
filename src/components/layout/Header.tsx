import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import sltLogo from "@/assets/slt-logo.png";

const locations = [
  { id: "krefeld", name: "Krefeld", address: "Anrather Straße 291, 47807 Krefeld-Fichtenhain", phone: "02151 417 990 4", email: "krefeld@slt-rental.de" },
  { id: "bonn", name: "Bonn", address: "Drachenburgstraße 8, 53179 Bonn", phone: "0228 50466061", email: "bonn@slt-rental.de" },
  { id: "muelheim", name: "Mülheim", address: "Ruhrorter Str. 100, 45478 Mülheim an der Ruhr", phone: "02151 417 99 04", email: "krefeld@slt-rental.de" },
];

const navLinks = [
  { to: "/produkte", label: "Produkte" },
  { to: "/loesungen", label: "Lösungen" },
  { to: "/so-funktionierts", label: "So funktioniert's" },
  { to: "/hilfe", label: "Hilfe & Anleitungen" },
  { to: "/standorte", label: "Standorte" },
  { to: "/ueber-uns", label: "Über uns" },
  { to: "/kontakt", label: "Kontakt" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      {/* Weekend Tariffs Bar - Scrolling */}
      <div className="bg-primary text-primary-foreground overflow-hidden">
        <div className="py-1.5 text-sm">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
            <div className="flex items-center gap-1.5 font-semibold">
              <Percent className="h-4 w-4" />
              <span>Wochenendtarife</span>
            </div>
            <span className="text-primary-foreground/50">•</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium">WE:</span>
              <span>Fr. ab 16:00 – Mo. 09:30 Uhr</span>
            </div>
            <span className="text-primary-foreground/50">•</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium">Langes WE:</span>
              <span>Fr. ab 06:00 – Mo. 09:30 Uhr</span>
            </div>
            <span className="text-primary-foreground/50">•</span>
            <div className="flex items-center gap-1.5 font-semibold">
              <Percent className="h-4 w-4" />
              <span>Wochenendtarife</span>
            </div>
            <span className="text-primary-foreground/50">•</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium">WE:</span>
              <span>Fr. ab 16:00 – Mo. 09:30 Uhr</span>
            </div>
            <span className="text-primary-foreground/50">•</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium">Langes WE:</span>
              <span>Fr. ab 06:00 – Mo. 09:30 Uhr</span>
            </div>
            <span className="text-primary-foreground/50">•</span>
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
            <Link to="/b2b/login">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                zum B2B Portal
              </Button>
            </Link>

            <Link to="/mieten" className="hidden md:block">
              <Button className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                Jetzt mieten
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menü"
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
              B2B Login
            </Link>
            <Link
              to="/mieten"
              className="mt-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Button className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                Jetzt mieten
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
