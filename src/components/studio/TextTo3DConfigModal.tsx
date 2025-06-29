
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sparkles, Settings, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { TextTo3DConfig } from "./types/textTo3DConfig";
import { artStyles, modelModes, topologyTypes } from "./types/textTo3DConfig";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

interface TextTo3DConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (config: TextTo3DConfig) => Promise<void>;
  isGenerating: boolean;
  initialPrompt?: string;
}

const TextTo3DConfigModal = ({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
  initialPrompt = ""
}: TextTo3DConfigModalProps) => {
  const { isMobile, isTablet } = useResponsiveLayout();
  const [config, setConfig] = useState<TextTo3DConfig>({
    prompt: initialPrompt,
    artStyle: "realistic",
    negativePrompt: "",
    mode: "preview",
    targetPolycount: 10000,
    topologyType: "quad",
    texture: true,
    seedValue: undefined
  });

  useEffect(() => {
    if (initialPrompt) {
      setConfig(prev => ({ ...prev, prompt: initialPrompt }));
    }
  }, [initialPrompt]);

  const handleGenerate = async () => {
    if (!config.prompt.trim()) return;
    
    try {
      await onGenerate(config);
      onOpenChange(false);
    } catch (error) {
      console.error("Generation failed:", error);
    }
  };

  const updateConfig = (updates: Partial<TextTo3DConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  // Mobile-optimized modal sizing
  const getModalClasses = () => {
    if (isMobile) {
      return "w-full max-w-[95vw] h-[95vh] max-h-[95vh] m-2";
    }
    if (isTablet) {
      return "w-full max-w-[90vw] max-h-[90vh] mx-4";
    }
    return "sm:max-w-2xl max-h-[90vh]";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${getModalClasses()} glass-panel border-white/20 bg-figuro-darker text-white overflow-y-auto`}>
        <DialogHeader className={isMobile ? "pb-2" : ""}>
          <DialogTitle className={`flex items-center gap-2 ${isMobile ? "text-lg" : "text-xl"}`}>
            <Settings className="text-figuro-accent" size={isMobile ? 20 : 24} />
            Text to 3D Configuration
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`space-y-4 ${isMobile ? "py-2" : "py-4"}`}
        >
          {/* Prompt */}
          <div className="space-y-2">
            <Label className={`text-white/90 font-medium ${isMobile ? "text-sm" : ""}`}>
              Describe your 3D model
            </Label>
            <Textarea
              value={config.prompt}
              onChange={(e) => updateConfig({ prompt: e.target.value })}
              placeholder="A cute cartoon dragon sitting on a rock..."
              className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none ${
                isMobile ? "min-h-[80px] text-sm" : "min-h-[100px]"
              }`}
              disabled={isGenerating}
            />
          </div>

          {/* Art Style and Mode - Stack on mobile */}
          <div className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}>
            <div className="space-y-2">
              <Label className={`text-white/90 font-medium ${isMobile ? "text-sm" : ""}`}>
                Art Style
              </Label>
              <Select 
                value={config.artStyle} 
                onValueChange={(value) => updateConfig({ artStyle: value })}
                disabled={isGenerating}
              >
                <SelectTrigger className={`bg-white/10 border-white/20 text-white ${
                  isMobile ? "h-12 text-sm" : ""
                }`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-figuro-darker border-white/20 z-[100]">
                  {artStyles.map((style) => (
                    <SelectItem 
                      key={style.value} 
                      value={style.value}
                      className={`text-white hover:bg-white/10 ${isMobile ? "py-3" : ""}`}
                    >
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={`text-white/90 font-medium ${isMobile ? "text-sm" : ""}`}>
                Generation Mode
              </Label>
              <Select 
                value={config.mode} 
                onValueChange={(value: "preview" | "refine") => updateConfig({ mode: value })}
                disabled={isGenerating}
              >
                <SelectTrigger className={`bg-white/10 border-white/20 text-white ${
                  isMobile ? "h-12 text-sm" : ""
                }`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-figuro-darker border-white/20 z-[100]">
                  {modelModes.map((mode) => (
                    <SelectItem 
                      key={mode.value} 
                      value={mode.value}
                      className={`text-white hover:bg-white/10 ${isMobile ? "py-3" : ""}`}
                    >
                      <div>
                        <div className={isMobile ? "text-sm" : ""}>{mode.label}</div>
                        <div className={`text-white/60 ${isMobile ? "text-xs" : "text-xs"}`}>
                          {mode.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Settings - Enhanced mobile layout */}
          <div className={`space-y-4 p-4 rounded-lg bg-white/5 border border-white/10 ${
            isMobile ? "p-3" : ""
          }`}>
            <h3 className={`font-medium text-white/90 flex items-center gap-2 ${
              isMobile ? "text-sm" : "text-sm"
            }`}>
              <Settings size={16} />
              Advanced Settings
            </h3>

            {/* Target Polycount */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className={`text-white/80 ${isMobile ? "text-xs" : "text-sm"}`}>
                  Target Polycount
                </Label>
                <span className={`text-figuro-accent ${isMobile ? "text-xs" : "text-sm"}`}>
                  {config.targetPolycount?.toLocaleString()}
                </span>
              </div>
              <Slider
                value={[config.targetPolycount || 10000]}
                onValueChange={([value]) => updateConfig({ targetPolycount: value })}
                min={1000}
                max={50000}
                step={1000}
                className="w-full"
                disabled={isGenerating}
              />
            </div>

            {/* Topology Type */}
            <div className="space-y-2">
              <Label className={`text-white/80 ${isMobile ? "text-xs" : "text-sm"}`}>
                Topology Type
              </Label>
              <Select 
                value={config.topologyType} 
                onValueChange={(value: "quad" | "triangle") => updateConfig({ topologyType: value })}
                disabled={isGenerating}
              >
                <SelectTrigger className={`bg-white/10 border-white/20 text-white ${
                  isMobile ? "h-10 text-sm" : ""
                }`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-figuro-darker border-white/20 z-[100]">
                  {topologyTypes.map((type) => (
                    <SelectItem 
                      key={type.value} 
                      value={type.value}
                      className={`text-white hover:bg-white/10 ${isMobile ? "py-2" : ""}`}
                    >
                      <span className={isMobile ? "text-sm" : ""}>{type.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seed Value */}
            <div className="space-y-2">
              <Label className={`text-white/80 ${isMobile ? "text-xs" : "text-sm"}`}>
                Seed (Optional)
              </Label>
              <Input
                type="number"
                value={config.seedValue || ""}
                onChange={(e) => updateConfig({ seedValue: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Random seed for reproducible results"
                className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 ${
                  isMobile ? "h-10 text-sm" : ""
                }`}
                disabled={isGenerating}
              />
            </div>
          </div>

          {/* Negative Prompt */}
          <div className="space-y-2">
            <Label className={`text-white/90 font-medium ${isMobile ? "text-sm" : ""}`}>
              Negative Prompt (Optional)
            </Label>
            <Textarea
              value={config.negativePrompt}
              onChange={(e) => updateConfig({ negativePrompt: e.target.value })}
              placeholder="What you don't want in the model (low quality, blurry, etc.)"
              className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none ${
                isMobile ? "min-h-[60px] text-sm" : "min-h-[80px]"
              }`}
              disabled={isGenerating}
            />
          </div>

          {/* Generate Button - Enhanced mobile layout */}
          <div className={`flex gap-3 pt-4 ${isMobile ? "flex-col" : ""}`}>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className={`border-white/20 text-white hover:bg-white/10 ${
                isMobile ? "w-full h-12" : "flex-1"
              }`}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!config.prompt.trim() || isGenerating}
              className={`bg-figuro-accent hover:bg-figuro-accent-hover ${
                isMobile ? "w-full h-12" : "flex-1"
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2" />
                  Generate 3D Model
                </>
              )}
            </Button>
          </div>

          {/* Info - Condensed on mobile */}
          <div className={`text-center text-white/60 border-t border-white/10 pt-4 ${
            isMobile ? "text-xs" : "text-sm"
          }`}>
            <p>Generation uses Meshy-5 AI model with content moderation enabled.</p>
            <p>Typically takes 2-5 minutes depending on quality settings.</p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default TextTo3DConfigModal;
