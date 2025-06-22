import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import StudioHub from "./pages/StudioHub";
import ImageTo3D from "./pages/studio/ImageTo3D";
import TextTo3D from "./pages/studio/TextTo3D";
import CameraCapture from "./pages/studio/CameraCapture";
import WebIcons from "./pages/studio/WebIcons";
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
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

// Enhanced error handler for global errors
const handleGlobalError = (error: Error, errorInfo: any) => {
  console.error('🚨 [APP] Global error caught:', {
    message: error.message,
    stack: error.stack,
    errorInfo,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  });
  
  // You could send error reports to a service here
  // errorReportingService.report(error, errorInfo);
};

function App() {
  console.log('🚀 [APP] Application starting:', {
    timestamp: new Date().toISOString(),
    url: window.location.href
  });

  return (
    <ErrorBoundary onError={handleGlobalError}>
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
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/auth" element={<Auth />} />
                    {/* Redirect /studio to /studio-hub */}
                    <Route path="/studio" element={<Navigate to="/studio-hub" replace />} />
                    <Route path="/studio-hub" element={
                      <ErrorBoundary>
                        <SecurityEnforcedRoute>
                          <StudioHub />
                        </SecurityEnforcedRoute>
                      </ErrorBoundary>
                    } />
                    <Route path="/studio/image-to-3d" element={
                      <ErrorBoundary>
                        <SecurityEnforcedRoute>
                          <ImageTo3D />
                        </SecurityEnforcedRoute>
                      </ErrorBoundary>
                    } />
                    <Route path="/studio/text-to-3d" element={
                      <ErrorBoundary>
                        <SecurityEnforcedRoute>
                          <TextTo3D />
                        </SecurityEnforcedRoute>
                      </ErrorBoundary>
                    } />
                    <Route path="/studio/camera" element={
                      <ErrorBoundary>
                        <SecurityEnforcedRoute>
                          <CameraCapture />
                        </SecurityEnforcedRoute>
                      </ErrorBoundary>
                    } />
                    <Route path="/studio/web-icons" element={
                      <ErrorBoundary>
                        <SecurityEnforcedRoute>
                          <WebIcons />
                        </SecurityEnforcedRoute>
                      </ErrorBoundary>
                    } />
                    <Route path="/studio/gallery" element={
                      <ErrorBoundary>
                        <SecurityEnforcedRoute>
                          <Navigate to="/profile/figurines" replace />
                        </SecurityEnforcedRoute>
                      </ErrorBoundary>
                    } />
                    <Route path="/profile" element={
                      <ErrorBoundary>
                        <SecurityEnforcedRoute>
                          <Profile />
                        </SecurityEnforcedRoute>
                      </ErrorBoundary>
                    } />
                    <Route path="/settings" element={
                      <ErrorBoundary>
                        <SecurityEnforcedRoute>
                          <Settings />
                        </SecurityEnforcedRoute>
                      </ErrorBoundary>
                    } />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/subscription" element={
                      <ErrorBoundary>
                        <SecurityEnforcedRoute>
                          <Subscription />
                        </SecurityEnforcedRoute>
                      </ErrorBoundary>
                    } />
                    <Route path="/checkout/return" element={<CheckoutReturn />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/solutions" element={<Solutions />} />
                    <Route path="/resources" element={<Resources />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/docs" element={<Docs />} />
                    <Route path="/complete-profile" element={
                      <ErrorBoundary>
                        <SecurityEnforcedRoute>
                          <CompleteProfile />
                        </SecurityEnforcedRoute>
                      </ErrorBoundary>
                    } />
                    <Route path="/profile/figurines" element={
                      <ErrorBoundary>
                        <SecurityEnforcedRoute>
                          <ProfileFigurines />
                        </SecurityEnforcedRoute>
                      </ErrorBoundary>
                    } />
                    <Route path="/profile/pictures" element={
                      <ErrorBoundary>
                        <SecurityEnforcedRoute>
                          <ProfilePictures />
                        </SecurityEnforcedRoute>
                      </ErrorBoundary>
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
                </ErrorBoundary>
              </EnhancedAuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
