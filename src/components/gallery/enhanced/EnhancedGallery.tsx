
import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { useFigurines } from "@/components/figurine/useFigurines";
import { useSecureDownload } from "@/hooks/useSecureDownload";
import { useToast } from "@/hooks/use-toast";
import { useModelViewer } from "@/components/gallery/useModelViewer";
import { useImageViewer } from "@/components/gallery/useImageViewer";
import { Figurine } from "@/types/figurine";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import ModelPreviewGrid from "./ModelPreviewGrid";
import GalleryModals from "../GalleryModals";
import EnhancedGalleryHeader from "./EnhancedGalleryHeader";
import GalleryViewToggle from "./GalleryViewToggle";
import EnhancedGalleryActions from "./EnhancedGalleryActions";

const EnhancedGallery: React.FC = () => {
  const { user } = useEnhancedAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState({
    status: 'idle' as const,
    progress: 0,
    message: '',
    taskId: undefined,
    modelUrl: undefined,
    thumbnailUrl: undefined
  });
  const { toast } = useToast();

  // Fetch figurines with enhanced error handling
  const { figurines, loading, error, refreshFigurines } = useFigurines();

  // Model viewer functionality
  const { 
    viewingModel, 
    viewingFileName,
    modelViewerOpen, 
    setModelViewerOpen, 
    onViewModel, 
    onCloseModelViewer 
  } = useModelViewer();

  // Image viewer functionality
  const {
    viewingImage,
    viewingImageName,
    imageViewerOpen,
    setImageViewerOpen,
    onViewImage,
    onCloseImageViewer
  } = useImageViewer();

  // Secure download functionality
  const { secureDownload, isDownloading } = useSecureDownload();

  // Enhanced refresh that also logs current state
  const handleRefresh = useCallback(() => {
    console.log('🔄 [ENHANCED-GALLERY] Manual refresh triggered');
    console.log('📊 [ENHANCED-GALLERY] Current figurines count:', figurines.length);
    console.log('📊 [ENHANCED-GALLERY] Figurines with models:', figurines.filter(f => f.model_url).length);
    
    refreshFigurines();
    
    toast({
      title: "Gallery Refreshed",
      description: "Checking for any new or updated models...",
    });
  }, [figurines.length, refreshFigurines, toast]);

  const handleDownload = useCallback(async (figurine: Figurine) => {
    if (!figurine.model_url) {
      toast({
        title: "No 3D Model",
        description: "This figurine doesn't have a 3D model to download.",
        variant: "destructive"
      });
      return;
    }

    console.log('📥 [ENHANCED-GALLERY] Downloading model:', figurine.id, figurine.model_url);
    
    try {
      await secureDownload(
        figurine.model_url, 
        `${figurine.title || 'figurine'}.glb`
      );
    } catch (error) {
      console.error('❌ [ENHANCED-GALLERY] Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Could not download the 3D model. Please try again.",
        variant: "destructive"
      });
    }
  }, [secureDownload, toast]);

  const handleViewModel = useCallback((figurine: Figurine) => {
    if (!figurine.model_url) {
      toast({
        title: "No 3D Model",
        description: "This figurine doesn't have a 3D model to view.",
        variant: "destructive"
      });
      return;
    }

    console.log('👁️ [ENHANCED-GALLERY] Viewing model:', figurine.id, figurine.model_url);
    onViewModel(figurine.model_url, figurine.title || "3D Model");
  }, [onViewModel, toast]);

  const handleTogglePublish = useCallback(async (figurine: Figurine) => {
    // Implementation for toggling public status
    console.log('🔄 [ENHANCED-GALLERY] Toggle publish for:', figurine.id);
    toast({
      title: "Feature Coming Soon",
      description: "Publishing toggle will be available soon.",
    });
  }, [toast]);

  const handleUploadModel = useCallback(async (figurine: Figurine) => {
    try {
      console.log('📁 [ENHANCED-GALLERY] Uploading model for:', figurine.id);
      
      const file = await new Promise<File>((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.glb,.gltf';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) resolve(file);
          else reject(new Error('No file selected'));
        };
        input.click();
      });

      toast({
        title: "Upload Complete",
        description: "Your 3D model has been uploaded successfully.",
      });

      // Refresh gallery to show updated model
      refreshFigurines();
      
    } catch (error) {
      console.error('❌ [ENHANCED-GALLERY] Upload failed:', error);
      
      if (error instanceof Error && error.message !== 'No file selected') {
        toast({
          title: "Upload Failed",
          description: "Could not upload the 3D model. Please try again.",
          variant: "destructive"
        });
      }
    }
  }, [refreshFigurines, toast]);

  const handleGenerate = useCallback(async (config: any) => {
    console.log('🎨 [ENHANCED-GALLERY] Generate 3D with config:', config);
    toast({
      title: "Feature Coming Soon",
      description: "3D generation will be available soon.",
    });
  }, [toast]);

  const handleResetProgress = useCallback(() => {
    setProgress({
      status: 'idle',
      progress: 0,
      message: '',
      taskId: undefined,
      modelUrl: undefined,
      thumbnailUrl: undefined
    });
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-figuro-bg via-figuro-bg to-figuro-accent/10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-white/70">Please sign in to view your gallery.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-figuro-bg via-figuro-bg to-figuro-accent/10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Gallery Error</h2>
          <p className="text-white/70 mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-figuro-accent text-white rounded-lg hover:bg-figuro-accent-hover transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-figuro-bg via-figuro-bg to-figuro-accent/10">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-figuro-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-8"
        >
          {/* Header */}
          <div className="mb-8">
            <EnhancedGalleryHeader 
              totalFiles={figurines.length}
              onRefresh={handleRefresh}
            />
          </div>

          {/* Controls Section */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <GalleryViewToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            
            <EnhancedGalleryActions
              onRefresh={handleRefresh}
              isLoading={loading}
            />
          </div>

          {/* Gallery Grid */}
          <ModelPreviewGrid
            figurines={figurines}
            loading={loading}
            onDownload={handleDownload}
            onViewModel={handleViewModel}
            onTogglePublish={handleTogglePublish}
            onUploadModel={handleUploadModel}
            onRefresh={handleRefresh}
            viewMode={viewMode}
          />
        </motion.div>

        {/* Modals */}
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
          onGeneration3DOpenChange={setIsGenerating}
          onResetProgress={handleResetProgress}
          onGenerate={handleGenerate}
          sourceImageUrl={sourceImageUrl}
          authPromptOpen={authPromptOpen}
          onAuthPromptChange={setAuthPromptOpen}
        />
      </div>
    </div>
  );
};

export default EnhancedGallery;
