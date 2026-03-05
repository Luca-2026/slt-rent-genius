import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Loader2 } from "lucide-react";
import { HelmetProvider } from "react-helmet-async";

// Eagerly loaded: landing page and lightweight pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-loaded: Rental pages (heavy – import ~100 product images)
const RentalStart = lazy(() => import("./pages/rental/RentalStart"));
const LocationCategories = lazy(() => import("./pages/rental/LocationCategories"));
const CategoryProducts = lazy(() => import("./pages/rental/CategoryProducts"));
const ProductDetail = lazy(() => import("./pages/rental/ProductDetail"));
const Products = lazy(() => import("./pages/Products"));

// Lazy-loaded: B2B pages
const B2BLogin = lazy(() => import("./pages/b2b/Login"));
const B2BRegister = lazy(() => import("./pages/b2b/Register"));
const B2BDashboard = lazy(() => import("./pages/b2b/Dashboard"));
const ProjectRequest = lazy(() => import("./pages/b2b/ProjectRequest"));
const B2BProducts = lazy(() => import("./pages/b2b/B2BProducts"));
const B2BProductDetail = lazy(() => import("./pages/b2b/B2BProductDetail"));
const MyReservations = lazy(() => import("./pages/b2b/MyReservations"));
const B2BInvoices = lazy(() => import("./pages/b2b/Invoices"));
const B2BDeliveryNotes = lazy(() => import("./pages/b2b/DeliveryNotes"));
const B2BReturnProtocols = lazy(() => import("./pages/b2b/ReturnProtocols"));
const B2BCompanyProfile = lazy(() => import("./pages/b2b/CompanyProfile"));
const B2BOffers = lazy(() => import("./pages/b2b/B2BOffers"));
const B2BFAQ = lazy(() => import("./pages/b2b/B2BFAQ"));
const AdminDashboard = lazy(() => import("./pages/b2b/AdminDashboard"));
const ForgotPassword = lazy(() => import("./pages/b2b/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/b2b/ResetPassword"));

// Lazy-loaded: Other pages
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Locations = lazy(() => import("./pages/Locations"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const About = lazy(() => import("./pages/About"));
const Lieferung = lazy(() => import("./pages/Lieferung"));
const Karriere = lazy(() => import("./pages/Karriere"));
const Loesungen = lazy(() => import("./pages/Loesungen"));
const LoesungDetail = lazy(() => import("./pages/LoesungDetail"));
const LocalArea = lazy(() => import("./pages/LocalArea"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const AGB = lazy(() => import("./pages/AGB"));
const Impressum = lazy(() => import("./pages/Impressum"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* New rental flow: Location → Category → Products → Product Detail */}
              <Route path="/mieten" element={<RentalStart />} />
              <Route path="/mieten/:locationId" element={<LocationCategories />} />
              <Route path="/mieten/:locationId/:categoryId" element={<CategoryProducts />} />
              <Route path="/mieten/:locationId/:categoryId/:productId" element={<ProductDetail />} />
              
              {/* Legacy products route */}
              <Route path="/produkte" element={<RentalStart />} />
              <Route path="/produkte/:category" element={<Products />} />
              
              <Route path="/so-funktionierts" element={<HowItWorks />} />
              <Route path="/standorte" element={<Locations />} />
              <Route path="/standorte/:id" element={<Locations />} />
              <Route path="/kontakt" element={<Contact />} />
              <Route path="/lieferung" element={<Lieferung />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/ueber-uns" element={<About />} />
              <Route path="/karriere" element={<Karriere />} />
              
              {/* Solutions pages */}
              <Route path="/loesungen" element={<Loesungen />} />
              <Route path="/loesungen/:solutionId" element={<LoesungDetail />} />
              
              {/* Local SEO pages */}
              <Route path="/mieten-in/:areaSlug" element={<LocalArea />} />
              
              {/* Knowledge Base */}
              <Route path="/hilfe" element={<KnowledgeBase />} />
              
              {/* Legal Pages */}
              <Route path="/agb" element={<AGB />} />
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/datenschutz" element={<Datenschutz />} />
              
              {/* B2B Portal */}
              <Route path="/b2b/login" element={<B2BLogin />} />
              <Route path="/b2b/registrieren" element={<B2BRegister />} />
              <Route path="/b2b/passwort-vergessen" element={<ForgotPassword />} />
              <Route path="/b2b/passwort-zuruecksetzen" element={<ResetPassword />} />
              <Route path="/b2b/dashboard" element={<B2BDashboard />} />
              <Route path="/b2b/projektanfrage" element={<ProjectRequest />} />
              <Route path="/b2b/produkte" element={<B2BProducts />} />
              <Route path="/b2b/produkte/:locationId/:categoryId/:productId" element={<B2BProductDetail />} />
              <Route path="/b2b/mietvorgaenge" element={<MyReservations />} />
              <Route path="/b2b/anfragen" element={<MyReservations />} />
              <Route path="/b2b/rechnungen" element={<B2BInvoices />} />
              <Route path="/b2b/uebergabeprotokolle" element={<B2BDeliveryNotes />} />
              <Route path="/b2b/lieferscheine" element={<B2BDeliveryNotes />} />
              <Route path="/b2b/rueckgabeprotokolle" element={<B2BReturnProtocols />} />
              <Route path="/b2b/firmendaten" element={<B2BCompanyProfile />} />
              <Route path="/b2b/angebote" element={<B2BOffers />} />
              <Route path="/b2b/faq" element={<B2BFAQ />} />
              <Route path="/b2b/admin" element={<AdminDashboard />} />
              <Route path="/b2b" element={<B2BLogin />} />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
