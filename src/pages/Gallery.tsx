import React from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import AuthPromptModal from "@/components/auth/AuthPromptModal";
import GalleryHeader from "@/components/gallery/GalleryHeader";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import CallToAction from "@/components/gallery/CallToAction";
import Generate3DModal from "@/components/gallery/Generate3DModal";
import Generate3DConfigModal from "@/components/gallery/Generate3DConfigModal";
import EnhancedModelViewerDialog from "@/components/gallery/EnhancedModelViewerDialog";
import EnhancedImageViewerDialog from "@/components/gallery/EnhancedImageViewerDialog";
import { useGalleryFiles } from "@/components/gallery/useGalleryFiles";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { useModelViewer } from "@/components/gallery/useModelViewer";
import { useImageViewer } from "@/components/gallery/useImageViewer";
import PageTransition from "@/components/PageTransition";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Gallery = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  
  const {
    images,
    isLoading,
    fetchImagesFromBucket
  } = useGalleryFiles();

  const {
    isGenerating,
    progress,
    generate3DModel,
    resetProgress
  } = useGallery3DGeneration();

  const {
    viewingModel,
    viewingFileName,
    modelViewerOpen,
    setModelViewerOpen,
    handleViewModel,
    handleCloseModelViewer
  } = useModelViewer();

  const {
    viewingImage,
    viewingImageName,
    imageViewerOpen,
    setImageViewerOpen,
    handleViewImage,
    handleCloseImageViewer
  } = useImageViewer();

  // Handle download functionality
  const handleDownload = (url: string, name: string) => {
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }
    
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle view functionality - route to appropriate viewer
  const handleView = (url: string, fileName: string, fileType: 'image' | '3d-model') => {
    if (fileType === '3d-model') {
      handleViewModel(url, fileName);
    } else {
      handleViewImage(url, fileName);
    }
  };

  // Handle 3D generation
  const handleGenerate3D = (imageUrl: string, imageName: string) => {
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }
    
    generate3DModel(imageUrl, imageName);
  };

  // Handle navigation to studio
  const handleNavigateToStudio = () => {
    navigate('/studio');
  };

  // Handle upload click
  const handleUploadClick = () => {
    // TODO: Implement upload functionality
    console.log('Upload clicked');
  };

  if (!user) {
    return (
      <>
        <AuthPromptModal 
          open={authPromptOpen} 
          onOpenChange={setAuthPromptOpen}
        />
        <PageTransition>
          <Helmet>
            <title>Gallery - Figuro</title>
            <meta name="description" content="Browse and manage your 3D models and images in your personal Figuro gallery." />
          </Helmet>

          <div className="min-h-screen bg-gradient-to-br from-figuro-dark via-figuro-dark to-figuro-accent/20">
            <div className="container mx-auto px-4 py-8">
              <GalleryHeader onUploadClick={handleUploadClick} />
              
              <GalleryGrid 
                images={images}
                isLoading={isLoading}
                onDownload={handleDownload}
                onView={handleView}
                onGenerate3D={handleGenerate3D}
              />
              
              <CallToAction onNavigateToStudio={handleNavigateToStudio} />
            </div>
          </div>
        </PageTransition>
      </>
    );
  }

  return (
    <PageTransition>
      <Helmet>
        <title>Gallery - Figuro</title>
        <meta name="description" content="Browse and manage your 3D models and images in your personal Figuro gallery." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-figuro-dark via-figuro-dark to-figuro-accent/20">
        <div className="container mx-auto px-4 py-8">
          <GalleryHeader onUploadClick={handleUploadClick} />
          
          <GalleryGrid 
            images={images}
            isLoading={isLoading}
            onDownload={handleDownload}
            onView={handleView}
            onGenerate3D={handleGenerate3D}
          />
          
          <CallToAction onNavigateToStudio={handleNavigateToStudio} />
        </div>

        {/* Enhanced 3D Model Viewer Dialog */}
        <EnhancedModelViewerDialog
          open={modelViewerOpen}
          onOpenChange={setModelViewerOpen}
          modelUrl={viewingModel}
          fileName={viewingFileName}
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

        {/* 3D Generation Modal */}
        <Generate3DModal 
          open={isGenerating}
          onOpenChange={(open) => {
            if (!open) {
              resetProgress();
            }
          }}
          progress={progress}
          onClose={resetProgress}
        />

        {/* Auth Prompt Modal */}
        <AuthPromptModal 
          open={authPromptOpen} 
          onOpenChange={setAuthPromptOpen}
        />
      </div>
    </PageTransition>
  );
};

export default Gallery;
