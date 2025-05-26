
import React from "react";
import EnhancedModelViewerDialog from "@/components/gallery/EnhancedModelViewerDialog";
import EnhancedImageViewerDialog from "@/components/gallery/EnhancedImageViewerDialog";
import Generate3DModal from "@/components/gallery/Generate3DModal";
import AuthPromptModal from "@/components/auth/AuthPromptModal";

interface ConversionProgress {
  status: 'idle' | 'converting' | 'downloading' | 'completed' | 'error';
  progress: number;
  message: string;
  taskId?: string;
  modelUrl?: string;
  thumbnailUrl?: string;
}

interface GalleryModalsProps {
  // Model viewer props
  modelViewerOpen: boolean;
  setModelViewerOpen: (open: boolean) => void;
  viewingModel: string | null;
  viewingFileName: string | undefined;
  onCloseModelViewer: () => void;

  // Image viewer props
  imageViewerOpen: boolean;
  setImageViewerOpen: (open: boolean) => void;
  viewingImage: string | null;
  viewingImageName: string | undefined;
  onCloseImageViewer: () => void;

  // 3D generation props
  isGenerating: boolean;
  progress: ConversionProgress;
  onGeneration3DOpenChange: (open: boolean) => void;
  onResetProgress: () => void;

  // Auth prompt props
  authPromptOpen: boolean;
  onAuthPromptChange: (open: boolean) => void;
}

const GalleryModals: React.FC<GalleryModalsProps> = ({
  modelViewerOpen,
  setModelViewerOpen,
  viewingModel,
  viewingFileName,
  onCloseModelViewer,
  imageViewerOpen,
  setImageViewerOpen,
  viewingImage,
  viewingImageName,
  onCloseImageViewer,
  isGenerating,
  progress,
  onGeneration3DOpenChange,
  onResetProgress,
  authPromptOpen,
  onAuthPromptChange
}) => {
  return (
    <>
      {/* Enhanced 3D Model Viewer Dialog */}
      <EnhancedModelViewerDialog
        open={modelViewerOpen}
        onOpenChange={setModelViewerOpen}
        modelUrl={viewingModel}
        fileName={viewingFileName}
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

      {/* 3D Generation Modal */}
      <Generate3DModal 
        open={isGenerating}
        onOpenChange={onGeneration3DOpenChange}
        progress={progress.progress}
        onClose={onResetProgress}
      />

      {/* Auth Prompt Modal */}
      <AuthPromptModal 
        open={authPromptOpen} 
        onOpenChange={onAuthPromptChange}
      />
    </>
  );
};

export default GalleryModals;
