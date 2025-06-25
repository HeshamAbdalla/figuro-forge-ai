
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import AuthPromptModal from "@/components/auth/AuthPromptModal";
import { useFigurines } from "@/components/figurine/useFigurines";
import { Figurine } from "@/types/figurine";
import PersonalGalleryHero from "@/components/figurine/PersonalGalleryHero";
import EnhancedGalleryFilters from "@/components/gallery/enhanced/EnhancedGalleryFilters";
import FuturisticGalleryGrid from "@/components/gallery/enhanced/FuturisticGalleryGrid";
import { deleteFigurine } from "@/services/deletionService";

interface FilterState {
  search: string;
  category: string;
  sortBy: string;
  viewMode: "grid" | "list";
}

const ProfileFigurines = () => {
  const { user, isLoading: authLoading } = useEnhancedAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { figurines, loading, refreshFigurines } = useFigurines();
  
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    sortBy: "newest",
    viewMode: "grid"
  });
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  // Filter and sort figurines based on current filters
  const filteredFigurines = useMemo(() => {
    let filtered = [...figurines];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(figurine =>
        figurine.title.toLowerCase().includes(searchLower) ||
        figurine.prompt?.toLowerCase().includes(searchLower) ||
        figurine.style?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    switch (filters.category) {
      case "text-to-3d":
        filtered = filtered.filter(f => f.style === 'text-to-3d' || f.title.startsWith('Text-to-3D:'));
        break;
      case "traditional":
        filtered = filtered.filter(f => f.style !== 'text-to-3d' && !f.title.startsWith('Text-to-3D:'));
        break;
      case "with-model":
        filtered = filtered.filter(f => !!f.model_url);
        break;
      case "images-only":
        filtered = filtered.filter(f => !f.model_url);
        break;
      case "published":
        filtered = filtered.filter(f => f.is_public);
        break;
      case "private":
        filtered = filtered.filter(f => !f.is_public);
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
    }

    return filtered;
  }, [figurines, filters]);

  const handleCreateNew = () => {
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }
    
    navigate("/studio");
    toast({
      title: "Create New Figurine",
      description: "Let's make something awesome!"
    });
  };

  const handleRefresh = () => {
    refreshFigurines();
    toast({
      title: "Figurines Refreshed",
      description: "Your collection has been updated"
    });
  };

  const handleViewModel = (figurine: Figurine) => {
    if (!figurine.model_url) {
      toast({
        title: "No 3D Model Available",
        description: "This figurine doesn't have a 3D model to view yet.",
        variant: "destructive"
      });
      return;
    }
    // The FuturisticGalleryGrid component will handle the modal internally
  };

  const handleDelete = async (figurine: Figurine): Promise<void> => {
    console.log('🗑️ [PROFILE-FIGURINES] Starting delete process for figurine:', figurine.id);
    
    try {
      const result = await deleteFigurine(figurine.id);
      
      if (result.success) {
        console.log('✅ [PROFILE-FIGURINES] Figurine deleted successfully');
        
        // Refresh the figurines list
        await refreshFigurines();
        
        toast({
          title: "Figurine Deleted",
          description: "Your figurine has been permanently deleted."
        });
      } else {
        console.error('❌ [PROFILE-FIGURINES] Delete failed:', result.error);
        toast({
          title: "Delete Failed",
          description: result.error || "Failed to delete the figurine. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ [PROFILE-FIGURINES] Delete error:', error);
      toast({
        title: "Delete Error",
        description: "An unexpected error occurred while deleting the figurine.",
        variant: "destructive"
      });
    }
  };

  // If still loading authentication, show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className="container mx-auto pt-32 pb-24 flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-figuro-accent" />
            <p className="text-white/70">Loading your profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className="container mx-auto pt-32 pb-24 flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <p className="text-white/70">Please sign in to view your figurines</p>
            <Button 
              onClick={() => navigate("/auth")}
              variant="default"
              className="bg-figuro-accent hover:bg-figuro-accent-hover"
            >
              Sign In
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-figuro-dark">
      <Header />
      
      {/* Personal Gallery Hero Section */}
      <PersonalGalleryHero 
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
                  {filters.search ? "Search Results" : "Your Collection"}
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
              onDelete={handleDelete}
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

export default ProfileFigurines;
