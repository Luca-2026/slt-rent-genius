import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/Products";
import HowItWorks from "./pages/HowItWorks";
import Locations from "./pages/Locations";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="/faq" element={<FAQ />} />
          <Route path="/ueber-uns" element={<About />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
