
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OptimizedAuthProvider } from "@/components/auth/OptimizedAuthProvider";
import { HelmetProvider } from "@/components/providers/HelmetProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Studio from "./pages/Studio";
import OptimizedStudio from "./pages/OptimizedStudio";
import Gallery from "./pages/Gallery";
import Profile from "./pages/Profile";
import Pricing from "./pages/Pricing";
import Docs from "./pages/Docs";
import Solutions from "./pages/Solutions";
import Settings from "./pages/Settings";
import ProfilePictures from "./pages/ProfilePictures";
import PersonalFigurines from "./pages/PersonalFigurines";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <OptimizedAuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/studio" element={<OptimizedStudio />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/figurines" element={<PersonalFigurines />} />
                <Route path="/profile/pictures" element={<ProfilePictures />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/solutions" element={<Solutions />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </OptimizedAuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
