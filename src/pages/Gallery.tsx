import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GalleryContent from "@/components/gallery/GalleryContent";
import { useGalleryFiles } from "@/components/gallery/useGalleryFiles";
import { useModelViewer } from "@/components/gallery/useModelViewer";
import { useImageViewer } from "@/components/gallery/useImageViewer";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { useToast } from "@/hooks/use-toast";
import { enhancedResourcePool } from "@/components/gallery/performance/EnhancedResourcePool";
import { webGLContextTracker } from "@/components/model-viewer/utils/resourceManager";
import ComprehensivePerformanceMonitor from "@/components/gallery/performance/ComprehensivePerformanceMonitor";

const Gallery = () => {
  const { files, isLoading, error: rawError, refetch } = useGalleryFiles();
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const { toast } = useToast();
  const { user } = useEnhancedAuth();

  // Convert string error to Error object if needed
  const error = rawError ? new Error(rawError) : null;

  const {
    viewingModel,
    viewingFileName,
    modelViewerOpen,
    setModelViewerOpen,
    onCloseModelViewer,
    onViewModel
  } = useModelViewer();

  const {
    viewingImage,
    viewingImageName,
    imageViewerOpen,
    setImageViewerOpen,
    onCloseImageViewer,
    onViewImage
  } = useImageViewer();

  const {
    isGenerating,
    progress,
    generate3DModel,
    resetProgress
  } = useGallery3DGeneration();

  // Initialize performance monitoring in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Gallery: Initializing performance monitoring");
      setShowPerformanceMonitor(true);
      
      // Log initial resource pool stats
      const stats = enhancedResourcePool.getPerformanceStats();
      console.log("Initial resource pool stats:", stats);
    }
  }, []);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      console.log("Gallery unmounting - cleaning up enhanced resources");
      enhancedResourcePool.clear();
      webGLContextTracker.reset();
    };
  }, []);

  // Monitor performance and provide warnings
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const checkPerformance = () => {
        const contextCount = webGLContextTracker.getActiveContextCount();
        const resourceStats = enhancedResourcePool.getPerformanceStats();
        
        if (contextCount > 4) {
          console.warn(`High WebGL context usage: ${contextCount}/6`);
        }
        
        if (resourceStats.hitRatio < 0.7 && resourceStats.cacheHits > 10) {
          console.warn(`Low cache hit ratio: ${(resourceStats.hitRatio * 100).toFixed(1)}%`);
        }
      };
      
      const interval = setInterval(checkPerformance, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleGeneration3DOpenChange = (open: boolean) => {
    if (!open) {
      resetProgress();
    }
  };

  const handle3DGeneration = async (config: any) => {
    if (!viewingImage) {
      toast({
        title: "No image selected",
        description: "Please select an image to convert to 3D",
        variant: "destructive"
      });
      return;
    }

    const fileName = viewingImageName || 'gallery-image.png';
    await generate3DModel(viewingImage, fileName, config);
  };

  const handleDownload = () => {
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }
  };

  // Convert progress to match expected interface
  const convertedProgress = progress;

  return (
    <div className="min-h-screen bg-figuro-dark">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GalleryContent
              files={files}
              isLoading={isLoading}
              error={error}
              onViewModel={onViewModel}
              onViewImage={onViewImage}
              onDownload={handleDownload}
              onRefresh={refetch}
              modelViewerOpen={modelViewerOpen}
              setModelViewerOpen={setModelViewerOpen}
              viewingModel={viewingModel}
              viewingFileName={viewingFileName}
              onCloseModelViewer={onCloseModelViewer}
              imageViewerOpen={imageViewerOpen}
              setImageViewerOpen={setImageViewerOpen}
              viewingImage={viewingImage}
              viewingImageName={viewingImageName}
              onCloseImageViewer={onCloseImageViewer}
              isGenerating={isGenerating}
              progress={convertedProgress}
              onGeneration3DOpenChange={handleGeneration3DOpenChange}
              onResetProgress={resetProgress}
              onGenerate={handle3DGeneration}
              sourceImageUrl={viewingImage}
              authPromptOpen={authPromptOpen}
              onAuthPromptChange={setAuthPromptOpen}
            />
          </motion.div>
        </div>
      </main>
      
      <Footer />
      
      {/* Comprehensive Performance Monitor */}
      <ComprehensivePerformanceMonitor
        visible={showPerformanceMonitor}
        position="top-right"
        updateInterval={1000}
      />
    </div>
  );
};

export default Gallery;
