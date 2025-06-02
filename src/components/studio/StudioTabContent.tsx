import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FigurineGallery } from "@/components/figurine";
import ModelViewer from "@/components/ModelViewer";
import EnhancedPromptForm from "@/components/studio/EnhancedPromptForm";
import EnhancedImagePreview from "@/components/studio/EnhancedImagePreview";
import ImageTo3DProgress from "@/components/studio/ImageTo3DProgress";
import TextTo3DForm from "@/components/studio/TextTo3DForm";
import TextTo3DProgress from "@/components/studio/TextTo3DProgress";
import WebIconsForm from "@/components/studio/WebIconsForm";
import WebIconsPreview from "@/components/studio/WebIconsPreview";
import MiniGalleryCarousel from "@/components/studio/MiniGalleryCarousel";
import MobileCameraSection from "@/components/studio/camera/MobileCameraSection";
import EnhancedCameraWorkflow from "@/components/studio/camera/EnhancedCameraWorkflow";
import { useFigurines } from "@/components/figurine/useFigurines";
import { useWebIconsGeneration } from "@/hooks/useWebIconsGeneration";
import type { TabKey } from "@/hooks/useTabNavigation";

interface StudioTabContentProps {
  activeTab: TabKey;
  authUser: any;
  generatedImage: string | null;
  isGeneratingImage: boolean;
  isGenerating: boolean;
  isGeneratingTextTo3D: boolean;
  currentTaskId: string | null;
  textTo3DProgress: { status: string; progress: number; modelUrl: string; taskId?: string; thumbnailUrl?: string };
  displayModelUrl: string | null;
  shouldModelViewerLoad: boolean;
  progress: any;
  cameraProgress?: {
    status: string;
    progress: number;
    percentage: number;
    message: string;
    taskId?: string;
    thumbnailUrl?: string;
    modelUrl?: string;
  };
  onGenerate: (prompt: string, style: string) => Promise<void>;
  handleOpenConfigModal: () => void;
  handleQuickConvert: () => void;
  handleTextTo3D: (prompt: string, artStyle: string, negativePrompt: string) => Promise<void>;
  handleOpenTextTo3DConfigModal: (prompt: string) => void;
  handleSignIn: () => void;
  setCustomModelUrl: (url: string | null) => void;
  onCameraImageCapture?: (imageBlob: Blob) => void;
}

