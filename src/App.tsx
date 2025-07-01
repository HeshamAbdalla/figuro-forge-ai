
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { EnhancedAuthProvider } from "@/components/auth/EnhancedAuthProvider";
import { SecurityAuditLogger } from "@/components/security/SecurityAuditLogger";
import Index from "./pages/Index";
import StudioHub from "./pages/StudioHub";
import Gallery from "./pages/Gallery";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ProfilePictures from "./pages/ProfilePictures";
import ProfileFigurines from "./pages/ProfileFigurines";
import Pricing from "./pages/Pricing";
import Docs from "./pages/Docs";
import Solutions from "./pages/Solutions";
import SecurityDashboard from "./pages/SecurityDashboard";
import Settings from "./pages/Settings";
import Subscription from "./pages/Subscription";
import Support from "./pages/Support";
import ImageTo3D from "./pages/studio/ImageTo3D";
import TextTo3D from "./pages/studio/TextTo3D";
import WebIcons from "./pages/studio/WebIcons";
import CameraCapture from "./pages/studio/CameraCapture";
import ModelWorkspace from "./pages/ModelWorkspace";

// Documentation page imports
import Introduction from "./pages/docs/Introduction";
import CreatingYourFirstFigurine from "./pages/docs/CreatingYourFirstFigurine";
import UnderstandingArtStyles from "./pages/docs/UnderstandingArtStyles";
import PromptEngineeringTips from "./pages/docs/PromptEngineeringTips";
import CombiningMultipleStyles from "./pages/docs/CombiningMultipleStyles";
import PreparingModelsForPrinting from "./pages/docs/PreparingModelsForPrinting";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <EnhancedAuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <SecurityAuditLogger />
            <div className="min-h-screen bg-figuro-dark">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/studio" element={<StudioHub />} />
                <Route path="/studio-hub" element={<StudioHub />} />
                <Route path="/studio/image-to-3d" element={<ImageTo3D />} />
                <Route path="/studio/text-to-3d" element={<TextTo3D />} />
                <Route path="/studio/web-icons" element={<WebIcons />} />
                <Route path="/studio/camera" element={<CameraCapture />} />
                <Route path="/studio/gallery" element={<Gallery />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/model/:id" element={<ModelWorkspace />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/pictures" element={<ProfilePictures />} />
                <Route path="/profile/figurines" element={<ProfileFigurines />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/support" element={<Support />} />
                
                {/* Documentation sub-pages */}
                <Route path="/docs/introduction" element={<Introduction />} />
                <Route path="/docs/creating-your-first-figurine" element={<CreatingYourFirstFigurine />} />
                <Route path="/docs/understanding-art-styles" element={<UnderstandingArtStyles />} />
                <Route path="/docs/prompt-engineering-tips" element={<PromptEngineeringTips />} />
                <Route path="/docs/combining-multiple-styles" element={<CombiningMultipleStyles />} />
                <Route path="/docs/preparing-models-for-printing" element={<PreparingModelsForPrinting />} />
                
                <Route path="/solutions" element={<Solutions />} />
                <Route path="/security" element={<SecurityDashboard />} />
              </Routes>
            </div>
            <Toaster />
            <Sonner />
          </BrowserRouter>
        </TooltipProvider>
      </EnhancedAuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
