
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Studio from "./pages/Studio";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Subscription from "./pages/Subscription";
import CheckoutReturn from "./pages/CheckoutReturn";
import Features from "./pages/Features";
import Solutions from "./pages/Solutions";
import Resources from "./pages/Resources";
import Careers from "./pages/Careers";
import Community from "./pages/Community";
import Docs from "./pages/Docs";
import NotFound from "./pages/NotFound";
import CompleteProfile from "./pages/CompleteProfile";
import ProfileFigurines from "./pages/ProfileFigurines";
import ProfilePictures from "./pages/ProfilePictures";
// Docs pages
import Introduction from "./pages/docs/Introduction";
import CreatingYourFirstFigurine from "./pages/docs/CreatingYourFirstFigurine";
import UnderstandingArtStyles from "./pages/docs/UnderstandingArtStyles";
import PromptEngineeringTips from "./pages/docs/PromptEngineeringTips";
import PreparingModelsForPrinting from "./pages/docs/PreparingModelsForPrinting";
import CombiningMultipleStyles from "./pages/docs/CombiningMultipleStyles";
import { EnhancedAuthProvider } from "@/components/auth/EnhancedAuthProvider";
import { SecurityEnforcedRoute } from "@/components/auth/SecurityEnforcedRoute";
import ProductionMonitor from "@/components/production/ProductionMonitor";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <ProductionMonitor 
            enableErrorReporting={true}
            enablePerformanceTracking={true}
          />
          <BrowserRouter>
            <EnhancedAuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/studio" element={
                  <SecurityEnforcedRoute>
                    <Studio />
                  </SecurityEnforcedRoute>
                } />
                <Route path="/profile" element={
                  <SecurityEnforcedRoute>
                    <Profile />
                  </SecurityEnforcedRoute>
                } />
                <Route path="/settings" element={
                  <SecurityEnforcedRoute>
                    <Settings />
                  </SecurityEnforcedRoute>
                } />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/subscription" element={
                  <SecurityEnforcedRoute>
                    <Subscription />
                  </SecurityEnforcedRoute>
                } />
                <Route path="/checkout/return" element={<CheckoutReturn />} />
                <Route path="/features" element={<Features />} />
                <Route path="/solutions" element={<Solutions />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/community" element={<Community />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/complete-profile" element={
                  <SecurityEnforcedRoute>
                    <CompleteProfile />
                  </SecurityEnforcedRoute>
                } />
                <Route path="/profile/figurines" element={
                  <SecurityEnforcedRoute>
                    <ProfileFigurines />
                  </SecurityEnforcedRoute>
                } />
                <Route path="/profile/pictures" element={
                  <SecurityEnforcedRoute>
                    <ProfilePictures />
                  </SecurityEnforcedRoute>
                } />
                {/* Docs Routes */}
                <Route path="/docs/introduction" element={<Introduction />} />
                <Route path="/docs/creating-your-first-figurine" element={<CreatingYourFirstFigurine />} />
                <Route path="/docs/understanding-art-styles" element={<UnderstandingArtStyles />} />
                <Route path="/docs/prompt-engineering-tips" element={<PromptEngineeringTips />} />
                <Route path="/docs/preparing-models-for-printing" element={<PreparingModelsForPrinting />} />
                <Route path="/docs/combining-multiple-styles" element={<CombiningMultipleStyles />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </EnhancedAuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
