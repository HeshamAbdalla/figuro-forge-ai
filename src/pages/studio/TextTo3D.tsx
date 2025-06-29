
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SecurityEnforcedRoute } from "@/components/auth/SecurityEnforcedRoute";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { useTextTo3D } from "@/hooks/useTextTo3D";
import { useUpgradeNotifications } from "@/hooks/useUpgradeNotifications";
import { useToast } from "@/hooks/use-toast";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import Header from "@/components/Header";
import StudioBreadcrumb from "@/components/studio/StudioBreadcrumb";
import TextTo3DForm from "@/components/studio/TextTo3DForm";
import TextTo3DConfigModal from "@/components/studio/TextTo3DConfigModal";
import TextTo3DProgress from "@/components/studio/TextTo3DProgress";
import ModelViewer from "@/components/model-viewer";
import DebugUpgradeButtons from "@/components/upgrade/DebugUpgradeButtons";
import { Type, Sparkles } from "lucide-react";

const TextTo3D = () => {
  const { user } = useEnhancedAuth();
  const { toast } = useToast();
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configPrompt, setConfigPrompt] = useState("");
  const { isMobile, isTablet } = useResponsiveLayout();
  
  const { showUpgradeNotification } = useUpgradeNotifications();

  const {
    isGenerating,
    currentTaskId,
    progress,
    generateModel,
    generateModelWithConfig,
  } = useTextTo3D();

  const handleTextTo3D = useCallback(async (prompt: string, artStyle: string, negativePrompt: string = "") => {
    try {
      console.log('📝 [TEXT-TO-3D] Starting generation with:', { prompt, artStyle, negativePrompt });
      return await generateModel(prompt, artStyle, negativePrompt);
    } catch (error: any) {
      console.log('❌ [TEXT-TO-3D] Generation failed:', error);
      
      if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
        console.log('🔔 [TEXT-TO-3D] Showing upgrade notification for model_conversion');
        showUpgradeNotification("model_conversion");
      } else {
        toast({
          title: "Text-to-3D Failed",
          description: error.message || "Failed to generate 3D model from text",
          variant: "destructive",
        });
      }
      throw error;
    }
  }, [generateModel, showUpgradeNotification, toast]);

  const handleOpenConfigModal = useCallback((prompt: string) => {
    setConfigPrompt(prompt);
    setConfigModalOpen(true);
  }, []);

  const handleTextTo3DWithConfig = useCallback(async (config: any): Promise<void> => {
    try {
      console.log('⚙️ [TEXT-TO-3D] Starting generation with config:', config);
      setConfigModalOpen(false);
      await generateModelWithConfig(config);
    } catch (error: any) {
      console.log('❌ [TEXT-TO-3D] Config generation failed:', error);
      
      if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
        console.log('🔔 [TEXT-TO-3D] Showing upgrade notification for model_conversion');
        showUpgradeNotification("model_conversion");
      } else {
        toast({
          title: "Text-to-3D Failed",
          description: error.message || "Failed to generate 3D model",
          variant: "destructive",
        });
      }
      throw error;
    }
  }, [generateModelWithConfig, showUpgradeNotification, toast, setConfigModalOpen]);

  const handleModelError = useCallback((error: string) => {
    toast({
      title: "Model Loading Error",
      description: error,
      variant: "destructive",
    });
  }, [toast]);

  return (
    <SecurityEnforcedRoute requireVerification={true}>
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className="pt-20">
          <div className={`container mx-auto px-4 py-4 sm:py-8 ${isMobile ? 'max-w-full' : ''}`}>
            <StudioBreadcrumb 
              currentPage="Text to 3D"
              description="Create 3D models from text descriptions using AI"
            />

            <div className={`grid grid-cols-1 ${
              isMobile ? 'gap-6 mt-6' : isTablet ? 'gap-6 mt-8' : 'lg:grid-cols-2 gap-8 mt-8'
            }`}>
              {/* Left Panel - Text Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className={`space-y-4 sm:space-y-6 ${isMobile ? 'order-1' : ''}`}
              >
                <div className={`bg-figuro-light/5 rounded-2xl border border-white/10 ${
                  isMobile ? 'p-4' : 'p-4 sm:p-6'
                }`}>
                  <h2 className={`font-bold text-white mb-4 flex items-center gap-2 ${
                    isMobile ? 'text-lg' : 'text-xl sm:text-2xl'
                  }`}>
                    <Type className={`text-figuro-accent flex-shrink-0 ${
                      isMobile ? 'w-5 h-5' : 'w-5 h-5 sm:w-6 sm:h-6'
                    }`} />
                    <span className="truncate">Describe Your Model</span>
                  </h2>
                  <TextTo3DForm
                    onGenerate={handleTextTo3D}
                    onOpenConfigModal={handleOpenConfigModal}
                    isGenerating={isGenerating}
                  />
                </div>

                {/* Progress Section */}
                {(isGenerating || progress.modelUrl) && (
                  <div className={`bg-figuro-light/5 rounded-2xl border border-white/10 ${
                    isMobile ? 'p-4' : 'p-4 sm:p-6'
                  }`}>
                    <h3 className={`font-semibold text-white mb-4 flex items-center gap-2 ${
                      isMobile ? 'text-base' : 'text-lg sm:text-xl'
                    }`}>
                      <Sparkles className={`text-figuro-accent flex-shrink-0 ${
                        isMobile ? 'w-4 h-4' : 'w-4 h-4 sm:w-5 sm:h-5'
                      }`} />
                      <span className="truncate">Generation Progress</span>
                    </h3>
                    <TextTo3DProgress
                      taskId={currentTaskId}
                      status={progress.status}
                      progress={progress.progress}
                      modelUrl={progress.modelUrl}
                      localModelUrl={progress.localModelUrl}
                      thumbnailUrl={progress.thumbnailUrl}
                      downloadStatus={progress.downloadStatus}
                    />
                  </div>
                )}
              </motion.div>

              {/* Right Panel - 3D Model Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`space-y-4 sm:space-y-6 ${isMobile ? 'order-2' : ''}`}
              >
                <div className={`bg-figuro-light/5 rounded-2xl border border-white/10 ${
                  isMobile ? 'p-4' : 'p-4 sm:p-6'
                } ${
                  isMobile ? 'h-[350px]' : isTablet ? 'h-[450px]' : 'h-[600px]'
                }`}>
                  <h2 className={`font-bold text-white mb-4 truncate ${
                    isMobile ? 'text-lg' : 'text-xl sm:text-2xl'
                  }`}>
                    3D Model Preview
                  </h2>
                  
                  {progress.modelUrl ? (
                    <div className={`rounded-lg overflow-hidden ${
                      isMobile ? 'h-[280px]' : isTablet ? 'h-[380px]' : 'h-[500px]'
                    }`}>
                      <ModelViewer
                        modelUrl={progress.modelUrl}
                        isLoading={isGenerating}
                        errorMessage={null}
                        onCustomModelLoad={(url, file) => {}}
                      />
                    </div>
                  ) : (
                    <div className={`flex flex-col items-center justify-center text-white/50 border-2 border-dashed border-white/20 rounded-lg p-4 ${
                      isMobile ? 'h-[280px]' : isTablet ? 'h-[380px]' : 'h-[500px]'
                    }`}>
                      {isGenerating ? (
                        <div className="text-center max-w-sm">
                          <div className="animate-spin w-8 h-8 border-2 border-figuro-accent border-t-transparent rounded-full mx-auto mb-4"></div>
                          <p className={`break-words mb-2 ${isMobile ? 'text-sm' : ''}`}>
                            Generating 3D model from text...
                          </p>
                          <div className="w-full max-w-64 bg-white/10 rounded-full h-2 mt-4">
                            <div 
                              className="bg-figuro-accent h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress.progress || 0}%` }}
                            />
                          </div>
                          <p className={`mt-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            {progress.progress || 0}% complete
                          </p>
                        </div>
                      ) : (
                        <div className="text-center max-w-sm">
                          <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                            <Type className="w-8 h-8" />
                          </div>
                          <p className={`break-words mb-2 ${isMobile ? 'text-sm' : ''}`}>
                            Describe your 3D model in text
                          </p>
                          <p className={`break-words ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            Your generated model will appear here
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Config Modal */}
        <TextTo3DConfigModal
          open={configModalOpen}
          onOpenChange={setConfigModalOpen}
          onGenerate={handleTextTo3DWithConfig}
          isGenerating={isGenerating}
          initialPrompt={configPrompt}
        />

        {/* Debug Buttons - Remove in production */}
        {process.env.NODE_ENV === 'development' && <DebugUpgradeButtons />}
      </div>
    </SecurityEnforcedRoute>
  );
};

export default TextTo3D;
