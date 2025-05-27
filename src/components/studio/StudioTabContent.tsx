
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FigurineGallery } from "@/components/figurine";
import ModelViewer from "@/components/ModelViewer";
import EnhancedPromptForm from "@/components/studio/EnhancedPromptForm";
import StreamlinedImagePreview from "@/components/studio/StreamlinedImagePreview";
import TextTo3DForm from "@/components/studio/TextTo3DForm";
import TextTo3DProgress from "@/components/studio/TextTo3DProgress";
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
  onGenerate: (prompt: string, style: string) => Promise<void>;
  handleOpenConfigModal: () => void;
  handleTextTo3D: (prompt: string, artStyle: string, negativePrompt: string) => Promise<void>;
  handleSignIn: () => void;
  setCustomModelUrl: (url: string | null) => void;
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
  onGenerate,
  handleOpenConfigModal,
  handleTextTo3D,
  handleSignIn,
  setCustomModelUrl
}: StudioTabContentProps) => {
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
            <EnhancedPromptForm 
              onGenerate={onGenerate} 
              isGenerating={isGeneratingImage}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StreamlinedImagePreview 
              imageSrc={generatedImage} 
              isLoading={isGeneratingImage}
              onConvertTo3D={handleOpenConfigModal}
              isConverting={isGenerating}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
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

    case 'text-to-3d':
      return (
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl mx-auto"
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
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
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

    case 'gallery':
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <FigurineGallery />
        </motion.div>
      );

    default:
      return null;
  }
};

export default StudioTabContent;
