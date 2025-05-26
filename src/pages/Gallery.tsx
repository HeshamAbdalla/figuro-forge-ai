
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UploadModelModal from "@/components/UploadModelModal";
import GalleryHeader from "@/components/gallery/GalleryHeader";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import ModelViewerDialog from "@/components/gallery/ModelViewerDialog";
import CallToAction from "@/components/gallery/CallToAction";
import ModelViewer from "@/components/model-viewer";
import Generate3DModal from "@/components/gallery/Generate3DModal";
import Generate3DConfigModal, { Generate3DConfig } from "@/components/gallery/Generate3DConfigModal";
import AnimatedSection from "@/components/animations/AnimatedSection";
import StaggerContainer from "@/components/animations/StaggerContainer";
import { useGalleryFiles } from "@/components/gallery/useGalleryFiles";
import { useModelUpload } from "@/components/gallery/useModelUpload";
import { useModelViewer } from "@/components/gallery/useModelViewer";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { useToast } from "@/hooks/use-toast";

const Gallery = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [generate3DModalOpen, setGenerate3DModalOpen] = useState(false);
  const [generate3DConfigModalOpen, setGenerate3DConfigModalOpen] = useState(false);
  const [pendingImageData, setPendingImageData] = useState<{ url: string; name: string } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Use custom hooks to manage gallery functionality
  const { images, isLoading, fetchImagesFromBucket } = useGalleryFiles();
  const { customModelUrl, customModelFile, handleModelUpload } = useModelUpload(fetchImagesFromBucket);
  const { 
    viewingModel, 
    modelViewerOpen, 
    setModelViewerOpen, 
    handleViewModel, 
    handleCloseModelViewer 
  } = useModelViewer();
  const { 
    isGenerating, 
    progress, 
    generate3DModel, 
    resetProgress 
  } = useGallery3DGeneration();

  // Ensure data is refreshed when navigating to gallery
  useEffect(() => {
    // Force a refresh when navigating to gallery to ensure content loads
    if (location.pathname === '/gallery') {
      fetchImagesFromBucket();
    }
  }, [location.pathname, fetchImagesFromBucket]);

  // Auto-refresh gallery when 3D generation completes
  useEffect(() => {
    if (progress.status === 'completed') {
      // Refresh the gallery after a short delay to show the new 3D model
      setTimeout(() => {
        fetchImagesFromBucket();
      }, 2000);
    }
  }, [progress.status, fetchImagesFromBucket]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      // Any cleanup needed
    };
  }, []);

  const handleNavigateToStudio = () => {
    navigate('/studio');
  };
  
  // Legacy download function - now handled by useSecureDownload hook
  const handleDownload = async (imageUrl: string, imageName: string) => {
    // This function is kept for backward compatibility but is no longer used
    // Downloads are now handled by the useSecureDownload hook in GalleryItem
    console.log('Legacy download function called - this should use useSecureDownload instead');
  };

  const handleGenerate3D = async (imageUrl: string, imageName: string) => {
    // Show configuration modal instead of directly generating
    setPendingImageData({ url: imageUrl, name: imageName });
    setGenerate3DConfigModalOpen(true);
  };

  const handleGenerate3DWithConfig = async (config: Generate3DConfig) => {
    if (!pendingImageData) return;
    
    try {
      console.log('🎯 [GALLERY] Starting 3D generation with config:', config);
      setGenerate3DConfigModalOpen(false);
      setGenerate3DModalOpen(true);
      
      // Pass the configuration to the generation function
      await generate3DModel(pendingImageData.url, pendingImageData.name, config);
    } catch (error) {
      console.error('❌ [GALLERY] 3D generation failed:', error);
      toast({
        title: "3D Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate 3D model",
        variant: "destructive"
      });
    } finally {
      setPendingImageData(null);
    }
  };

  const handleCloseGenerate3DModal = () => {
    resetProgress();
    setGenerate3DModalOpen(false);
  };

  const handleCloseGenerate3DConfigModal = () => {
    setPendingImageData(null);
    setGenerate3DConfigModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-figuro-dark">
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <AnimatedSection delay={0.1}>
            <GalleryHeader onUploadClick={() => setUploadModalOpen(true)} />
          </AnimatedSection>
          
          {customModelUrl && (
            <AnimatedSection delay={0.2} className="mb-16">
              <h2 className="text-2xl font-bold mb-4 text-gradient text-center">Preview Your Uploaded Model</h2>
              <div className="max-w-3xl mx-auto">
                <ModelViewer 
                  modelUrl={customModelUrl} 
                  isLoading={false}
                />
              </div>
            </AnimatedSection>
          )}
          
          <StaggerContainer staggerDelay={0.03} initialDelay={0.2}>
            <GalleryGrid 
              images={images}
              isLoading={isLoading}
              onDownload={handleDownload}
              onViewModel={handleViewModel}
              onGenerate3D={handleGenerate3D}
            />
          </StaggerContainer>
        </div>
      </section>
      
      <AnimatedSection delay={0.3}>
        <CallToAction onNavigateToStudio={handleNavigateToStudio} />
      </AnimatedSection>
      
      {/* Upload Model Modal */}
      <UploadModelModal 
        isOpen={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onModelUpload={handleModelUpload}
      />
      
      {/* 3D Model Viewer Dialog */}
      <ModelViewerDialog
        open={modelViewerOpen}
        onOpenChange={setModelViewerOpen}
        modelUrl={viewingModel}
        onClose={handleCloseModelViewer}
      />

      {/* 3D Generation Configuration Modal */}
      {pendingImageData && (
        <Generate3DConfigModal
          open={generate3DConfigModalOpen}
          onOpenChange={setGenerate3DConfigModalOpen}
          onGenerate={handleGenerate3DWithConfig}
          imageUrl={pendingImageData.url}
          imageName={pendingImageData.name}
          onClose={handleCloseGenerate3DConfigModal}
        />
      )}

      {/* 3D Generation Progress Modal */}
      <Generate3DModal
        open={generate3DModalOpen}
        onOpenChange={setGenerate3DModalOpen}
        progress={progress}
        onClose={handleCloseGenerate3DModal}
      />
      
      <Footer />
    </div>
  );
};

export default Gallery;
