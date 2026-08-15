import { ReactNode, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/useAuth";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { useStaffWork } from "@/hooks/useStaffWork";
import { Button } from "@/components/ui/button";
import { ChangePasswordDialog } from "@/components/b2b/ChangePasswordDialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import {
  LayoutDashboard, Package, FileText, Receipt,
  LogOut, Phone, Home, Settings, ClipboardCheck, Undo2, BookOpen, Building2, Download, Menu, CheckSquare,
} from "lucide-react";

interface B2BPortalLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const customerNavItems = [
  { href: "/", label: "Startseite", icon: Home },
  { href: "/b2b/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/b2b/produkte", label: "Produkte & Anfragen", icon: Package },
  { href: "/b2b/mietvorgaenge", label: "Mietvorgänge", icon: FileText },
  { href: "/b2b/uebergabeprotokolle", label: "Übergabeprotokolle", icon: ClipboardCheck },
  { href: "/b2b/rueckgabeprotokolle", label: "Rückgabeprotokolle", icon: Undo2 },
  { href: "/b2b/angebote", label: "Angebote", icon: FileText },
  { href: "/b2b/rechnungen", label: "Rechnungen", icon: Receipt },
  { href: "/b2b/firmendaten", label: "Firmendaten", icon: Building2 },
  { href: "/b2b/downloads", label: "Downloads", icon: Download },
  { href: "/hilfe", label: "Hilfe & Anleitungen", icon: BookOpen },
  { href: "/kontakt", label: "Kontakt", icon: Phone },
];

const adminNavItems = [
  { href: "/", label: "Startseite", icon: Home },
  { href: "/b2b/admin", label: "Admin Dashboard", icon: Settings },
  { href: "/b2b/aufgaben", label: "Aufgaben & Dispo", icon: CheckSquare },
];

const staffNavItems = [
  { href: "/", label: "Startseite", icon: Home },
  { href: "/b2b/aufgaben", label: "Aufgaben & Dispo", icon: CheckSquare },
  { href: "/hilfe", label: "Hilfe & Anleitungen", icon: BookOpen },
];


export function B2BPortalLayout({ children, title, subtitle }: B2BPortalLayoutProps) {
  const { user, b2bProfile, loading, signOut, isAdmin } = useAuth();
  const { isStaff } = useStaffAccess();
  const { count: openTodoCount } = useStaffWork();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setMobileNavOpen(false); }, [location.pathname]);

  // Prevent search engines from indexing B2B portal pages
  useEffect(() => {
    let metaTag = document.querySelector('meta[name="robots"][data-b2b]') as HTMLMetaElement;
    if (!metaTag) {
      metaTag = document.createElement("meta");
      metaTag.name = "robots";
      metaTag.content = "noindex, nofollow";
      metaTag.setAttribute("data-b2b", "true");
      document.head.appendChild(metaTag);
    }
    return () => { metaTag?.remove(); };
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/b2b/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      {/* Header bar */}
      <section className="bg-primary py-4 lg:py-6">
        <div className="section-container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-primary-foreground">{title}</h1>
              {subtitle && (
                <p className="text-primary-foreground/80 text-sm">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-primary-foreground/70 text-sm hidden md:block">
                {b2bProfile?.company_name}
              </span>
              <ChangePasswordDialog className="border-primary-foreground/40 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20" />
              <Button 
                size="sm"
                variant="outline" 
                className="border-primary-foreground/40 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20"
                onClick={() => { signOut(); navigate("/b2b/login"); }}
              >
                <LogOut className="h-3.5 w-3.5 mr-1" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <div className="bg-background border-b border-border sticky top-16 z-30">
        <div className="section-container">
          {(() => {
            const navItems = isAdmin ? adminNavItems : isStaff ? staffNavItems : customerNavItems;
            const activeItem = navItems.find((i) => i.href === location.pathname);

            return (
              <>
                {/* Mobile: Burger */}
                <div className="md:hidden flex items-center justify-between py-2">
                  <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Menu className="h-4 w-4" />
                        <span>{activeItem?.label ?? "Menü"}</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px] p-0">
                      <SheetHeader className="p-4 border-b border-border">
                        <SheetTitle className="text-left">B2B-Portal</SheetTitle>
                      </SheetHeader>
                      <nav className="flex flex-col p-2 gap-1">
                        {navItems.map((item) => {
                          const isActive = location.pathname === item.href;
                          const Icon = item.icon;
                          const badge = item.href === "/b2b/aufgaben" && openTodoCount > 0 ? openTodoCount : null;
                          return (
                            <Link key={item.href} to={item.href}>
                              <Button
                                variant={isActive ? "default" : "ghost"}
                                size="sm"
                                className={`w-full justify-start ${isActive ? "bg-primary text-primary-foreground" : ""}`}
                              >
                                <Icon className="h-4 w-4 mr-2" />
                                {item.label}
                                {badge && (
                                  <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cta-orange px-1.5 text-[11px] font-bold text-white">
                                    {badge}
                                  </span>
                                )}
                              </Button>
                            </Link>
                          );
                        })}
                      </nav>
                    </SheetContent>
                  </Sheet>
                  {openTodoCount > 0 && location.pathname !== "/b2b/aufgaben" && (
                    <Link to="/b2b/aufgaben">
                      <Button size="sm" className="gap-1.5">
                        <CheckSquare className="h-4 w-4" />
                        <span>{openTodoCount} To-do{openTodoCount === 1 ? "" : "s"}</span>
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Desktop: horizontale Leiste */}
                <nav className="hidden md:flex gap-1 overflow-x-auto py-1.5 sm:py-2 -mx-2 px-2 scrollbar-none">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    const badge = item.href === "/b2b/aufgaben" && openTodoCount > 0 ? openTodoCount : null;
                    return (
                      <Link key={item.href} to={item.href}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          size="sm"
                          className={`whitespace-nowrap ${isActive ? "bg-primary text-primary-foreground" : ""}`}
                        >
                          <Icon className="h-3.5 w-3.5 mr-1.5" />
                          {item.label}
                          {badge && (
                            <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cta-orange px-1.5 text-[11px] font-bold text-white">
                              {badge}
                            </span>
                          )}
                        </Button>
                      </Link>
                    );
                  })}
                </nav>

              </>
            );
          })()}
        </div>
      </div>

      {/* Content */}
      <main className="py-6 lg:py-8 min-h-[60vh]">
        <div className="section-container">
          {children}
        </div>
      </main>

    </Layout>
  );
}
