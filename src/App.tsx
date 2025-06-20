
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OptimizedAuthProvider } from "@/components/auth/OptimizedAuthProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Gallery from "./pages/Gallery";
import OptimizedStudio from "./pages/OptimizedStudio";
import FigurineDetails from "./pages/FigurineDetails";
import { logger } from "@/utils/logLevelManager";

// Create a client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  logger.debug('App: Component rendered', 'app-perf');

  return (
    <QueryClientProvider client={queryClient}>
      <OptimizedAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/studio" element={<OptimizedStudio />} />
              <Route path="/figurine/:id" element={<FigurineDetails />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </OptimizedAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
