
import React from "react";
import { motion } from "framer-motion";
import { BucketImage } from "./types";
import GalleryHeader from "./GalleryHeader";
import OptimizedGalleryGrid from "./performance/OptimizedGalleryGrid";
import GalleryModals from "./GalleryModals";
import { Generate3DConfig } from "./Generate3DConfigModal";

interface GalleryContentProps {
  files: BucketImage[];
  isLoading: boolean;
  error: Error | null;
  onViewModel: (url: string, fileName?: string) => void;
  onViewImage: (url: string, fileName?: string) => void;
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
  progress: { message: string; percentage: number } | null;
  onGeneration3DOpenChange: (open: boolean) => void;
  onResetProgress: () => void;
  onGenerate: (config: Generate3DConfig) => Promise<void>;
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
  // Handle view functionality - route to appropriate viewer
  const handleView = (url: string, fileName: string, fileType: 'image' | '3d-model') => {
    if (fileType === '3d-model') {
      onViewModel(url, fileName);
    } else {
      onViewImage(url, fileName);
    }
  };

  // Handle 3D generation for images
  const handleGenerate3D = (url: string, fileName: string) => {
    onViewImage(url, fileName); // This will trigger the 3D generation modal
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Failed to load gallery</h3>
        <p className="text-white/60 mb-6">{error.message}</p>
        <button
          onClick={onRefresh}
          className="px-6 py-2 bg-figuro-accent hover:bg-figuro-accent-hover text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <>
      <GalleryHeader onRefresh={onRefresh} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <OptimizedGalleryGrid
          images={files}
          isLoading={isLoading}
          onDownload={onDownload}
          onView={handleView}
          onGenerate3D={handleGenerate3D}
          showPerformanceMonitor={process.env.NODE_ENV === 'development'}
        />
      </motion.div>

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
        onGeneration3DOpenChange={onGeneration3DOpenChange}
        onResetProgress={onResetProgress}
        onGenerate={onGenerate}
        sourceImageUrl={sourceImageUrl}
        authPromptOpen={authPromptOpen}
        onAuthPromptChange={onAuthPromptChange}
      />
    </>
  );
};

export default GalleryContent;
