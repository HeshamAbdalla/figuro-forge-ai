
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Gallery from "@/pages/Gallery";
import ProfileFigurines from "@/pages/ProfileFigurines";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import { useRecaptchaBadgeVisibility } from "@/hooks/useRecaptchaBadgeVisibility";
import { injectRecaptchaBadgeStyles } from "@/utils/recaptchaBadgeStyles";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const AppContent = () => {
  // Control reCAPTCHA badge visibility globally
  useRecaptchaBadgeVisibility();
  
  // Inject global reCAPTCHA badge styles
  useEffect(() => {
    injectRecaptchaBadgeStyles();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Gallery />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/profile" element={<ProfileFigurines />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
