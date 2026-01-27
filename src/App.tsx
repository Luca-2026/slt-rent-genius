import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Products from "./pages/Products";
import HowItWorks from "./pages/HowItWorks";
import Locations from "./pages/Locations";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import Lieferung from "./pages/Lieferung";
import Karriere from "./pages/Karriere";
import B2BLogin from "./pages/b2b/Login";
import B2BRegister from "./pages/b2b/Register";
import B2BDashboard from "./pages/b2b/Dashboard";
import ProjectRequest from "./pages/b2b/ProjectRequest";
import NotFound from "./pages/NotFound";
import AGB from "./pages/AGB";

// New rental flow pages
import RentalStart from "./pages/rental/RentalStart";
import LocationCategories from "./pages/rental/LocationCategories";
import CategoryProducts from "./pages/rental/CategoryProducts";
import ProductDetail from "./pages/rental/ProductDetail";

// Solutions pages
import Loesungen from "./pages/Loesungen";
import LoesungDetail from "./pages/LoesungDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* New rental flow: Location → Category → Products → Product Detail */}
            <Route path="/mieten" element={<RentalStart />} />
            <Route path="/mieten/:locationId" element={<LocationCategories />} />
            <Route path="/mieten/:locationId/:categoryId" element={<CategoryProducts />} />
            <Route path="/mieten/:locationId/:categoryId/:productId" element={<ProductDetail />} />
            
            {/* Legacy products route - redirects or keep for backwards compatibility */}
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
            
            {/* Legal Pages */}
            <Route path="/agb" element={<AGB />} />
            
            {/* B2B Portal */}
            <Route path="/b2b/login" element={<B2BLogin />} />
            <Route path="/b2b/registrieren" element={<B2BRegister />} />
            <Route path="/b2b/dashboard" element={<B2BDashboard />} />
            <Route path="/b2b/projektanfrage" element={<ProjectRequest />} />
            <Route path="/b2b" element={<B2BLogin />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
