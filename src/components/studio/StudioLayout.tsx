
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UploadModelModal from "@/components/UploadModelModal";
import VantaBackground from "@/components/VantaBackground";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import CompactStudioHeader from "@/components/studio/CompactStudioHeader";
import StudioConfigPanel from "@/components/studio/StudioConfigPanel";
import EnhancedStudioTabs from "@/components/studio/EnhancedStudioTabs";
import Generate3DConfigModal from "@/components/gallery/Generate3DConfigModal";
import Generate3DModal from "@/components/gallery/Generate3DModal";
import StudioTabContent from "@/components/studio/StudioTabContent";
import type { TabKey } from "@/hooks/useTabNavigation";
import type { Generate3DConfig } from "@/components/gallery/types/conversion";

interface StudioLayoutProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  authUser: any;
  generatedImage: string | null;
  isGeneratingImage: boolean;
  isGenerating: boolean;
  isGeneratingTextTo3D: boolean;
  currentTaskId: string | null;
  progress: any;
  textTo3DProgress: { status: string; progress: number; modelUrl: string };
  displayModelUrl: string | null;
  shouldModelViewerLoad: boolean;
  uploadModalOpen: boolean;
  setUploadModalOpen: (open: boolean) => void;
  configModalOpen: boolean;
  setConfigModalOpen: (open: boolean) => void;
  generationModalOpen: boolean;
  setGenerationModalOpen: (open: boolean) => void;
  onGenerate: (prompt: string, style: string) => Promise<void>;
  handleOpenConfigModal: () => void;
  handleGenerate3DWithConfig: (config: Generate3DConfig) => Promise<void>;
  handleTextTo3D: (prompt: string, artStyle: string, negativePrompt: string) => Promise<void>;
  handleModelUpload: (url: string, file: File) => void;
  handleSignOut: () => Promise<void>;
  handleSignIn: () => void;
  handleCloseGenerationModal: () => void;
  setCustomModelUrl: (url: string | null) => void;
}

const StudioLayout = ({
  activeTab,
  setActiveTab,
  authUser,
  generatedImage,
  isGeneratingImage,
  isGenerating,
  isGeneratingTextTo3D,
  currentTaskId,
  progress,
  textTo3DProgress,
  displayModelUrl,
  shouldModelViewerLoad,
  uploadModalOpen,
  setUploadModalOpen,
  configModalOpen,
  setConfigModalOpen,
  generationModalOpen,
  setGenerationModalOpen,
  onGenerate,
  handleOpenConfigModal,
  handleGenerate3DWithConfig,
  handleTextTo3D,
  handleModelUpload,
  handleSignOut,
  handleSignIn,
  handleCloseGenerationModal,
  setCustomModelUrl
}: StudioLayoutProps) => {
  // Watch for generation modal state changes
  useEffect(() => {
    const shouldShowGenerationModal = isGenerating || progress.status === 'converting' || progress.status === 'downloading';
    setGenerationModalOpen(shouldShowGenerationModal);
  }, [isGenerating, progress.status, setGenerationModalOpen]);

  return (
    <div className="min-h-screen bg-figuro-dark overflow-hidden relative flex flex-col">
      <VantaBackground>
        <Header />
        
        <ScrollArea className="flex-1 pt-20">
          <section className="pb-12">
            <div className="container mx-auto px-4 max-w-7xl">
              <CompactStudioHeader />
              
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <StudioConfigPanel
                  onUploadModel={() => setUploadModalOpen(true)}
                  user={authUser}
                  onSignIn={handleSignIn}
                  onSignOut={handleSignOut}
                />
              </motion.div>
              
              <EnhancedStudioTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
              
              <StudioTabContent
                activeTab={activeTab}
                authUser={authUser}
                generatedImage={generatedImage}
                isGeneratingImage={isGeneratingImage}
                isGenerating={isGenerating}
                isGeneratingTextTo3D={isGeneratingTextTo3D}
                currentTaskId={currentTaskId}
                textTo3DProgress={textTo3DProgress}
                displayModelUrl={displayModelUrl}
                shouldModelViewerLoad={shouldModelViewerLoad}
                progress={progress}
                onGenerate={onGenerate}
                handleOpenConfigModal={handleOpenConfigModal}
                handleTextTo3D={handleTextTo3D}
                handleSignIn={handleSignIn}
                setCustomModelUrl={setCustomModelUrl}
              />
            </div>
          </section>
          
          <Footer />
        </ScrollArea>
      </VantaBackground>

      {/* Upload Model Modal */}
      <UploadModelModal 
        isOpen={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onModelUpload={handleModelUpload}
      />

      {/* 3D Configuration Modal */}
      <Generate3DConfigModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        onGenerate={handleGenerate3DWithConfig}
        imageUrl={generatedImage || ""}
        imageName="Studio Generated Image"
      />

      {/* 3D Generation Progress Modal */}
      <Generate3DModal
        open={generationModalOpen}
        onOpenChange={setGenerationModalOpen}
        progress={progress}
        onClose={handleCloseGenerationModal}
      />
    </div>
  );
};

export default StudioLayout;
