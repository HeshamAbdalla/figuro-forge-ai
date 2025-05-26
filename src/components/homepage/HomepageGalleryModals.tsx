
import React from "react";
import ModelViewerDialog from "@/components/gallery/ModelViewerDialog";
import EnhancedImageViewerDialog from "@/components/gallery/EnhancedImageViewerDialog";
import AuthPromptModal from "@/components/auth/AuthPromptModal";

interface HomepageGalleryModalsProps {
  // Model viewer props
  modelViewerOpen: boolean;
  setModelViewerOpen: (open: boolean) => void;
  viewingModel: string | null;
  onCloseModelViewer: () => void;

  // Image viewer props
  imageViewerOpen: boolean;
  setImageViewerOpen: (open: boolean) => void;
  viewingImage: string | null;
  viewingImageName: string | undefined;
  onCloseImageViewer: () => void;

  // Auth prompt props
  authPromptOpen: boolean;
  setAuthPromptOpen: (open: boolean) => void;
}

const HomepageGalleryModals: React.FC<HomepageGalleryModalsProps> = ({
  modelViewerOpen,
  setModelViewerOpen,
  viewingModel,
  onCloseModelViewer,
  imageViewerOpen,
  setImageViewerOpen,
  viewingImage,
  viewingImageName,
  onCloseImageViewer,
  authPromptOpen,
  setAuthPromptOpen
}) => {
  return (
    <>
      {/* Model Viewer Dialog for 3D models */}
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

      {/* Authentication Prompt Modal */}
      <AuthPromptModal
        open={authPromptOpen}
        onOpenChange={setAuthPromptOpen}
      />
    </>
  );
};

export default HomepageGalleryModals;
