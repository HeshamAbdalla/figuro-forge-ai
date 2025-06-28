
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
import Pricing from "./pages/Pricing";
import Docs from "./pages/Docs";
import Solutions from "./pages/Solutions";
import SecurityDashboard from "./pages/SecurityDashboard";

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
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/docs" element={<Docs />} />
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
