
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { SecurityEnforcedRoute } from "@/components/auth/SecurityEnforcedRoute";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { useGallery3DGeneration } from "@/components/gallery/useGallery3DGeneration";
import { useUpgradeNotifications } from "@/hooks/useUpgradeNotifications";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import StudioBreadcrumb from "@/components/studio/StudioBreadcrumb";
import EnhancedCameraWorkflow from "@/components/studio/camera/EnhancedCameraWorkflow";
import ModelViewer from "@/components/model-viewer";
import DebugUpgradeButtons from "@/components/upgrade/DebugUpgradeButtons";
import { Camera, Sparkles } from "lucide-react";

const CameraCapture = () => {
  const { user } = useEnhancedAuth();
  const { toast } = useToast();
  
  const { showUpgradeNotification } = useUpgradeNotifications();

  const {
    isGenerating,
    progress,
    generate3DModel,
  } = useGallery3DGeneration();

  const handleImageCapture = useCallback(async (imageBlob: Blob) => {
    try {
      console.log('📸 [CAMERA-CAPTURE] Starting 3D generation from camera image');
      
      // Convert blob to data URL for processing
      const reader = new FileReader();
      reader.onload = async () => {
        const imageDataUrl = reader.result as string;
        await generate3DModel(imageDataUrl, `camera-capture-${Date.now()}.jpg`);
      };
      reader.readAsDataURL(imageBlob);
    } catch (error: any) {
      console.log('❌ [CAMERA-CAPTURE] 3D generation failed:', error);
      
      if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
        console.log('🔔 [CAMERA-CAPTURE] Showing upgrade notification for model_conversion');
        showUpgradeNotification("model_conversion");
      } else {
        toast({
          title: "Camera Capture Failed",
          description: error.message || "Failed to generate 3D model from camera",
          variant: "destructive",
        });
      }
    }
  }, [generate3DModel, showUpgradeNotification, toast]);

  return (
    <SecurityEnforcedRoute requireVerification={true}>
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <StudioBreadcrumb 
              currentPage="Camera Capture"
              description="Capture photos directly and convert them to 3D models"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Left Panel - Camera Interface */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-figuro-light/5 rounded-2xl p-6 border border-white/10">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Camera className="w-6 h-6 text-figuro-accent" />
                    Camera Capture
                  </h2>
                  <EnhancedCameraWorkflow
                    onImageCapture={handleImageCapture}
                    isProcessing={isGenerating}
                    progress={{
                      status: progress.status || 'idle',
                      progress: progress.progress || 0,
                      percentage: progress.percentage || 0,
                      message: progress.message || 'Ready to capture',
                      taskId: progress.taskId,
                      thumbnailUrl: progress.thumbnailUrl,
                      modelUrl: progress.modelUrl
                    }}
                  />
                </div>

                {/* Progress Section */}
                {(isGenerating || progress.modelUrl) && (
                  <div className="bg-figuro-light/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-figuro-accent" />
                      Generation Progress
                    </h3>
                    <div className="space-y-3">
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-figuro-accent h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.progress || 0}%` }}
                        />
                      </div>
                      <p className="text-white/80 text-sm">{progress.message || 'Processing...'}</p>
                      <p className="text-figuro-accent text-sm">{progress.progress || 0}% complete</p>
                    </div>
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
                          <p>Generating 3D model from photo...</p>
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
                            <Camera className="w-8 h-8" />
                          </div>
                          <p>Capture a photo to create your 3D model</p>
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

        {/* Debug Buttons - Remove in production */}
        {process.env.NODE_ENV === 'development' && <DebugUpgradeButtons />}
      </div>
    </SecurityEnforcedRoute>
  );
};

export default CameraCapture;
