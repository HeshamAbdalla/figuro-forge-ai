
import React from "react";
import GalleryHeader from "@/components/gallery/GalleryHeader";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import CallToAction from "@/components/gallery/CallToAction";
import GalleryModals from "@/components/gallery/GalleryModals";
import PageTransition from "@/components/PageTransition";
import { Helmet } from "react-helmet-async";
import { BucketImage } from "@/components/gallery/types";

interface ConversionProgress {
  status: 'idle' | 'converting' | 'downloading' | 'completed' | 'error';
  progress: number;
  message: string;
  taskId?: string;
  modelUrl?: string;
  thumbnailUrl?: string;
}

interface GalleryContentProps {
  files: BucketImage[];
  isLoading: boolean;
  error: string | null;
  
  // Handler functions
  onDownload: (url: string, name: string) => void;
  onViewModel: (url: string, fileName: string) => void;
  onViewImage: (url: string, fileName: string) => void;
  onRefresh: () => void;

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
  onGenerate: (config: any) => Promise<void>;
  sourceImageUrl: string | null;

  // Auth prompt props
  authPromptOpen: boolean;
  onAuthPromptChange: (open: boolean) => void;
}

const GalleryContent: React.FC<GalleryContentProps> = ({
  files,
  isLoading,
  error,
  onDownload,
  onViewModel,
  onViewImage,
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
  return (
    <PageTransition>
      <Helmet>
        <title>Gallery - Figuro</title>
        <meta name="description" content="Browse and manage your 3D models and images in your personal Figuro gallery." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-figuro-dark via-figuro-dark to-figuro-accent/20 pt-24">
        <div className="container mx-auto px-4 py-8">
          <GalleryHeader onUploadClick={() => {}} />
          
          <GalleryGrid 
            images={files}
            isLoading={isLoading}
            onDownload={onDownload}
            onView={(url: string, fileName: string, fileType: 'image' | '3d-model') => {
              if (fileType === '3d-model') {
                onViewModel(url, fileName);
              } else {
                onViewImage(url, fileName);
              }
            }}
            onGenerate3D={() => {}}
          />
          
          <CallToAction onNavigateToStudio={() => {}} />
        </div>

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
      </div>
    </PageTransition>
  );
};

export default GalleryContent;
