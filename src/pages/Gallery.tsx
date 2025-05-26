
import React from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthPromptModal } from "@/components/auth/AuthPromptModal";
import GalleryHeader from "@/components/gallery/GalleryHeader";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import CallToAction from "@/components/gallery/CallToAction";
import Generate3DModal from "@/components/gallery/Generate3DModal";
import Generate3DConfigModal from "@/components/gallery/Generate3DConfigModal";
import EnhancedModelViewerDialog from "@/components/gallery/EnhancedModelViewerDialog";
import { useGalleryFiles } from "@/components/gallery/useGalleryFiles";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { useModelViewer } from "@/components/gallery/useModelViewer";
import PageTransition from "@/components/PageTransition";
import { Helmet } from "react-helmet-async";

const Gallery = () => {
  const { user } = useAuth();
  const {
    files,
    isLoading,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    handleDownload,
    refreshFiles
  } = useGalleryFiles();

  const {
    generate3DOpen,
    setGenerate3DOpen,
    configModalOpen,
    setConfigModalOpen,
    selectedImageUrl,
    selectedImageName,
    handleGenerate3DClick,
    handleGenerate3D,
    cancelGeneration
  } = useGallery3DGeneration(refreshFiles);

  const {
    viewingModel,
    viewingFileName,
    modelViewerOpen,
    setModelViewerOpen,
    handleViewModel,
    handleCloseModelViewer
  } = useModelViewer();

  if (!user) {
    return <AuthPromptModal />;
  }

  return (
    <PageTransition>
      <Helmet>
        <title>Gallery - Figuro</title>
        <meta name="description" content="Browse and manage your 3D models and images in your personal Figuro gallery." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-figuro-dark via-figuro-dark to-figuro-accent/20">
        <div className="container mx-auto px-4 py-8">
          <GalleryHeader 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterType={filterType}
            onFilterChange={setFilterType}
          />
          
          <GalleryGrid 
            files={files}
            isLoading={isLoading}
            onDownload={handleDownload}
            onViewModel={handleViewModel}
            onGenerate3D={handleGenerate3DClick}
          />
          
          <CallToAction />
        </div>

        {/* Enhanced 3D Model Viewer Dialog */}
        <EnhancedModelViewerDialog
          open={modelViewerOpen}
          onOpenChange={setModelViewerOpen}
          modelUrl={viewingModel}
          fileName={viewingFileName}
          onClose={handleCloseModelViewer}
        />

        {/* 3D Generation Modals */}
        <Generate3DConfigModal
          open={configModalOpen}
          onOpenChange={setConfigModalOpen}
          imageUrl={selectedImageUrl}
          imageName={selectedImageName}
          onGenerate={handleGenerate3D}
        />

        <Generate3DModal 
          open={generate3DOpen}
          onOpenChange={setGenerate3DOpen}
          onCancel={cancelGeneration}
        />
      </div>
    </PageTransition>
  );
};

export default Gallery;
