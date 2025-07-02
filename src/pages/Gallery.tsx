import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import AuthPromptModal from "@/components/auth/AuthPromptModal";
import { usePublicFigurines } from "@/hooks/usePublicFigurines";
import { Figurine } from "@/types/figurine";
import EnhancedGalleryHero from "@/components/gallery/EnhancedGalleryHero";
import EnhancedGalleryFilters from "@/components/gallery/enhanced/EnhancedGalleryFilters";
import Enhanced3DGalleryGrid from "@/components/gallery/enhanced/Enhanced3DGalleryGrid";
import OnDemand3DPreviewModal from "@/components/gallery/components/OnDemand3DPreviewModal";

interface FilterState {
  search: string;
  category: string;
  sortBy: string;
  viewMode: "grid" | "list";
}

const Gallery = () => {
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [modelViewerOpen, setModelViewerOpen] = useState(false);
  const [selectedFigurine, setSelectedFigurine] = useState<Figurine | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    sortBy: "newest",
    viewMode: "grid"
  });
  
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useEnhancedAuth();
  const { figurines, loading, refetch } = usePublicFigurines();
  const navigate = useNavigate();

  console.log('🔍 [GALLERY] Enhanced 3D gallery state:', {
    user: !!user,
    authLoading,
    figurinesCount: figurines.length,
    loading
  });

  // Filter figurines to only show those with 3D models
  const modelsOnlyFigurines = useMemo(() => {
    const filtered = figurines.filter(figurine => 
      figurine.model_url && figurine.model_url.trim() !== ''
    );
    
    console.log('🎯 [GALLERY] Filtered to 3D models only:', {
      original: figurines.length,
      withModels: filtered.length
    });
    
    return filtered;
  }, [figurines]);

  // Filter and sort figurines based on current filters
  const filteredFigurines = useMemo(() => {
    let filtered = [...modelsOnlyFigurines];

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
      case "liked":
        // This would require user authentication and checking likes
        if (user) {
          // For now, show all - we'll implement user-specific likes later
        }
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
      case "popular":
        filtered.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
        break;
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  }, [modelsOnlyFigurines, filters, user]);

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
    refetch();
    toast({
      title: "Gallery Refreshed",
      description: "Latest community models loaded"
    });
  };

  const handleCategorySelect = (category: string) => {
    console.log('🏷️ [GALLERY] Category selected:', category);
    setFilters(prev => ({ ...prev, category }));
    
    // Scroll to the gallery grid section
    const gallerySection = document.getElementById('gallery-grid');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth' });
    }
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
    
    console.log('👁️ [GALLERY] Opening 3D model viewer for:', figurine.id);
    setSelectedFigurine(figurine);
    setModelViewerOpen(true);
  };

  const handlePublicDownload = async (figurine: Figurine) => {
    console.log('📥 [GALLERY] Public download started for:', figurine.id);
    
    try {
      const downloadUrl = figurine.model_url;
      const fileName = `${figurine.title.replace(/\s+/g, '-')}-${figurine.id.substring(0, 8)}.glb`;

      if (!downloadUrl) {
        toast({
          title: "Download Error",
          description: "No download URL available for this model.",
          variant: "destructive"
        });
        return;
      }

      // Direct download without authentication
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

      toast({
        title: "Download Started",
        description: `Downloading ${fileName}`,
        variant: "default"
      });

      console.log('✅ [GALLERY] Public download completed successfully');
    } catch (error) {
      console.error('❌ [GALLERY] Public download failed:', error);
      toast({
        title: "Download Failed",
        description: "There was a problem downloading the file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleModalDownload = () => {
    if (selectedFigurine) {
      handlePublicDownload(selectedFigurine);
    }
  };

  return (
    <div className="min-h-screen bg-figuro-dark">
      <Header />
      
      {/* Enhanced Hero Section with Category Cards */}
      <EnhancedGalleryHero
        onCategorySelect={handleCategorySelect}
        onCreateNew={handleCreateNew}
        totalModels={modelsOnlyFigurines.length}
      />
      
      {/* Main Gallery Content */}
      <section className="py-16" id="gallery-grid">
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
                  {filters.search ? "3D Model Search Results" : 
                   filters.category !== "all" ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)} Models` :
                   "Latest 3D Models"}
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
            
            {/* Enhanced 3D Gallery Grid */}
            <Enhanced3DGalleryGrid
              figurines={filteredFigurines}
              loading={loading}
              onView={handleViewModel}
              onDownload={handlePublicDownload}
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

      {/* 3D Model Viewer Modal */}
      <OnDemand3DPreviewModal
        open={modelViewerOpen}
        onOpenChange={setModelViewerOpen}
        modelUrl={selectedFigurine?.model_url || null}
        modelName={selectedFigurine?.title || null}
        onDownload={handleModalDownload}
      />
    </div>
  );
};

export default Gallery;
