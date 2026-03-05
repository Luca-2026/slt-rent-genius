import { ReactNode, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ChangePasswordDialog } from "@/components/b2b/ChangePasswordDialog";
import { B2BChatAssistant } from "@/components/b2b/B2BChatAssistant";
import { 
  LayoutDashboard, Package, FileText, Receipt,
  LogOut, Phone, Home, Settings, ClipboardCheck, Undo2, BookOpen, Building2,
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
  { href: "/hilfe", label: "Hilfe & Anleitungen", icon: BookOpen },
  { href: "/kontakt", label: "Kontakt", icon: Phone },
];

const adminNavItems = [
  { href: "/", label: "Startseite", icon: Home },
  { href: "/b2b/admin", label: "Admin Dashboard", icon: Settings },
];

export function B2BPortalLayout({ children, title, subtitle }: B2BPortalLayoutProps) {
  const { user, b2bProfile, loading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
          <nav className="flex gap-1 overflow-x-auto py-1.5 sm:py-2 -mx-2 px-2 scrollbar-none">
            {(isAdmin ? adminNavItems : [
              ...customerNavItems,
            ]).map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} to={item.href}>
                  <Button 
                    variant={isActive ? "default" : "ghost"} 
                    size="sm"
                    className={`whitespace-nowrap ${isActive ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    <Icon className="h-3.5 w-3.5 mr-1.5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="py-6 lg:py-8 min-h-[60vh]">
        <div className="section-container">
          {children}
        </div>
      </main>

      {/* AI Chat Assistant - only for customers, not admins */}
      {!isAdmin && <B2BChatAssistant />}
    </Layout>
  );
}
