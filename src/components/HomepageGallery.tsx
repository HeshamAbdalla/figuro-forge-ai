
import React from "react";
import { useNavigate } from "react-router-dom";
import { useGalleryFiles } from "@/components/gallery/useGalleryFiles";
import { useSecureDownload } from "@/hooks/useSecureDownload";
import { useModelViewer } from "@/components/gallery/useModelViewer";
import { useImageViewer } from "@/components/gallery/useImageViewer";
import HomepageEnhancedGalleryHeader from "@/components/homepage/HomepageEnhancedGalleryHeader";
import HomepageGalleryLoading from "@/components/homepage/HomepageGalleryLoading";
import HomepageGalleryEmpty from "@/components/homepage/HomepageGalleryEmpty";
import HomepageEnhancedGalleryGrid from "@/components/homepage/HomepageEnhancedGalleryGrid";
import HomepageGalleryModals from "@/components/homepage/HomepageGalleryModals";

const HomepageGallery: React.FC = () => {
  const { files, isLoading } = useGalleryFiles();
  const navigate = useNavigate();
  
  // Set up model viewer functionality
  const { 
    viewingModel, 
    modelViewerOpen, 
    setModelViewerOpen, 
    onViewModel, 
    onCloseModelViewer 
  } = useModelViewer();

  // Set up image viewer functionality
  const {
    viewingImage,
    viewingImageName,
    imageViewerOpen,
    setImageViewerOpen,
    onViewImage,
    onCloseImageViewer
  } = useImageViewer();

  // Set up secure download functionality
  const { 
    secureDownload, 
    isDownloading, 
    authPromptOpen, 
    setAuthPromptOpen,
    isAuthenticated 
  } = useSecureDownload();

  const navigateToGallery = () => {
    navigate("/gallery");
  };

  const navigateToStudio = () => {
    navigate("/studio");
  };

  // Handle view functionality - route to appropriate viewer
  const handleView = (url: string, fileName: string, fileType: 'image' | '3d-model') => {
    if (fileType === '3d-model') {
      onViewModel(url, fileName);
    } else {
      onViewImage(url, fileName);
    }
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Enhanced background with animated gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-figuro-accent/5 via-purple-500/5 to-blue-500/5" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-figuro-accent/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto relative z-10">
        <HomepageEnhancedGalleryHeader />

        {isLoading ? (
          <HomepageGalleryLoading />
        ) : files.length > 0 ? (
          <HomepageEnhancedGalleryGrid
            images={files}
            isDownloading={isDownloading}
            isAuthenticated={isAuthenticated}
            onView={handleView}
            onDownload={secureDownload}
            onNavigateToGallery={navigateToGallery}
          />
        ) : (
          <HomepageGalleryEmpty onNavigateToStudio={navigateToStudio} />
        )}
      </div>
      
      <HomepageGalleryModals
        modelViewerOpen={modelViewerOpen}
        setModelViewerOpen={setModelViewerOpen}
        viewingModel={viewingModel}
        onCloseModelViewer={onCloseModelViewer}
        imageViewerOpen={imageViewerOpen}
        setImageViewerOpen={setImageViewerOpen}
        viewingImage={viewingImage}
        viewingImageName={viewingImageName}
        onCloseImageViewer={onCloseImageViewer}
        authPromptOpen={authPromptOpen}
        setAuthPromptOpen={setAuthPromptOpen}
      />
    </section>
  );
};

export default HomepageGallery;
