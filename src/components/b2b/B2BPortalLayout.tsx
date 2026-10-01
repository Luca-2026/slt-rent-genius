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
  Users,
  Inbox, ShoppingCart,
} from "lucide-react";
import { useOpenInquiryCounts } from "@/hooks/useInquiries";
import { usePhoneCalls, isUrgentCall } from "@/hooks/usePhoneCalls";
import { StaffNav, visibleGroups, isItemActive } from "@/components/b2b/StaffNav";

function navBadge(
  href: string,
  openTodoCount: number,
  inquiryCounts: { rental: number; sales: number },
): number | null {
  if (href === "/b2b/aufgaben") return openTodoCount > 0 ? openTodoCount : null;
  if (href === "/b2b/mietanfragen") return inquiryCounts.rental > 0 ? inquiryCounts.rental : null;
  if (href === "/b2b/verkaufsanfragen") return inquiryCounts.sales > 0 ? inquiryCounts.sales : null;
  return null;
}

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
  { href: "/b2b/admin", label: "B2B-Vermietung", icon: Settings },
  { href: "/b2b/mietanfragen", label: "Mietanfragen", icon: Inbox },
  { href: "/b2b/verkaufsanfragen", label: "Verkaufsanfragen", icon: ShoppingCart },
  { href: "/b2b/anfrage-rechnungen", label: "Rechnungen", icon: Receipt },
  { href: "/b2b/kundendaten", label: "Kundendaten", icon: Users },
  { href: "/b2b/aufgaben", label: "Interne Verwaltung", icon: CheckSquare },
];

const staffNavItems = [
  { href: "/", label: "Startseite", icon: Home },
  { href: "/b2b/mietanfragen", label: "Mietanfragen", icon: Inbox },
  { href: "/b2b/verkaufsanfragen", label: "Verkaufsanfragen", icon: ShoppingCart },
  { href: "/b2b/anfrage-rechnungen", label: "Rechnungen", icon: Receipt },
  { href: "/b2b/kundendaten", label: "Kundendaten", icon: Users },
  { href: "/b2b/aufgaben", label: "Interne Verwaltung", icon: CheckSquare },
  { href: "/hilfe", label: "Hilfe & Anleitungen", icon: BookOpen },
];


export function B2BPortalLayout({ children, title, subtitle }: B2BPortalLayoutProps) {
  const { user, b2bProfile, loading, signOut, isAdmin } = useAuth();
  const { isStaff, canViewInventory } = useStaffAccess();
  const { count: openTodoCount } = useStaffWork();
  const inquiryCounts = useOpenInquiryCounts();
  const { rows: phoneCalls } = usePhoneCalls();
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

  // Browser-Tab-Titel für Portalseiten (B2B-Seiten haben keine SEO-Komponente)
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} | SLT Kundenportal` : "SLT Kundenportal";
    return () => { document.title = previous; };
  }, [title]);


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

  const staffBadges = { rental: inquiryCounts.rental, sales: inquiryCounts.sales, todos: openTodoCount, calls: phoneCalls.filter(isUrgentCall).length };
  const staffActiveLabel = visibleGroups(isAdmin, canViewInventory)
    .flatMap((g) => g.items)
    .find((i) => isItemActive(i, location.pathname, location.search))?.label;

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

      {isStaff ? (
        <>
          {/* Mobile/Tablet: Menü-Button */}
          <div className="lg:hidden bg-background border-b border-border sticky top-16 z-30">
            <div className="section-container flex items-center justify-between py-2">
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Menu className="h-4 w-4" />
                    <span>{staffActiveLabel ?? "Menü"}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[290px] overflow-y-auto p-0">
                  <SheetHeader className="p-4 border-b border-border">
                    <SheetTitle className="text-left">Vermietportal</SheetTitle>
                  </SheetHeader>
                  <div className="p-3">
                    <StaffNav isAdmin={isAdmin} canViewInventory={canViewInventory} badges={staffBadges} onNavigate={() => setMobileNavOpen(false)} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <main className="py-6 lg:py-8 min-h-[60vh]">
            <div className="section-container lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8">
              <aside className="hidden lg:block">
                <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
                  <StaffNav isAdmin={isAdmin} canViewInventory={canViewInventory} badges={staffBadges} />
                </div>
              </aside>
              <div className="min-w-0">{children}</div>
            </div>
          </main>
        </>
      ) : (
      <>
      {/* Navigation */}
      <div className="bg-background border-b border-border sticky top-16 z-30">
        <div className="section-container">
          {(() => {
            const navItems = customerNavItems;
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
                          const badge = navBadge(item.href, openTodoCount, inquiryCounts);
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
                </div>

                {/* Desktop: horizontale Leiste */}
                <nav className="hidden md:flex gap-1 overflow-x-auto py-1.5 sm:py-2 -mx-2 px-2 scrollbar-none">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    const badge = navBadge(item.href, openTodoCount, inquiryCounts);
                    return (
                      <Link key={item.href} to={item.href} className="shrink-0">
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

      </>
      )}
    </Layout>
  );
}
