import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Image, Box, Eye, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGalleryFiles } from "@/components/gallery/useGalleryFiles";
import { useSecureDownload } from "@/hooks/useSecureDownload";
import ModelPreview from "@/components/gallery/ModelPreview";
import ModelViewerDialog from "@/components/gallery/ModelViewerDialog";
import AuthPromptModal from "@/components/auth/AuthPromptModal";
import { useModelViewer } from "@/components/gallery/useModelViewer";
import AnimatedSection from "@/components/animations/AnimatedSection";
import StaggerContainer from "@/components/animations/StaggerContainer";
import AnimatedItem from "@/components/animations/AnimatedItem";
import EnhancedImageViewerDialog from "@/components/gallery/EnhancedImageViewerDialog";
import { useImageViewer } from "@/components/gallery/useImageViewer";

const HomepageGallery: React.FC = () => {
  const { images, isLoading } = useGalleryFiles();
  const navigate = useNavigate();
  
  // Set up model viewer functionality
  const { 
    viewingModel, 
    modelViewerOpen, 
    setModelViewerOpen, 
    handleViewModel, 
    handleCloseModelViewer 
  } = useModelViewer();

  // Set up image viewer functionality
  const {
    viewingImage,
    viewingImageName,
    imageViewerOpen,
    setImageViewerOpen,
    handleViewImage,
    handleCloseImageViewer
  } = useImageViewer();

  // Set up secure download functionality
  const { 
    secureDownload, 
    isDownloading, 
    authPromptOpen, 
    setAuthPromptOpen,
    isAuthenticated 
  } = useSecureDownload();
  
  // Limit to 10 items for homepage display
  const limitedImages = images.slice(0, 10);

  const navigateToGallery = () => {
    navigate("/gallery");
  };

  const navigateToStudio = () => {
    navigate("/studio");
  };

  // Handle view functionality - route to appropriate viewer
  const handleView = (url: string, fileName: string, fileType: 'image' | '3d-model') => {
    if (fileType === '3d-model') {
      handleViewModel(url);
    } else {
      handleViewImage(url, fileName);
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <AnimatedSection delay={0.1} className="flex flex-col items-center mb-16 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gradient">
            Latest Creations
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Explore the latest figurines created by our community. Get inspired and start creating your own unique designs.
          </p>
        </AnimatedSection>

        {isLoading ? (
          <StaggerContainer 
            staggerDelay={0.05} 
            initialDelay={0.2}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5"
          >
            {Array(10).fill(0).map((_, index) => (
              <AnimatedItem key={index}>
                <div className="glass-panel h-48 md:h-40">
                  <Skeleton className="h-full w-full bg-white/5 loading-shine" />
                </div>
              </AnimatedItem>
            ))}
          </StaggerContainer>
        ) : limitedImages.length > 0 ? (
          <>
            <StaggerContainer 
              staggerDelay={0.08} 
              initialDelay={0.3}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5"
            >
              {limitedImages.map((file) => (
                <AnimatedItem key={file.id}>
                  <motion.div
                    className="glass-panel overflow-hidden aspect-square relative group"
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2, ease: "easeOut" }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-full h-full">
                      {file.type === '3d-model' ? (
                        <ModelPreview 
                          modelUrl={file.url} 
                          fileName={file.name} 
                        />
                      ) : (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <motion.div 
                      className="absolute inset-0 backdrop-blur-md bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <div className="p-4 w-full flex flex-col items-center">
                        <div className="flex items-center gap-1 mb-2">
                          {file.type === '3d-model' ? (
                            <Box size={14} className="text-figuro-accent" />
                          ) : (
                            <Image size={14} className="text-white/70" />
                          )}
                          <span className="text-xs text-white/90">
                            {file.type === '3d-model' ? "3D Model" : "Image"}
                          </span>
                        </div>
                        
                        <div className="flex flex-col gap-2 w-full">
                          <Button
                            onClick={() => handleView(file.url, file.name, file.type)}
                            size="sm"
                            className="w-full bg-figuro-accent hover:bg-figuro-accent-hover h-8 px-3 transform transition-transform hover:scale-105"
                          >
                            <Eye size={14} className="mr-1.5" /> 
                            {file.type === '3d-model' ? 'View Model' : 'View Image'}
                          </Button>
                          <Button
                            onClick={() => secureDownload(file.url, file.name)}
                            disabled={isDownloading}
                            size="sm"
                            variant="outline"
                            className="w-full border-white/10 h-8 px-3 transform transition-transform hover:scale-105"
                          >
                            {isDownloading ? (
                              <>
                                <Loader2 size={14} className="mr-1.5 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download size={14} className="mr-1.5" />
                                {isAuthenticated ? 'Download' : 'Sign in'}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </AnimatedItem>
              ))}
            </StaggerContainer>
            <AnimatedSection delay={0.6} className="flex justify-center mt-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={navigateToGallery}
                  className="bg-figuro-accent hover:bg-figuro-accent-hover flex items-center gap-2"
                >
                  View Full Gallery <ArrowRight size={16} />
                </Button>
              </motion.div>
            </AnimatedSection>
          </>
        ) : (
          <AnimatedSection delay={0.3} className="text-center py-16">
            <p className="text-white/70">No images found in the gallery yet. Be the first to create one!</p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={navigateToStudio}
                className="mt-4 bg-figuro-accent hover:bg-figuro-accent-hover"
              >
                Create Your First Figurine
              </Button>
            </motion.div>
          </AnimatedSection>
        )}
      </div>
      
      {/* Model Viewer Dialog for 3D models */}
      <ModelViewerDialog
        open={modelViewerOpen}
        onOpenChange={setModelViewerOpen}
        modelUrl={viewingModel}
        onClose={handleCloseModelViewer}
      />

      {/* Enhanced Image Viewer Dialog */}
      <EnhancedImageViewerDialog
        open={imageViewerOpen}
        onOpenChange={setImageViewerOpen}
        imageUrl={viewingImage}
        fileName={viewingImageName}
        onClose={handleCloseImageViewer}
      />

      {/* Authentication Prompt Modal */}
      <AuthPromptModal
        open={authPromptOpen}
        onOpenChange={setAuthPromptOpen}
      />
    </section>
  );
};

export default HomepageGallery;
