
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { SecurityEnforcedRoute } from "@/components/auth/SecurityEnforcedRoute";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { useTextTo3D } from "@/hooks/useTextTo3D";
import { useEnhancedUpgradeModal } from "@/hooks/useEnhancedUpgradeModal";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import StudioBreadcrumb from "@/components/studio/StudioBreadcrumb";
import TextTo3DForm from "@/components/studio/TextTo3DForm";
import TextTo3DConfigModal from "@/components/studio/TextTo3DConfigModal";
import TextTo3DProgress from "@/components/studio/TextTo3DProgress";
import ModelViewer from "@/components/model-viewer";
import { Type, Sparkles } from "lucide-react";

const TextTo3D = () => {
  const { user } = useEnhancedAuth();
  const { toast } = useToast();
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configPrompt, setConfigPrompt] = useState("");
  
  const { showUpgradeModal } = useEnhancedUpgradeModal();

  const {
    isGenerating,
    currentTaskId,
    progress,
    generateModel,
    generateModelWithConfig,
  } = useTextTo3D();

  const handleTextTo3D = useCallback(async (prompt: string, artStyle: string, negativePrompt: string = "") => {
    try {
      return await generateModel(prompt, artStyle, negativePrompt);
    } catch (error: any) {
      if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
        showUpgradeModal("model_conversion");
      } else {
        toast({
          title: "Text-to-3D Failed",
          description: error.message || "Failed to generate 3D model from text",
          variant: "destructive",
        });
      }
      throw error;
    }
  }, [generateModel, showUpgradeModal, toast]);

  const handleOpenConfigModal = useCallback((prompt: string) => {
    setConfigPrompt(prompt);
    setConfigModalOpen(true);
  }, []);

  const handleTextTo3DWithConfig = useCallback(async (config: any): Promise<void> => {
    try {
      setConfigModalOpen(false);
      await generateModelWithConfig(config);
    } catch (error: any) {
      if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
        showUpgradeModal("model_conversion");
      } else {
        toast({
          title: "Text-to-3D Failed",
          description: error.message || "Failed to generate 3D model",
          variant: "destructive",
        });
      }
      throw error;
    }
  }, [generateModelWithConfig, showUpgradeModal, toast, setConfigModalOpen]);

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
          <div className="container mx-auto px-4 py-8">
            <StudioBreadcrumb 
              currentPage="Text to 3D"
              description="Create 3D models from text descriptions using AI"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Left Panel - Text Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-figuro-light/5 rounded-2xl p-6 border border-white/10">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Type className="w-6 h-6 text-figuro-accent" />
                    Describe Your Model
                  </h2>
                  <TextTo3DForm
                    onGenerate={handleTextTo3D}
                    onOpenConfigModal={handleOpenConfigModal}
                    isGenerating={isGenerating}
                  />
                </div>

                {/* Progress Section */}
                {(isGenerating || progress.modelUrl) && (
                  <div className="bg-figuro-light/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-figuro-accent" />
                      Generation Progress
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
                className="space-y-6"
              >
                <div className="bg-figuro-light/5 rounded-2xl p-6 border border-white/10 h-[600px]">
                  <h2 className="text-2xl font-bold text-white mb-4">3D Model Preview</h2>
                  
                  {progress.modelUrl ? (
                    <div className="h-[500px] rounded-lg overflow-hidden">
                      <ModelViewer
                        modelUrl={progress.modelUrl}
                        isLoading={isGenerating}
                        errorMessage={null}
                        onCustomModelLoad={(url, file) => {}}
                      />
                    </div>
                  ) : (
                    <div className="h-[500px] flex flex-col items-center justify-center text-white/50 border-2 border-dashed border-white/20 rounded-lg">
                      {isGenerating ? (
                        <div className="text-center">
                          <div className="animate-spin w-8 h-8 border-2 border-figuro-accent border-t-transparent rounded-full mx-auto mb-4"></div>
                          <p>Generating 3D model from text...</p>
                          <div className="w-64 bg-white/10 rounded-full h-2 mt-4">
                            <div 
                              className="bg-figuro-accent h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress.progress || 0}%` }}
                            />
                          </div>
                          <p className="text-sm mt-2">{progress.progress || 0}% complete</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                            <Type className="w-8 h-8" />
                          </div>
                          <p>Describe your 3D model in text</p>
                          <p className="text-sm mt-2">Your generated model will appear here</p>
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
      </div>
    </SecurityEnforcedRoute>
  );
};

export default TextTo3D;
