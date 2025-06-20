
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { SecurityEnforcedRoute } from "@/components/auth/SecurityEnforcedRoute";
import AuthPromptModal from "@/components/auth/AuthPromptModal";
import { usePublicFigurines } from "@/hooks/usePublicFigurines";
import { Figurine } from "@/types/figurine";
import EnhancedGalleryHero from "@/components/gallery/enhanced/EnhancedGalleryHero";
import EnhancedGalleryFilters from "@/components/gallery/enhanced/EnhancedGalleryFilters";
import FuturisticGalleryGrid from "@/components/gallery/enhanced/FuturisticGalleryGrid";

interface FilterState {
  search: string;
  category: string;
  sortBy: string;
  viewMode: "grid" | "list";
}

const GalleryContent = () => {
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    sortBy: "newest",
    viewMode: "grid"
  });
  
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useEnhancedAuth();
  const { figurines, loading, refreshFigurines } = usePublicFigurines();
  const navigate = useNavigate();

  console.log('🔍 [GALLERY] Gallery state:', {
    user: !!user,
    authLoading,
    figurinesCount: figurines.length,
    loading
  });

  // Filter and sort figurines based on current filters
  const filteredFigurines = useMemo(() => {
    let filtered = [...figurines];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(figurine =>
        figurine.title.toLowerCase().includes(searchLower) ||
        figurine.prompt?.toLowerCase().includes(searchLower) ||
        figurine.style?.toLowerCase().includes(searchLower) ||
        figurine.metadata?.creator_name?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    switch (filters.category) {
      case "text-to-3d":
        filtered = filtered.filter(f => f.metadata?.conversion_type === 'text-to-3d');
        break;
      case "traditional":
        filtered = filtered.filter(f => f.metadata?.conversion_type !== 'text-to-3d');
        break;
      case "with-model":
        filtered = filtered.filter(f => !!f.model_url);
        break;
      case "images-only":
        filtered = filtered.filter(f => !f.model_url);
        break;
    }

    // Sort
    switch (filters.sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "popular":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return filtered;
  }, [figurines, filters]);

  const handleCreateNew = () => {
    if (!user) {
      console.log('📝 [GALLERY] User not authenticated, showing auth prompt');
      setAuthPromptOpen(true);
      return;
    }
    
    console.log('📝 [GALLERY] Navigating to studio');
    navigate("/studio");
    toast({
      title: "Create New Model",
      description: "Let's make something awesome!"
    });
  };

  const handleRefresh = () => {
    console.log('🔄 [GALLERY] Manual refresh triggered');
    refreshFigurines();
    toast({
      title: "Gallery Refreshed",
      description: "Latest community models loaded"
    });
  };

  const handleViewModel = (figurine: Figurine) => {
    if (!figurine.model_url) {
      console.warn('⚠️ [GALLERY] No model URL for figurine:', figurine.id);
      toast({
        title: "No 3D Model Available",
        description: "This model doesn't have a 3D preview yet.",
        variant: "destructive"
      });
      return;
    }
    console.log('👁️ [GALLERY] Viewing model:', figurine.id);
  };

  // If still loading authentication, show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className="container mx-auto pt-32 pb-24 flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-figuro-accent" />
            <p className="text-white/70">Loading gallery...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-figuro-dark">
      <Header />
      
      {/* Enhanced Hero Section */}
      <EnhancedGalleryHero 
        totalModels={figurines.length}
        onCreateNew={handleCreateNew}
      />
      
      {/* Main Gallery Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Enhanced Filters */}
            <EnhancedGalleryFilters
              filters={filters}
              onFiltersChange={setFilters}
              totalResults={filteredFigurines.length}
              isLoading={loading}
            />

            {/* Refresh Button */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold text-white">
                  {filters.search ? "Search Results" : "Latest Models"}
                </h2>
              </div>
              
              <Button 
                onClick={handleRefresh}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:border-figuro-accent/50"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            {/* Futuristic Gallery Grid */}
            <FuturisticGalleryGrid
              figurines={filteredFigurines}
              loading={loading}
              viewMode={filters.viewMode}
              onViewModel={handleViewModel}
            />
          </motion.div>
        </div>
      </section>
      
      <Footer />

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        open={authPromptOpen}
        onOpenChange={setAuthPromptOpen}
      />
    </div>
  );
};

// Wrap the Gallery component with SecurityEnforcedRoute
const Gallery = () => {
  return (
    <SecurityEnforcedRoute requireVerification={false}>
      <GalleryContent />
    </SecurityEnforcedRoute>
  );
};

export default Gallery;
