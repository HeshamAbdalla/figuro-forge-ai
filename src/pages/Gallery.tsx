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
import AnimatedSection from "@/components/animations/AnimatedSection";
import StaggerContainer from "@/components/animations/StaggerContainer";
import { useGalleryFiles } from "@/components/gallery/useGalleryFiles";
import { useModelUpload } from "@/components/gallery/useModelUpload";
import { useModelViewer } from "@/components/gallery/useModelViewer";
import { useToast } from "@/hooks/use-toast";

const Gallery = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
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

  // Ensure data is refreshed when navigating to gallery
  useEffect(() => {
    // Force a refresh when navigating to gallery to ensure content loads
    if (location.pathname === '/gallery') {
      fetchImagesFromBucket();
    }
  }, [location.pathname, fetchImagesFromBucket]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      // Any cleanup needed
    };
  }, []);

  const handleNavigateToStudio = () => {
    navigate('/studio');
  };
  
  const handleDownload = async (imageUrl: string, imageName: string) => {
    if (!imageUrl) return;
    
    try {
      // Fetch the file as a blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create an object URL for the blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = imageName || 'figurine.png';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

      toast({
        title: "Download started",
        description: `Downloading ${imageName || 'file'}`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Download failed",
        description: "There was a problem downloading the file",
        variant: "destructive"
      });
    }
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
      
      <Footer />
    </div>
  );
};

export default Gallery;
