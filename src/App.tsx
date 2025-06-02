
import React, { Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from "@/components/ui/toaster";
import PageTransition from "@/components/PageTransition";
import { PerformanceDashboard } from "@/components/debug/PerformanceDashboard";
import { SecurityErrorBoundary } from "@/components/security/SecurityErrorBoundary";

import Index from "@/pages/Index";
import Features from "@/pages/Features";
import Solutions from "@/pages/Solutions";
import Pricing from "@/pages/Pricing";
import Gallery from "@/pages/Gallery";
import Community from "@/pages/Community";
import Resources from "@/pages/Resources";
import Docs from "@/pages/Docs";
import Introduction from "@/pages/docs/Introduction";
import CreatingYourFirstFigurine from "@/pages/docs/CreatingYourFirstFigurine";
import UnderstandingArtStyles from "@/pages/docs/UnderstandingArtStyles";
import PromptEngineeringTips from "@/pages/docs/PromptEngineeringTips";
import CombiningMultipleStyles from "@/pages/docs/CombiningMultipleStyles";
import PreparingModelsForPrinting from "@/pages/docs/PreparingModelsForPrinting";
import NotFound from "@/pages/NotFound";
import Studio from "@/pages/Studio";
import Profile from "@/pages/Profile";
import ProfileFigurines from "@/pages/ProfileFigurines";
import ProfilePictures from "@/pages/ProfilePictures";
import Settings from "@/pages/Settings";
import Subscription from "@/pages/Subscription";
import CheckoutReturn from "@/pages/CheckoutReturn";

import { EnhancedAuthProvider } from "@/components/auth/EnhancedAuthProvider";
import Auth from "@/pages/Auth";
import CompleteProfile from "@/pages/CompleteProfile";

// Enhanced loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-figuro-dark flex items-center justify-center">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-figuro-accent/30 border-t-figuro-accent rounded-full animate-spin"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-6 h-6 bg-figuro-accent rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <SecurityErrorBoundary>
      <HelmetProvider>
        <EnhancedAuthProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <PageTransition>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/solutions" element={<Solutions />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/docs" element={<Docs />} />
                  <Route path="/docs/introduction" element={<Introduction />} />
                  <Route path="/docs/creating-your-first-figurine" element={<CreatingYourFirstFigurine />} />
                  <Route path="/docs/understanding-art-styles" element={<UnderstandingArtStyles />} />
                  <Route path="/docs/prompt-engineering-tips" element={<PromptEngineeringTips />} />
                  <Route path="/docs/combining-multiple-styles" element={<CombiningMultipleStyles />} />
                  <Route path="/docs/preparing-models-for-printing" element={<PreparingModelsForPrinting />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/complete-profile" element={<CompleteProfile />} />
                  <Route path="/studio" element={<Studio />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/figurines" element={<ProfileFigurines />} />
                  <Route path="/profile/pictures" element={<ProfilePictures />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/checkout-return" element={<CheckoutReturn />} />
                  <Route path="/*" element={<NotFound />} />
                </Routes>
              </PageTransition>
            </Suspense>
            <Toaster />
            <PerformanceDashboard />
          </BrowserRouter>
        </EnhancedAuthProvider>
      </HelmetProvider>
    </SecurityErrorBoundary>
  );
}

export default App;
