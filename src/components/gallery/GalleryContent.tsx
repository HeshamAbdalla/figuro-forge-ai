
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { BucketImage } from "./types";
import ThumbnailBasedGalleryGrid from "./components/ThumbnailBasedGalleryGrid";
import ModelViewerDialog from "./ModelViewerDialog";
import EnhancedImageViewerDialog from "./EnhancedImageViewerDialog";
import Generate3DModal from "./Generate3DModal";
import AuthPromptModal from "@/components/auth/AuthPromptModal";
import GalleryHeader from "./GalleryHeader";

interface GalleryContentProps {
  files: BucketImage[];
  isLoading: boolean;
  error: Error | null;
  onViewModel: (url: string, name: string) => void;
  onViewImage: (url: string, name: string) => void;
  onDownload: (url: string, name: string) => void;
  onRefresh: () => void;
  modelViewerOpen: boolean;
  setModelViewerOpen: (open: boolean) => void;
  viewingModel: string | null;
  viewingFileName: string | undefined;
  onCloseModelViewer: () => void;
  imageViewerOpen: boolean;
  setImageViewerOpen: (open: boolean) => void;
  viewingImage: string | null;
  viewingImageName: string | undefined;
  onCloseImageViewer: () => void;
  isGenerating: boolean;
  progress: any;
  onGeneration3DOpenChange: (open: boolean) => void;
  onResetProgress: () => void;
  onGenerate: (config: any) => void;
  sourceImageUrl: string | null;
  authPromptOpen: boolean;
  onAuthPromptChange: (open: boolean) => void;
}

const GalleryContent: React.FC<GalleryContentProps> = ({
  files,
  isLoading,
  error,
  onViewModel,
  onViewImage,
  onDownload,
  onRefresh,
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
  onGenerate,
  sourceImageUrl,
  authPromptOpen,
  onAuthPromptChange
}) => {
  const handleViewItem = (url: string, name: string, type: 'image' | '3d-model') => {
    if (type === '3d-model') {
      onViewModel(url, name);
    } else {
      onViewImage(url, name);
    }
  };

  const handleGenerate3D = (url: string, name: string) => {
    onViewImage(url, name); // This will set up the source image for 3D generation
    onGeneration3DOpenChange(true);
  };

  if (error) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold text-red-400 mb-4">
          Failed to load gallery
        </h3>
        <p className="text-white/60 mb-6">{error.message}</p>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <GalleryHeader />
      
      {/* Thumbnail-based gallery grid with performance optimizations */}
      <ThumbnailBasedGalleryGrid
        images={files}
        isLoading={isLoading}
        onDownload={onDownload}
        onView={handleViewItem}
        onGenerate3D={handleGenerate3D}
      />

      {/* Model Viewer Dialog - Only one can be open at a time */}
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
        imageName={viewingImageName}
        onClose={onCloseImageViewer}
      />

      {/* Generate 3D Modal */}
      <Generate3DModal
        open={!!sourceImageUrl && isGenerating}
        onOpenChange={onGeneration3DOpenChange}
        sourceImageUrl={sourceImageUrl}
        isGenerating={isGenerating}
        progress={progress}
        onResetProgress={onResetProgress}
        onGenerate={onGenerate}
      />

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        open={authPromptOpen}
        onOpenChange={onAuthPromptChange}
      />
    </div>
  );
};

export default GalleryContent;
