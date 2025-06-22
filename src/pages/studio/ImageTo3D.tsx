
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SecurityEnforcedRoute } from "@/components/auth/SecurityEnforcedRoute";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { useImageGeneration } from "@/hooks/useImageGeneration";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { useEnhancedUpgradeModal } from "@/hooks/useEnhancedUpgradeModal";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import StudioBreadcrumb from "@/components/studio/StudioBreadcrumb";
import EnhancedPromptForm from "@/components/studio/EnhancedPromptForm";
import StreamlinedImagePreview from "@/components/studio/StreamlinedImagePreview";
import ImageTo3DConfigModal from "@/components/studio/ImageTo3DConfigModal";
import ModelViewer from "@/components/model-viewer";
import EnhancedUpgradeModal from "@/components/upgrade/EnhancedUpgradeModal";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wand2 } from "lucide-react";

const ImageTo3D = () => {
  const { user } = useEnhancedAuth();
  const { toast } = useToast();
  const [configModalOpen, setConfigModalOpen] = useState(false);
  
  const { 
    showUpgradeModal,
    isUpgradeModalOpen,
    upgradeModalAction,
    hideUpgradeModal
  } = useEnhancedUpgradeModal();

  const {
    isGeneratingImage,
    generatedImage,
    handleGenerate: originalHandleGenerate,
  } = useImageGeneration();

  const {
    isGenerating,
    progress,
    generate3DModel,
  } = useGallery3DGeneration();

  const handleGenerate = useCallback(async (prompt: string, style: string): Promise<void> => {
    try {
      await originalHandleGenerate(prompt, style);
    } catch (error: any) {
      if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
        showUpgradeModal("image_generation");
      } else {
        toast({
          title: "Generation Failed",
          description: error.message || "Failed to generate image",
          variant: "destructive",
        });
      }
    }
  }, [originalHandleGenerate, showUpgradeModal, toast]);

  const handleQuickConvert = useCallback(async () => {
    if (!generatedImage) {
      toast({
        title: "No Image",
        description: "Please generate an image first",
        variant: "destructive",
      });
      return;
    }

    try {
      await generate3DModel(generatedImage, `generated-${Date.now()}.jpg`);
    } catch (error: any) {
      if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
        showUpgradeModal("model_conversion");
      } else {
        toast({
          title: "Conversion Failed",
          description: error.message || "Failed to convert to 3D",
          variant: "destructive",
        });
      }
    }
  }, [generatedImage, generate3DModel, showUpgradeModal, toast]);

  const handleOpenConfigModal = useCallback(() => {
    if (!generatedImage) {
      toast({
        title: "No Image",
        description: "Please generate an image first",
        variant: "destructive",
      });
      return;
    }
    setConfigModalOpen(true);
  }, [generatedImage, toast]);

  const handleGenerate3DWithConfig = useCallback(async (config: any) => {
    if (!generatedImage) return;

    try {
      setConfigModalOpen(false);
      await generate3DModel(generatedImage, `generated-${Date.now()}.jpg`, config);
    } catch (error: any) {
      if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
        showUpgradeModal("model_conversion");
      } else {
        toast({
          title: "3D Generation Failed",
          description: error.message || "Failed to generate 3D model",
          variant: "destructive",
        });
      }
    }
  }, [generatedImage, generate3DModel, showUpgradeModal, toast, setConfigModalOpen]);

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
              currentPage="Image to 3D"
              description="Transform your images into stunning 3D models"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Left Panel - Image Generation */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-figuro-light/5 rounded-2xl p-6 border border-white/10">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Wand2 className="w-6 h-6 text-figuro-accent" />
                    Generate Image
                  </h2>
                  <EnhancedPromptForm
                    onGenerate={handleGenerate}
                    isGenerating={isGeneratingImage}
                  />
                </div>

                {generatedImage && (
                  <div className="bg-figuro-light/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4">Generated Image</h3>
                    <StreamlinedImagePreview
                      imageSrc={generatedImage}
                      isLoading={isGeneratingImage}
                      onConvertTo3D={handleQuickConvert}
                      onOpenConfig={handleOpenConfigModal}
                      isConverting={isGenerating}
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
                          <p>Converting image to 3D model...</p>
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
                            <ArrowRight className="w-8 h-8" />
                          </div>
                          <p>Generate an image and convert it to 3D</p>
                          <p className="text-sm mt-2">Your 3D model will appear here</p>
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
        <ImageTo3DConfigModal
          open={configModalOpen}
          onOpenChange={setConfigModalOpen}
          onGenerate={handleGenerate3DWithConfig}
          isGenerating={isGenerating}
          imageUrl={generatedImage}
        />

        {/* Enhanced Upgrade Modal - Simplified conditional rendering */}
        {isUpgradeModalOpen && upgradeModalAction && (
          <EnhancedUpgradeModal
            isOpen={isUpgradeModalOpen}
            onOpenChange={(open) => {
              if (!open) hideUpgradeModal();
            }}
            actionType={upgradeModalAction}
            title="Upgrade Required"
            description="You've reached your usage limit. Upgrade to continue creating amazing content."
          />
        )}
      </div>
    </SecurityEnforcedRoute>
  );
};

export default ImageTo3D;
