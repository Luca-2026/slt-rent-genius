import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/produkte" element={<Products />} />
            <Route path="/produkte/:category" element={<Products />} />
            <Route path="/so-funktionierts" element={<HowItWorks />} />
            <Route path="/standorte" element={<Locations />} />
            <Route path="/standorte/:id" element={<Locations />} />
            <Route path="/kontakt" element={<Contact />} />
            <Route path="/lieferung" element={<Lieferung />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/ueber-uns" element={<About />} />
            <Route path="/karriere" element={<Karriere />} />
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
