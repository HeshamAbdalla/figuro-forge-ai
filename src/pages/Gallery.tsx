import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Box, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { useGalleryFiles } from "@/components/gallery/useGalleryFiles";
import { useModelViewer } from "@/components/gallery/useModelViewer";
import { useImageViewer } from "@/components/gallery/useImageViewer";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { enhancedResourcePool } from "@/components/gallery/performance/EnhancedResourcePool";
import { webGLContextTracker } from "@/components/model-viewer/utils/resourceManager";
import ComprehensivePerformanceMonitor from "@/components/gallery/performance/ComprehensivePerformanceMonitor";
import EnhancedGalleryView from "@/components/gallery/enhanced/EnhancedGalleryView";
import ModelViewerDialog from "@/components/gallery/ModelViewerDialog";
import EnhancedImageViewerDialog from "@/components/gallery/EnhancedImageViewerDialog";
import Generate3DModal from "@/components/gallery/Generate3DModal";
import AuthPromptModal from "@/components/auth/AuthPromptModal";
import { webGLContextManager } from "@/components/gallery/enhanced/WebGLContextManager";

const Gallery = () => {
  const { files, isLoading, error: rawError, refetch } = useGalleryFiles();
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useEnhancedAuth();
  const navigate = useNavigate();

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

  // Enhanced performance monitoring
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Gallery: Initializing enhanced performance monitoring");
      setShowPerformanceMonitor(true);
      
      // Log initial resource pool stats
      const stats = enhancedResourcePool.getPerformanceStats();
      const webglStats = webGLContextManager.getStats();
      console.log("Initial resource pool stats:", stats);
      console.log("Initial WebGL stats:", webglStats);
    }
  }, []);

  // Enhanced cleanup when component unmounts
  useEffect(() => {
    return () => {
      console.log("Gallery unmounting - performing enhanced cleanup");
      enhancedResourcePool.clear();
      webGLContextManager.clear();
      webGLContextTracker.reset();
    };
  }, []);

  // Enhanced performance monitoring with WebGL context tracking
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const checkPerformance = () => {
        const contextCount = webGLContextTracker.getActiveContextCount();
        const resourceStats = enhancedResourcePool.getPerformanceStats();
        const webglStats = webGLContextManager.getStats();
        
        if (contextCount > 4) {
          console.warn(`High WebGL context usage: ${contextCount}/6`);
        }
        
        if (webglStats.active >= webglStats.max) {
          console.warn(`WebGL context limit reached: ${webglStats.active}/${webglStats.max}, queued: ${webglStats.queued}`);
        }
        
        if (resourceStats.hitRatio < 0.7 && resourceStats.cacheHits > 10) {
          console.warn(`Low cache hit ratio: ${(resourceStats.hitRatio * 100).toFixed(1)}%`);
        }
      };
      
      const interval = setInterval(checkPerformance, 3000); // Check every 3 seconds
      return () => clearInterval(interval);
    }
  }, []);

  const handleCreateNew = () => {
    navigate("/studio");
    toast({
      title: "Create New Model",
      description: "Let's make something awesome!"
    });
  };

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

  const handleDownload = (file: any) => {
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }
    // Implement download logic here
  };

  const handleUploadModel = (file: any) => {
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }
    // Implement upload model logic here
  };

  const handleTogglePublish = (file: any) => {
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }
    // Implement toggle publish logic here
  };

  // Convert files to figurine format for EnhancedGalleryView
  const figurines = files.map(file => ({
    id: file.id,
    title: file.name,
    style: file.type === '3d-model' ? 'image-to-3d' : file.type,
    image_url: file.url,
    saved_image_url: file.url,
    model_url: file.type === '3d-model' ? file.url : null,
    prompt: '',
    created_at: file.created_at,
    is_public: false,
    file_type: file.type
  }));

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

  // If no user after loading, show sign in prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className="container mx-auto pt-32 pb-24 flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <p className="text-white/70">Please sign in to view your gallery</p>
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
      
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-10 flex flex-wrap justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-4">Community Gallery</h1>
                <p className="text-white/70">View and manage your 3D models and images with enhanced preview capabilities.</p>
              </div>
              
              <Button 
                onClick={handleCreateNew}
                className="mt-4 md:mt-0 bg-figuro-accent hover:bg-figuro-accent-hover"
              >
                <Box className="w-4 h-4 mr-2" />
                Create New Model
              </Button>
            </div>
            
            <EnhancedGalleryView
              figurines={figurines}
              loading={isLoading}
              onDownload={handleDownload}
              onViewModel={(figurine) => onViewModel(figurine.model_url!, figurine.title)}
              onTogglePublish={handleTogglePublish}
              onUploadModel={handleUploadModel}
            />
          </motion.div>
        </div>
      </section>
      
      <Footer />

      {/* Model Viewer Dialog */}
      <ModelViewerDialog
        open={modelViewerOpen}
        onOpenChange={setModelViewerOpen}
        modelUrl={viewingModel}
        onClose={onCloseModelViewer}
      />

      {/* Enhanced Image Viewer Dialog */}
      <EnhancedImageViewerDialog
        open={imageViewerOpen}
        onOpenChange={setImageViewerOpen}
        imageUrl={viewingImage}
        fileName={viewingImageName}
        onClose={onCloseImageViewer}
      />

      {/* Generate 3D Modal */}
      <Generate3DModal
        open={!!viewingImage && isGenerating}
        onOpenChange={handleGeneration3DOpenChange}
        imageUrl={viewingImage}
        isGenerating={isGenerating}
        onGenerate={handle3DGeneration}
      />

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        open={authPromptOpen}
        onOpenChange={setAuthPromptOpen}
      />
      
      {/* Enhanced Performance Monitor with WebGL tracking */}
      <ComprehensivePerformanceMonitor
        visible={showPerformanceMonitor}
        position="top-right"
        updateInterval={1000}
      />
    </div>
  );
};

export default Gallery;
