
import React, { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGalleryFiles } from "@/components/gallery/useGalleryFiles";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { useModelViewer } from "@/components/gallery/useModelViewer";
import { useImageViewer } from "@/components/gallery/useImageViewer";
import { useGalleryHandlers } from "@/components/gallery/hooks/useGalleryHandlers";
import GalleryAuthSection from "@/components/gallery/GalleryAuthSection";
import GalleryContent from "@/components/gallery/GalleryContent";
import Generate3DConfigModal from "@/components/gallery/Generate3DConfigModal";
import type { Generate3DConfig } from "@/components/gallery/types/conversion";

const Gallery = () => {
  const { user } = useAuth();
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [selectedImageName, setSelectedImageName] = useState<string>("");
  
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

  // Handler to open the config modal
  const handleOpenConfigModal = (imageUrl: string, imageName: string) => {
    setSelectedImageUrl(imageUrl);
    setSelectedImageName(imageName);
    setConfigModalOpen(true);
  };

  // Handler to generate 3D model with config
  const handleGenerate3DWithConfig = (config: Generate3DConfig) => {
    setConfigModalOpen(false);
    generate3DModel(selectedImageUrl, selectedImageName, config);
  };

  const {
    authPromptOpen,
    setAuthPromptOpen,
    handleDownload,
    handleView,
    handleGenerate3D,
    handleNavigateToStudio,
    handleUploadClick
  } = useGalleryHandlers({
    generate3DModel: handleOpenConfigModal, // Use the config modal handler instead
    handleViewModel,
    handleViewImage
  });

  if (!user) {
    return (
      <>
        <GalleryAuthSection
          images={images}
          isLoading={isLoading}
          authPromptOpen={authPromptOpen}
          onAuthPromptChange={setAuthPromptOpen}
          onDownload={handleDownload}
          onView={handleView}
          onGenerate3D={handleGenerate3D}
          onNavigateToStudio={handleNavigateToStudio}
          onUploadClick={handleUploadClick}
        />
        <Generate3DConfigModal
          open={configModalOpen}
          onOpenChange={setConfigModalOpen}
          onGenerate={handleGenerate3DWithConfig}
          imageUrl={selectedImageUrl}
          imageName={selectedImageName}
        />
      </>
    );
  }

  return (
    <>
      <GalleryContent
        images={images}
        isLoading={isLoading}
        onDownload={handleDownload}
        onView={handleView}
        onGenerate3D={handleGenerate3D}
        onNavigateToStudio={handleNavigateToStudio}
        onUploadClick={handleUploadClick}
        modelViewerOpen={modelViewerOpen}
        setModelViewerOpen={setModelViewerOpen}
        viewingModel={viewingModel}
        viewingFileName={viewingFileName}
        onCloseModelViewer={handleCloseModelViewer}
        imageViewerOpen={imageViewerOpen}
        setImageViewerOpen={setImageViewerOpen}
        viewingImage={viewingImage}
        viewingImageName={viewingImageName}
        onCloseImageViewer={handleCloseImageViewer}
        isGenerating={isGenerating}
        progress={progress}
        onResetProgress={resetProgress}
        authPromptOpen={authPromptOpen}
        onAuthPromptChange={setAuthPromptOpen}
      />
      <Generate3DConfigModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        onGenerate={handleGenerate3DWithConfig}
        imageUrl={selectedImageUrl}
        imageName={selectedImageName}
      />
    </>
  );
};

export default Gallery;
