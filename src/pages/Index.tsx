
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Floating3DShowcase from "@/components/homepage/Floating3DShowcase";
import SEO from "@/components/SEO";
import { pageSEO } from "@/config/seo";
import Enhanced3DGalleryGrid from "@/components/gallery/enhanced/Enhanced3DGalleryGrid";
import OnDemand3DPreviewModal from "@/components/gallery/components/OnDemand3DPreviewModal";
import AuthPromptModal from "@/components/auth/AuthPromptModal";
import { usePublicFigurines } from "@/hooks/usePublicFigurines";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Figurine } from "@/types/figurine";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useEnhancedAuth();
  const { figurines, loading } = usePublicFigurines();
  
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [modelViewerOpen, setModelViewerOpen] = useState(false);
  const [selectedFigurine, setSelectedFigurine] = useState<Figurine | null>(null);

  // Limit to first 12 figurines for homepage display
  const displayedFigurines = useMemo(() => {
    return figurines.slice(0, 12);
  }, [figurines]);

  const handleCreateNew = () => {
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }
    navigate("/studio");
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
        
        {/* Simplified Gallery Section */}
        <section className="py-16 bg-figuro-dark">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Simple Section Title */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Community Creations
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Discover amazing 3D figurines created by our community using AI
              </p>
            </div>
            
            {/* Enhanced 3D Gallery Grid */}
            <Enhanced3DGalleryGrid
              figurines={displayedFigurines}
              loading={loading}
              onView={handleViewModel}
              onDownload={handlePublicDownload}
            />

            {/* View More Link */}
            {figurines.length > 12 && (
              <div className="text-center mt-12">
                <button
                  onClick={() => navigate('/gallery')}
                  className="inline-flex items-center px-6 py-3 bg-figuro-accent hover:bg-figuro-accent-hover text-white font-medium rounded-lg transition-colors duration-200"
                >
                  View All {figurines.length} Models
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
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
