
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sparkles, Settings, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { TextTo3DConfig } from "./types/textTo3DConfig";
import { artStyles, modelModes, topologyTypes } from "./types/textTo3DConfig";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl glass-panel border-white/20 bg-figuro-darker text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="text-figuro-accent" size={24} />
            Text to 3D Configuration
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 py-4"
        >
          {/* Prompt */}
          <div className="space-y-2">
            <Label className="text-white/90 font-medium">Describe your 3D model</Label>
            <Textarea
              value={config.prompt}
              onChange={(e) => updateConfig({ prompt: e.target.value })}
              placeholder="A cute cartoon dragon sitting on a rock..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px] resize-none"
              disabled={isGenerating}
            />
          </div>

          {/* Art Style and Mode */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/90 font-medium">Art Style</Label>
              <Select 
                value={config.artStyle} 
                onValueChange={(value) => updateConfig({ artStyle: value })}
                disabled={isGenerating}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-figuro-darker border-white/20">
                  {artStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/90 font-medium">Generation Mode</Label>
              <Select 
                value={config.mode} 
                onValueChange={(value: "preview" | "refine") => updateConfig({ mode: value })}
                disabled={isGenerating}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-figuro-darker border-white/20">
                  {modelModes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      <div>
                        <div>{mode.label}</div>
                        <div className="text-xs text-white/60">{mode.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <h3 className="text-sm font-medium text-white/90 flex items-center gap-2">
              <Settings size={16} />
              Advanced Settings
            </h3>

            {/* Target Polycount */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-white/80 text-sm">Target Polycount</Label>
                <span className="text-figuro-accent text-sm">{config.targetPolycount?.toLocaleString()}</span>
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
              <Label className="text-white/80 text-sm">Topology Type</Label>
              <Select 
                value={config.topologyType} 
                onValueChange={(value: "quad" | "triangle") => updateConfig({ topologyType: value })}
                disabled={isGenerating}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-figuro-darker border-white/20">
                  {topologyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Texture */}
            <div className="flex items-center justify-between">
              <Label className="text-white/80 text-sm">Generate Texture</Label>
              <Switch
                checked={config.texture}
                onCheckedChange={(checked) => updateConfig({ texture: checked })}
                disabled={isGenerating}
              />
            </div>

            {/* Seed Value */}
            <div className="space-y-2">
              <Label className="text-white/80 text-sm">Seed (Optional)</Label>
              <Input
                type="number"
                value={config.seedValue || ""}
                onChange={(e) => updateConfig({ seedValue: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Random seed for reproducible results"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                disabled={isGenerating}
              />
            </div>
          </div>

          {/* Negative Prompt */}
          <div className="space-y-2">
            <Label className="text-white/90 font-medium">Negative Prompt (Optional)</Label>
            <Textarea
              value={config.negativePrompt}
              onChange={(e) => updateConfig({ negativePrompt: e.target.value })}
              placeholder="What you don't want in the model (low quality, blurry, etc.)"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[80px] resize-none"
              disabled={isGenerating}
            />
          </div>

          {/* Generate Button */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!config.prompt.trim() || isGenerating}
              className="flex-1 bg-figuro-accent hover:bg-figuro-accent-hover"
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
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default TextTo3DConfigModal;
