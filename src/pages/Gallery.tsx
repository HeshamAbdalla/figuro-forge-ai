
import React from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useGalleryFiles } from "@/components/gallery/useGalleryFiles";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { useModelViewer } from "@/components/gallery/useModelViewer";
import { useImageViewer } from "@/components/gallery/useImageViewer";
import { useGalleryHandlers } from "@/components/gallery/hooks/useGalleryHandlers";
import GalleryAuthSection from "@/components/gallery/GalleryAuthSection";
import GalleryContent from "@/components/gallery/GalleryContent";

const Gallery = () => {
  const { user } = useAuth();
  
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

  const {
    authPromptOpen,
    setAuthPromptOpen,
    handleDownload,
    handleView,
    handleGenerate3D,
    handleNavigateToStudio,
    handleUploadClick
  } = useGalleryHandlers({
    generate3DModel,
    handleViewModel,
    handleViewImage
  });

  if (!user) {
    return (
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
    );
  }

  return (
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
  );
};

export default Gallery;
