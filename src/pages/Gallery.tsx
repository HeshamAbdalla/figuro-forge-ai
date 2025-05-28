
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GalleryContent from "@/components/gallery/GalleryContent";
import GalleryModals from "@/components/gallery/GalleryModals";
import { useGalleryFiles } from "@/components/gallery/useGalleryFiles";
import { useModelViewer } from "@/components/gallery/useModelViewer";
import { useImageViewer } from "@/components/gallery/useImageViewer";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

const Gallery = () => {
  const { files, isLoading, error, refetch } = useGalleryFiles();
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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

  // Show auth prompt for downloads when not authenticated
  const handleDownload = () => {
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }
    // Download logic would go here
  };

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
            />

            <GalleryModals
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
              progress={progress}
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
    </div>
  );
};

export default Gallery;