const StudioTabContent = ({
  activeTab,
  authUser,
  generatedImage,
  isGeneratingImage,
  isGenerating,
  isGeneratingTextTo3D,
  currentTaskId,
  textTo3DProgress,
  displayModelUrl,
  shouldModelViewerLoad,
  progress,
  cameraProgress,
  onGenerate,
  handleOpenConfigModal,
  handleQuickConvert,
  handleTextTo3D,
  handleOpenTextTo3DConfigModal,
  handleSignIn,
  setCustomModelUrl,
  onCameraImageCapture
}: StudioTabContentProps) => {
  const { figurines } = useFigurines();
  const { isGenerating: isGeneratingIcon, generatedIcon, generateIcon, clearIcon } = useWebIconsGeneration();

  const handleIconGeneration = async (prompt: string, options: { category: string; size: string; style: string }) => {
    await generateIcon(prompt, options);
  };

  const handleIconDownload = (format: string) => {
    if (!generatedIcon) return;
    
    const link = document.createElement('a');
    link.href = generatedIcon;
    link.download = `web-icon.${format}`;
    link.click();
  };

  const handleCameraCapture = async (imageBlob: Blob) => {
    if (onCameraImageCapture) {
      onCameraImageCapture(imageBlob);
    }
  };

  if (!authUser) {
    return (
      <motion.div 
        className="text-center py-16 glass-panel rounded-xl max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold text-gradient mb-3">Authentication Required</h2>
        <p className="text-white/70 mb-4 text-sm">Sign in to start creating figurines</p>
        <Button onClick={handleSignIn} className="bg-figuro-accent hover:bg-figuro-accent-hover">
          Sign In / Sign Up
        </Button>
      </motion.div>
    );
  }

  switch (activeTab) {
    case 'image-to-3d':
      return (
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-4 gap-4 max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <EnhancedPromptForm 
              onGenerate={onGenerate} 
              isGenerating={isGeneratingImage}
            />
            
            {/* Image-to-3D Progress Component */}
            <ImageTo3DProgress
              isGenerating={isGenerating}
              progress={progress}
              onViewModel={(url) => setCustomModelUrl(url)}
              onDownload={(url) => {
                const link = document.createElement('a');
                link.href = url;
                link.download = 'image-to-3d-model.glb';
                link.click();
              }}
            />
            
            <MiniGalleryCarousel 
              figurines={figurines.slice(0, 6)}
              onCreateNew={() => onGenerate("", "isometric")}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <EnhancedImagePreview 
              imageSrc={generatedImage} 
              isLoading={isGeneratingImage}
              onConvertTo3D={handleQuickConvert}
              isConverting={isGenerating}
              showMetadata={true}
              enableGestures={true}
              autoOptimize={true}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <ModelViewer 
              modelUrl={displayModelUrl} 
              isLoading={shouldModelViewerLoad && !displayModelUrl}
              errorMessage={progress.status === 'error' ? progress.message : undefined}
              onCustomModelLoad={(url) => setCustomModelUrl(url)}
            />
          </motion.div>
        </motion.div>
      );

    case 'camera':
      return (
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <EnhancedCameraWorkflow
            onImageCapture={handleCameraCapture}
            isProcessing={isGenerating}
            progress={cameraProgress || {
              status: progress.status || 'idle',
              progress: progress.progress || 0,
              percentage: progress.percentage || 0,
              message: progress.message || 'Ready to capture',
              taskId: progress.taskId,
              thumbnailUrl: progress.thumbnailUrl,
              modelUrl: progress.modelUrl || displayModelUrl
            }}
          />
        </motion.div>
      );

    case 'text-to-3d':
      return (
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <TextTo3DForm 
              onGenerate={handleTextTo3D}
              onOpenConfigModal={handleOpenTextTo3DConfigModal}
              isGenerating={isGeneratingTextTo3D}
            />
            {(currentTaskId || textTo3DProgress.status) && (
              <TextTo3DProgress
                taskId={currentTaskId || textTo3DProgress.taskId || null}
                status={textTo3DProgress.status}
                progress={textTo3DProgress.progress}
                modelUrl={textTo3DProgress.modelUrl}
                thumbnailUrl={textTo3DProgress.thumbnailUrl}
                onViewModel={() => {
                  // Model is already displayed in the ModelViewer component
                  console.log('Model already displayed in viewer');
                }}
                onDownload={() => {
                  if (textTo3DProgress.modelUrl) {
                    const link = document.createElement('a');
                    link.href = textTo3DProgress.modelUrl;
                    link.download = 'text-to-3d-model.glb';
                    link.click();
                  }
                }}
              />
            )}
            
            <MiniGalleryCarousel 
              figurines={figurines.slice(0, 6)}
              onCreateNew={() => handleTextTo3D("", "realistic", "")}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <ModelViewer 
              modelUrl={displayModelUrl} 
              isLoading={shouldModelViewerLoad && !displayModelUrl}
              errorMessage={textTo3DProgress.status === 'error' ? 'Failed to generate 3D model' : undefined}
              onCustomModelLoad={(url) => setCustomModelUrl(url)}
            />
          </motion.div>
        </motion.div>
      );

    case 'web-icons':
      return (
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <WebIconsForm 
              onGenerate={handleIconGeneration}
              isGenerating={isGeneratingIcon}
            />
            
            <MiniGalleryCarousel 
              figurines={figurines.slice(0, 6)}
              onCreateNew={() => onGenerate("", "isometric")}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <WebIconsPreview
              iconUrl={generatedIcon}
              isLoading={isGeneratingIcon}
              onClear={clearIcon}
              onDownload={handleIconDownload}
            />
          </motion.div>
        </motion.div>
      );

    case 'gallery':
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto h-[600px]"
        >
          <ScrollArea className="h-full">
            <div className="pr-4">
              <FigurineGallery />
            </div>
          </ScrollArea>
        </motion.div>
      );

    default:
      return null;
  }
};

export default StudioTabContent;
