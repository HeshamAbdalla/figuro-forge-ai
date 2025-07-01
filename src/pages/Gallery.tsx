
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
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

const Gallery = () => {
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
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

  console.log('🔍 [GALLERY] Public gallery state:', {
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
    refetch();
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

  const handlePublicDownload = async (figurine: Figurine) => {
    console.log('📥 [GALLERY] Public download started for:', figurine.id);
    
    try {
      // Determine what to download based on figurine type
      const isTextTo3D = figurine.style === 'text-to-3d' || figurine.title.startsWith('Text-to-3D:');
      const downloadUrl = isTextTo3D && figurine.model_url ? figurine.model_url : figurine.image_url;
      const fileName = isTextTo3D && figurine.model_url 
        ? `${figurine.title.replace(/\s+/g, '-')}-${figurine.id.substring(0, 8)}.glb`
        : `${figurine.title.replace(/\s+/g, '-')}-${figurine.id.substring(0, 8)}.png`;

      if (!downloadUrl) {
        toast({
          title: "Download Error",
          description: "No download URL available for this item.",
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
            
            {/* Futuristic Gallery Grid with Public Download */}
            <FuturisticGalleryGrid
              figurines={filteredFigurines}
              loading={loading}
              viewMode={filters.viewMode}
              onViewModel={handleViewModel}
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
    </div>
  );
};

export default Gallery;
