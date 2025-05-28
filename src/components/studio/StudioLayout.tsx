
import { motion } from "framer-motion";
import CompactStudioHeader from "./CompactStudioHeader";
import StudioProgressHeader from "./StudioProgressHeader";
import StudioTabContent from "./StudioTabContent";
import StudioConfigPanel from "./StudioConfigPanel";
import TextTo3DConfigModal from "./TextTo3DConfigModal";
import Generate3DModal from "@/components/gallery/Generate3DModal";
import UploadModelModal from "@/components/UploadModelModal";
import type { TabKey } from "@/hooks/useTabNavigation";

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
  textTo3DProgress: { status: string; progress: number; modelUrl: string; taskId?: string; thumbnailUrl?: string };
  displayModelUrl: string | null;
  shouldModelViewerLoad: boolean;
  uploadModalOpen: boolean;
  setUploadModalOpen: (open: boolean) => void;
  configModalOpen: boolean;
  setConfigModalOpen: (open: boolean) => void;
  textTo3DConfigModalOpen: boolean;
  setTextTo3DConfigModalOpen: (open: boolean) => void;
  textTo3DConfigPrompt: string;
  generationModalOpen: boolean;
  setGenerationModalOpen: (open: boolean) => void;
  onGenerate: (prompt: string, style: string) => Promise<void>;
  handleOpenConfigModal: () => void;
  handleGenerate3DWithConfig: (config: any) => Promise<void>;
  handleTextTo3D: (prompt: string, artStyle: string, negativePrompt: string) => Promise<void>;
  handleOpenTextTo3DConfigModal: (prompt: string) => void;
  handleTextTo3DWithConfig: (config: any) => Promise<void>;
  handleModelUpload: (figurineId: string, file: File) => Promise<void>;
  handleSignOut: () => void;
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
  textTo3DConfigModalOpen,
  setTextTo3DConfigModalOpen,
  textTo3DConfigPrompt,
  generationModalOpen,
  setGenerationModalOpen,
  onGenerate,
  handleOpenConfigModal,
  handleGenerate3DWithConfig,
  handleTextTo3D,
  handleOpenTextTo3DConfigModal,
  handleTextTo3DWithConfig,
  handleModelUpload,
  handleSignOut,
  handleSignIn,
  handleCloseGenerationModal,
  setCustomModelUrl
}: StudioLayoutProps) => {
  return (
    <div className="min-h-screen bg-figuro-dark relative overflow-x-hidden">
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CompactStudioHeader 
            authUser={authUser}
            onSignOut={handleSignOut}
            onSignIn={handleSignIn}
          />
          
          <StudioProgressHeader
            activeTab={activeTab}
            onTabChange={setActiveTab}
            hasGeneratedImage={!!generatedImage}
            hasModelUrl={!!displayModelUrl}
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
            handleOpenTextTo3DConfigModal={handleOpenTextTo3DConfigModal}
            handleSignIn={handleSignIn}
            setCustomModelUrl={setCustomModelUrl}
          />
          
          {/* Modals */}
          <Generate3DModal
            open={configModalOpen}
            onOpenChange={setConfigModalOpen}
            onGenerate={handleGenerate3DWithConfig}
            isGenerating={isGenerating}
            imageUrl={generatedImage}
          />
          
          <TextTo3DConfigModal
            open={textTo3DConfigModalOpen}
            onOpenChange={setTextTo3DConfigModalOpen}
            onGenerate={handleTextTo3DWithConfig}
            isGenerating={isGeneratingTextTo3D}
            initialPrompt={textTo3DConfigPrompt}
          />
          
          <UploadModelModal
            open={uploadModalOpen}
            onOpenChange={setUploadModalOpen}
            onUpload={handleModelUpload}
            figurineId=""
          />
        </motion.div>
      </div>
    </div>
  );
};

export default StudioLayout;
