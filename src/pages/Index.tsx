
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Floating3DShowcase from "@/components/homepage/Floating3DShowcase";
import SEO from "@/components/SEO";
import { pageSEO } from "@/config/seo";
import EnhancedGalleryHero from "@/components/gallery/EnhancedGalleryHero";
import EnhancedGalleryFilters from "@/components/gallery/enhanced/EnhancedGalleryFilters";
import Enhanced3DGalleryGrid from "@/components/gallery/enhanced/Enhanced3DGalleryGrid";
import OnDemand3DPreviewModal from "@/components/gallery/components/OnDemand3DPreviewModal";
import AuthPromptModal from "@/components/auth/AuthPromptModal";
import { usePublicFigurines } from "@/hooks/usePublicFigurines";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Figurine } from "@/types/figurine";

interface FilterState {
  search: string;
  category: string;
  sortBy: string;
  viewMode: "grid" | "list";
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useEnhancedAuth();
  const { figurines, loading } = usePublicFigurines();
  
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [modelViewerOpen, setModelViewerOpen] = useState(false);
  const [selectedFigurine, setSelectedFigurine] = useState<Figurine | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    sortBy: "newest",
    viewMode: "grid"
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
  }, [figurines, filters]);

  const handleCreateNew = () => {
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }
    navigate("/studio");
  };

  const handleCategorySelect = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
    
    // Scroll to the gallery section
    const gallerySection = document.getElementById('gallery-section');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewModel = (figurine: Figurine) => {
    if (!figurine.model_url) {
      toast({
        title: "No 3D Model Available",
        description: "This model doesn't have a 3D preview yet.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFigurine(figurine);
    setModelViewerOpen(true);
  };

  const handlePublicDownload = async (figurine: Figurine) => {
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
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

      toast({
        title: "Download Started",
        description: `Downloading ${fileName}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Download failed:', error);
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
    <>
      <SEO 
        title={pageSEO.home.title}
        description={pageSEO.home.description}
        keywords={pageSEO.home.keywords}
        ogType={pageSEO.home.ogType}
      />
      
      {/* 3D Showcase as Fixed Background */}
      <Floating3DShowcase />
      
      {/* Main Content Layer */}
      <div className="relative" style={{ zIndex: 10 }}>
        {/* Header */}
        <Header />
        
        {/* Hero Section - Full Height */}
        <Hero />
        
        {/* Enhanced Gallery Section */}
        <section id="gallery-section" className="py-16 bg-figuro-dark">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Enhanced Gallery Hero */}
            <EnhancedGalleryHero
              onCategorySelect={handleCategorySelect}
              onCreateNew={handleCreateNew}
              totalModels={figurines.length}
            />
            
            {/* Enhanced Filters */}
            <div className="mb-8">
              <EnhancedGalleryFilters
                filters={filters}
                onFiltersChange={setFilters}
                totalResults={filteredFigurines.length}
                isLoading={loading}
              />
            </div>
            
            {/* Enhanced 3D Gallery Grid */}
            <Enhanced3DGalleryGrid
              figurines={filteredFigurines}
              loading={loading}
              onView={handleViewModel}
              onDownload={handlePublicDownload}
            />
          </div>
        </section>
      </div>

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
    </>
  );
};

export default Index;
