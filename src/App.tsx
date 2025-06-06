
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Index from "./pages/Index";
import Studio from "./pages/Studio";
import Gallery from "./pages/Gallery";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Docs from "./pages/Docs";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ProfileFigurines from "./pages/ProfileFigurines";
import ProfilePictures from "./pages/ProfilePictures";
import Settings from "./pages/Settings";
import Subscription from "./pages/Subscription";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Solutions from "./pages/Solutions";
import Resources from "./pages/Resources";
import Community from "./pages/Community";
import Careers from "./pages/Careers";
import CompleteProfile from "./pages/CompleteProfile";
import CheckoutReturn from "./pages/CheckoutReturn";
import NotFound from "./pages/NotFound";
import { EnhancedAuthProvider } from "./components/auth/EnhancedAuthProvider";
import { SecurityEnforcedRoute } from "./components/auth/SecurityEnforcedRoute";

// Doc pages
import Introduction from "./pages/docs/Introduction";
import CreatingYourFirstFigurine from "./pages/docs/CreatingYourFirstFigurine";
import UnderstandingArtStyles from "./pages/docs/UnderstandingArtStyles";
import PromptEngineeringTips from "./pages/docs/PromptEngineeringTips";
import CombiningMultipleStyles from "./pages/docs/CombiningMultipleStyles";
import PreparingModelsForPrinting from "./pages/docs/PreparingModelsForPrinting";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <EnhancedAuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes - no authentication required */}
              <Route path="/" element={<Index />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/solutions" element={<Solutions />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/community" element={<Community />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/docs" element={<Docs />} />
              
              {/* Documentation Routes - public */}
              <Route path="/docs/introduction" element={<Introduction />} />
              <Route path="/docs/creating-your-first-figurine" element={<CreatingYourFirstFigurine />} />
              <Route path="/docs/understanding-art-styles" element={<UnderstandingArtStyles />} />
              <Route path="/docs/prompt-engineering-tips" element={<PromptEngineeringTips />} />
              <Route path="/docs/combining-multiple-styles" element={<CombiningMultipleStyles />} />
              <Route path="/docs/preparing-models-for-printing" element={<PreparingModelsForPrinting />} />
              
              {/* Protected routes with reCAPTCHA and email verification enforcement */}
              <Route path="/studio" element={<SecurityEnforcedRoute requireVerification={true}><Studio /></SecurityEnforcedRoute>} />
              <Route path="/profile" element={<SecurityEnforcedRoute requireVerification={true}><Profile /></SecurityEnforcedRoute>} />
              <Route path="/profile/figurines" element={<SecurityEnforcedRoute requireVerification={true}><ProfileFigurines /></SecurityEnforcedRoute>} />
              <Route path="/profile/pictures" element={<SecurityEnforcedRoute requireVerification={true}><ProfilePictures /></SecurityEnforcedRoute>} />
              <Route path="/settings" element={<SecurityEnforcedRoute requireVerification={true}><Settings /></SecurityEnforcedRoute>} />
              <Route path="/subscription" element={<SecurityEnforcedRoute requireVerification={true}><Subscription /></SecurityEnforcedRoute>} />
              <Route path="/complete-profile" element={<SecurityEnforcedRoute requireVerification={true}><CompleteProfile /></SecurityEnforcedRoute>} />
              <Route path="/checkout/return" element={<SecurityEnforcedRoute requireVerification={true}><CheckoutReturn /></SecurityEnforcedRoute>} />
              
              {/* Catch all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </EnhancedAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
