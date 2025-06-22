
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { SecurityEnforcedRoute } from "@/components/auth/SecurityEnforcedRoute";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { useWebIconsGeneration } from "@/hooks/useWebIconsGeneration";
import { useUpgradeNotifications } from "@/hooks/useUpgradeNotifications";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import StudioBreadcrumb from "@/components/studio/StudioBreadcrumb";
import WebIconsForm from "@/components/studio/WebIconsForm";
import WebIconsPreview from "@/components/studio/WebIconsPreview";
import DebugUpgradeButtons from "@/components/upgrade/DebugUpgradeButtons";
import { Palette, Sparkles } from "lucide-react";

const WebIcons = () => {
  const { user } = useEnhancedAuth();
  const { toast } = useToast();
  
  const { showUpgradeNotification } = useUpgradeNotifications();

  const {
    isGenerating,
    generatedIcon,
    generateIcon,
    clearIcon
  } = useWebIconsGeneration();

  const handleIconGeneration = useCallback(async (prompt: string, options: { category: string; size: string; style: string }) => {
    try {
      console.log('🎨 [WEB-ICONS] Starting icon generation with:', { prompt, options });
      await generateIcon(prompt, options);
    } catch (error: any) {
      console.log('❌ [WEB-ICONS] Icon generation failed:', error);
      
      if (error?.message?.includes('limit') || error?.message?.includes('quota')) {
        console.log('🔔 [WEB-ICONS] Showing upgrade notification for image_generation');
        showUpgradeNotification("image_generation");
      } else {
        toast({
          title: "Icon Generation Failed",
          description: error.message || "Failed to generate web icon",
          variant: "destructive",
        });
      }
    }
  }, [generateIcon, showUpgradeNotification, toast]);

  const handleIconDownload = useCallback((format: string) => {
    if (!generatedIcon) return;
    
    const link = document.createElement('a');
    link.href = generatedIcon;
    link.download = `web-icon.${format}`;
    link.click();
  }, [generatedIcon]);

  return (
    <SecurityEnforcedRoute requireVerification={true}>
      <div className="min-h-screen bg-figuro-dark">
        <Header />
        <div className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <StudioBreadcrumb 
              currentPage="Web Icons"
              description="Generate custom icons for your web projects"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Left Panel - Icon Generation */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-figuro-light/5 rounded-2xl p-6 border border-white/10">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Palette className="w-6 h-6 text-figuro-accent" />
                    Generate Icon
                  </h2>
                  <WebIconsForm
                    onGenerate={handleIconGeneration}
                    isGenerating={isGenerating}
                  />
                </div>

                {/* Generation Progress */}
                {isGenerating && (
                  <div className="bg-figuro-light/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-figuro-accent" />
                      Generation Progress
                    </h3>
                    <div className="space-y-3">
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-figuro-accent h-2 rounded-full animate-pulse" />
                      </div>
                      <p className="text-white/80 text-sm">Creating your custom icon...</p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Right Panel - Icon Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-figuro-light/5 rounded-2xl p-6 border border-white/10 h-[600px]">
                  <h2 className="text-2xl font-bold text-white mb-4">Icon Preview</h2>
                  
                  <WebIconsPreview
                    iconUrl={generatedIcon}
                    isLoading={isGenerating}
                    onClear={clearIcon}
                    onDownload={handleIconDownload}
                  />
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

export default WebIcons;
